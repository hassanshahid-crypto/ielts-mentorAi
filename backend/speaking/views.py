import json
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import SpeakingTest, AudioFile, SpeakingFeedback
from .serializers import (
    SpeakingTestSerializer,
    SpeakingTestCreateSerializer,
    SpeakingTestSubmitSerializer,
    SpeakingFeedbackSerializer,
    AudioFileSerializer,
)


def evaluate_speaking_with_ai(transcript, topic, part_number):
    """Evaluate speaking using Google Gemini AI and return structured scores."""
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"""You are an expert IELTS examiner. Evaluate the following IELTS Speaking Part {part_number} transcript.

Topic: {topic}

Student's Transcript:
{transcript}

Evaluate based on the four IELTS Speaking criteria and provide scores from 0.0 to 9.0 (in 0.5 increments):
1. Fluency and Coherence
2. Lexical Resource (Vocabulary)
3. Grammatical Range and Accuracy
4. Pronunciation

Return ONLY a valid JSON object with this exact format:
{{
    "pronunciation_score": <score>,
    "fluency_score": <score>,
    "grammar_score": <score>,
    "coherence_score": <score>,
    "vocabulary_score": <score>,
    "overall_band": <score>,
    "feedback_text": "<detailed feedback paragraph>",
    "suggestions": "<specific improvement suggestions>"
}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()

        if text.startswith('```'):
            text = text.split('\n', 1)[1]
            text = text.rsplit('```', 1)[0]

        return json.loads(text)
    except Exception as e:
        word_count = len(transcript.split())
        base_score = min(6.0, max(3.0, word_count / 30))
        return {
            "pronunciation_score": base_score,
            "fluency_score": base_score,
            "grammar_score": base_score,
            "coherence_score": base_score,
            "vocabulary_score": base_score,
            "overall_band": base_score,
            "feedback_text": f"Auto-evaluated based on transcript length ({word_count} words). Configure Gemini API key for detailed AI feedback. Error: {str(e)}",
            "suggestions": "Practice speaking fluently without long pauses, use a variety of vocabulary, and try to self-correct grammatical errors.",
        }


class SpeakingTestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            tests = SpeakingTest.objects.filter(user__role='admin')
        else:
            tests = SpeakingTest.objects.filter(user=request.user)
        part = request.query_params.get('part')
        if part:
            tests = tests.filter(part_number=part)
        serializer = SpeakingTestSerializer(tests, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SpeakingTestCreateSerializer(data=request.data)
        if serializer.is_valid():
            test = serializer.save(user=request.user)
            return Response(SpeakingTestSerializer(test).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SpeakingTemplatesView(APIView):
    """Return admin-created speaking prompts filtered by difficulty + part."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        templates = SpeakingTest.objects.filter(user__role='admin')
        difficulty = request.query_params.get('difficulty') or getattr(request.user, 'difficulty_level', None)
        if difficulty:
            templates = templates.filter(difficulty=difficulty)
        part = request.query_params.get('part')
        if part:
            templates = templates.filter(part_number=part)
        serializer = SpeakingTestSerializer(templates, many=True)
        return Response(serializer.data)


class SpeakingTestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_test(self, request, pk):
        if request.user.role == 'admin':
            return get_object_or_404(SpeakingTest, pk=pk)
        return get_object_or_404(SpeakingTest, pk=pk, user=request.user)

    def get(self, request, pk):
        test = self._get_test(request, pk)
        serializer = SpeakingTestSerializer(test)
        return Response(serializer.data)

    def put(self, request, pk):
        test = self._get_test(request, pk)
        serializer = SpeakingTestSerializer(test, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        test = self._get_test(request, pk)
        test.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SpeakingTestSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        test = get_object_or_404(SpeakingTest, pk=pk, user=request.user)
        if test.status == 'evaluated':
            return Response({'error': 'Test already evaluated.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = SpeakingTestSubmitSerializer(data=request.data)
        if serializer.is_valid():
            transcript = serializer.validated_data['transcript']
            duration = serializer.validated_data.get('duration', 0)

            test.transcript = transcript
            test.duration = duration
            test.status = 'completed'
            test.save()

            ai_result = evaluate_speaking_with_ai(transcript, test.topic, test.part_number)

            SpeakingFeedback.objects.create(
                speaking_test=test,
                pronunciation_score=ai_result['pronunciation_score'],
                fluency_score=ai_result['fluency_score'],
                grammar_score=ai_result['grammar_score'],
                coherence_score=ai_result['coherence_score'],
                vocabulary_score=ai_result['vocabulary_score'],
                overall_band=ai_result['overall_band'],
                feedback_text=ai_result['feedback_text'],
                suggestions=ai_result['suggestions'],
            )

            test.status = 'evaluated'
            test.save()

            # Check difficulty progression
            from accounts.progression import check_and_promote
            progression = check_and_promote(request.user)

            data = SpeakingTestSerializer(test).data
            if progression:
                data['progression'] = progression
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AudioFileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        test = get_object_or_404(SpeakingTest, pk=pk, user=request.user)
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No audio file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        audio = AudioFile.objects.create(
            speaking_test=test,
            file=file,
            duration=request.data.get('duration', 0),
            format=request.data.get('format', 'webm'),
        )
        return Response(AudioFileSerializer(audio).data, status=status.HTTP_201_CREATED)


class SpeakingFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.role == 'admin':
            test = get_object_or_404(SpeakingTest, pk=pk)
        else:
            test = get_object_or_404(SpeakingTest, pk=pk, user=request.user)
        if not hasattr(test, 'feedback'):
            return Response({'error': 'No feedback available.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SpeakingFeedbackSerializer(test.feedback)
        return Response(serializer.data)


class GenerateSpeakingTopicView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        part_number = request.data.get('part_number', 1)
        difficulty = request.data.get('difficulty', 'intermediate')
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""Generate a single IELTS Speaking Part {part_number} topic for a {difficulty} level student.
Part 1: Short personal questions. Part 2: Long turn with cue card. Part 3: Abstract discussion questions.
Difficulty: beginner=simple everyday, intermediate=standard IELTS, pro=complex analytical.
Return ONLY the topic text."""
            response = model.generate_content(prompt)
            return Response({'topic': response.text.strip()})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateSpeakingTestSetView(APIView):
    """Generate a complete 3-part IELTS Speaking test (Part 1 + Part 2 cue card + Part 3 discussion) sharing one theme."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        difficulty = request.data.get('difficulty', 'intermediate')
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""Generate a complete IELTS Speaking test for a {difficulty} level student. The test must have 3 parts that share ONE coherent theme (Part 2 and Part 3 must be tightly linked — Part 3 expands abstractly on the Part 2 cue card topic).

Difficulty guidance: beginner=simple everyday topics, intermediate=standard IELTS topics, pro=complex analytical topics.

Return ONLY a valid JSON object with this exact structure:
{{
    "theme": "<one short phrase, e.g. 'Hometown and Travel'>",
    "part1": "<3-4 short personal warm-up questions related to the theme, separated by spaces>",
    "part2": "<a complete cue card prompt: 'Describe ... You should say: ... ... ... and explain ...'>",
    "part3": "<2-3 abstract discussion questions about the same theme, expanding on Part 2>"
}}"""
            response = model.generate_content(prompt)
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('\n', 1)[1]
                text = text.rsplit('```', 1)[0]
            import json
            data = json.loads(text)
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateSpeakingTestSetView(APIView):
    """Save a 3-part speaking test set as 3 linked SpeakingTest rows sharing a set_id."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Forbidden.'}, status=status.HTTP_403_FORBIDDEN)
        difficulty = request.data.get('difficulty', 'intermediate')
        theme = request.data.get('theme', '').strip()
        part1 = request.data.get('part1', '').strip()
        part2 = request.data.get('part2', '').strip()
        part3 = request.data.get('part3', '').strip()
        if not (part1 and part2 and part3):
            return Response({'error': 'All three parts are required.'}, status=status.HTTP_400_BAD_REQUEST)
        import uuid
        set_id = uuid.uuid4()
        created = []
        for part_number, topic in [(1, part1), (2, part2), (3, part3)]:
            test = SpeakingTest.objects.create(
                user=request.user,
                topic=topic,
                part_number=part_number,
                difficulty=difficulty,
                set_id=set_id,
                theme=theme,
            )
            created.append(test)
        serializer = SpeakingTestSerializer(created, many=True)
        return Response({'set_id': str(set_id), 'theme': theme, 'tests': serializer.data}, status=status.HTTP_201_CREATED)


class SpeakingTestSetView(APIView):
    """Return a random complete 3-part test set for the student's level (or specified difficulty)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        difficulty = request.query_params.get('difficulty') or getattr(request.user, 'difficulty_level', 'intermediate')
        # Find sets that have all 3 parts at this difficulty
        from django.db.models import Count
        complete_sets = (
            SpeakingTest.objects.filter(user__role='admin', difficulty=difficulty, set_id__isnull=False)
            .values('set_id')
            .annotate(part_count=Count('part_number', distinct=True))
            .filter(part_count=3)
        )
        set_ids = [s['set_id'] for s in complete_sets]
        if not set_ids:
            return Response({'set_id': None, 'parts': []})
        import random
        chosen = random.choice(set_ids)
        tests = SpeakingTest.objects.filter(set_id=chosen).order_by('part_number')
        serializer = SpeakingTestSerializer(tests, many=True)
        return Response({'set_id': str(chosen), 'theme': tests.first().theme if tests else '', 'parts': serializer.data})


def evaluate_full_speaking_session_with_ai(theme, p1_topic, p1_transcript, p2_topic, p2_transcript, p3_topic, p3_transcript):
    """Evaluate a complete 3-part IELTS Speaking session in one AI call."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""You are an expert IELTS examiner. Evaluate the following complete IELTS Speaking test session as a whole — Parts 1, 2, and 3 share the theme "{theme}".

PART 1 — Introduction
Examiner topic: {p1_topic}
Student response:
{p1_transcript}

PART 2 — Long Turn (Cue Card)
Examiner topic: {p2_topic}
Student response:
{p2_transcript}

PART 3 — Discussion
Examiner topic: {p3_topic}
Student response:
{p3_transcript}

Score the overall session on the 4 IELTS Speaking criteria (0.0 to 9.0, in 0.5 increments), considering ALL three parts together — fluency, lexical range, grammar, and pronunciation across the whole session.

Return ONLY a valid JSON object in this exact format:
{{
    "pronunciation_score": <score>,
    "fluency_score": <score>,
    "grammar_score": <score>,
    "coherence_score": <score>,
    "vocabulary_score": <score>,
    "overall_band": <score>,
    "feedback_text": "<detailed paragraph covering all 3 parts>",
    "suggestions": "<specific improvement suggestions>"
}}"""
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[1]
            text = text.rsplit('```', 1)[0]
        return json.loads(text)
    except Exception as e:
        total_words = len((p1_transcript + ' ' + p2_transcript + ' ' + p3_transcript).split())
        base_score = min(6.5, max(3.0, total_words / 80))
        return {
            "pronunciation_score": base_score,
            "fluency_score": base_score,
            "grammar_score": base_score,
            "coherence_score": base_score,
            "vocabulary_score": base_score,
            "overall_band": base_score,
            "feedback_text": f"Auto-evaluated based on total response length ({total_words} words across 3 parts). Configure Gemini API for detailed AI feedback. Error: {str(e)}",
            "suggestions": "Aim for fluent, varied responses across all three parts. Use a wider range of vocabulary and develop your ideas more fully in Parts 2 and 3.",
        }


class SubmitSpeakingSessionView(APIView):
    """Accept transcripts for all 3 parts of a speaking test, evaluate as one session, return combined feedback."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        set_id = request.data.get('set_id')
        if not set_id:
            return Response({'error': 'set_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            template_parts = SpeakingTest.objects.filter(set_id=set_id, user__role='admin').order_by('part_number')
            if template_parts.count() != 3:
                return Response({'error': 'Test set must have all 3 parts.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'Invalid set_id.'}, status=status.HTTP_400_BAD_REQUEST)

        templates_by_part = {t.part_number: t for t in template_parts}
        p1_t = (request.data.get('part1_transcript') or '').strip()
        p2_t = (request.data.get('part2_transcript') or '').strip()
        p3_t = (request.data.get('part3_transcript') or '').strip()
        if not (p1_t and p2_t and p3_t):
            return Response({'error': 'All three transcripts are required.'}, status=status.HTTP_400_BAD_REQUEST)
        durations = {
            1: int(request.data.get('part1_duration') or 0),
            2: int(request.data.get('part2_duration') or 0),
            3: int(request.data.get('part3_duration') or 0),
        }
        transcripts = {1: p1_t, 2: p2_t, 3: p3_t}

        import uuid as _uuid
        session_id = _uuid.uuid4()
        theme = templates_by_part[1].theme or ''
        difficulty = templates_by_part[1].difficulty

        # Create the 3 student attempt rows
        created = []
        for part_number in (1, 2, 3):
            tpl = templates_by_part[part_number]
            test = SpeakingTest.objects.create(
                user=request.user,
                topic=tpl.topic,
                part_number=part_number,
                difficulty=difficulty,
                theme=theme,
                session_id=session_id,
                transcript=transcripts[part_number],
                duration=durations[part_number],
                status='completed',
            )
            created.append(test)

        # One holistic AI evaluation
        ai_result = evaluate_full_speaking_session_with_ai(
            theme,
            templates_by_part[1].topic, p1_t,
            templates_by_part[2].topic, p2_t,
            templates_by_part[3].topic, p3_t,
        )

        # Attach feedback to the Part 1 row (canonical for the session)
        feedback = SpeakingFeedback.objects.create(
            speaking_test=created[0],
            pronunciation_score=ai_result['pronunciation_score'],
            fluency_score=ai_result['fluency_score'],
            grammar_score=ai_result['grammar_score'],
            coherence_score=ai_result['coherence_score'],
            vocabulary_score=ai_result['vocabulary_score'],
            overall_band=ai_result['overall_band'],
            feedback_text=ai_result['feedback_text'],
            suggestions=ai_result['suggestions'],
        )
        for t in created:
            t.status = 'evaluated'
            t.save()

        # Trigger progression check
        from accounts.progression import check_and_promote
        progression = check_and_promote(request.user)

        data = {
            'session_id': str(session_id),
            'theme': theme,
            'feedback': SpeakingFeedbackSerializer(feedback).data,
            'tests': SpeakingTestSerializer(created, many=True).data,
            'canonical_test_id': created[0].id,
        }
        if progression:
            data['progression'] = progression
        return Response(data, status=status.HTTP_201_CREATED)
