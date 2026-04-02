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
            tests = SpeakingTest.objects.all()
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
