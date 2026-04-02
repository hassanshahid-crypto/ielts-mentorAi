import json
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from .models import ReadingPassage, ReadingQuestion, ReadingTest
from .serializers import (
    ReadingPassageListSerializer,
    ReadingPassageDetailSerializer,
    ReadingTestSerializer,
    ReadingTestSubmitSerializer,
    ReadingTestResultSerializer,
    ReadingPassageCreateSerializer,
    ReadingQuestionCreateSerializer,
)


class ReadingPassageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        passages = ReadingPassage.objects.all()
        difficulty = request.query_params.get('difficulty')
        if difficulty:
            passages = passages.filter(difficulty=difficulty)
        elif request.user.role == 'student':
            # Auto-filter by student's difficulty level
            passages = passages.filter(difficulty=request.user.difficulty_level)
        category = request.query_params.get('category')
        if category:
            passages = passages.filter(category__icontains=category)
        serializer = ReadingPassageListSerializer(passages, many=True)
        return Response(serializer.data)


class ReadingPassageDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        passage = get_object_or_404(ReadingPassage, pk=pk)
        serializer = ReadingPassageDetailSerializer(passage)
        return Response(serializer.data)


class ReadingPassageCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = ReadingPassageCreateSerializer(data=request.data)
        if serializer.is_valid():
            passage = serializer.save(created_by=request.user)
            questions_data = request.data.get('questions', [])
            for q_data in questions_data:
                q_serializer = ReadingQuestionCreateSerializer(data=q_data)
                if q_serializer.is_valid():
                    q_serializer.save(passage=passage)
            return Response(ReadingPassageDetailSerializer(passage).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        passage = get_object_or_404(ReadingPassage, pk=pk)
        serializer = ReadingPassageCreateSerializer(passage, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ReadingPassageDetailSerializer(passage).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        passage = get_object_or_404(ReadingPassage, pk=pk)
        passage.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReadingTestStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        passage_id = request.data.get('passage_id')
        if not passage_id:
            return Response({'error': 'passage_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        passage = get_object_or_404(ReadingPassage, pk=passage_id)
        test = ReadingTest.objects.create(
            user=request.user,
            passage=passage,
            total_questions=passage.questions.count(),
        )
        serializer = ReadingTestSerializer(test)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReadingTestSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        test = get_object_or_404(ReadingTest, pk=pk, user=request.user)
        if test.status == 'completed':
            return Response({'error': 'Test already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReadingTestSubmitSerializer(data=request.data)
        if serializer.is_valid():
            answers = serializer.validated_data['answers']
            time_spent = serializer.validated_data.get('time_spent', 0)

            questions = test.passage.questions.all()
            correct = 0
            for question in questions:
                user_answer = answers.get(str(question.id), '').strip().lower()
                correct_answer = question.correct_answer.strip().lower()
                if user_answer == correct_answer:
                    correct += 1

            total = questions.count()
            score = round((correct / total * 9) if total > 0 else 0, 1)

            test.answers = answers
            test.correct_answers = correct
            test.total_questions = total
            test.score = score
            test.time_spent = time_spent
            test.status = 'completed'
            test.completed_at = timezone.now()
            test.save()

            # Check difficulty progression
            from accounts.progression import check_and_promote
            progression = check_and_promote(request.user)

            data = ReadingTestResultSerializer(test).data
            if progression:
                data['progression'] = progression
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReadingTestResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        test = get_object_or_404(ReadingTest, pk=pk, user=request.user)
        serializer = ReadingTestResultSerializer(test)
        return Response(serializer.data)


class ReadingTestHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tests = ReadingTest.objects.filter(user=request.user, status='completed')
        serializer = ReadingTestSerializer(tests, many=True)
        return Response(serializer.data)


class GenerateReadingPassageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        difficulty = request.data.get('difficulty', 'intermediate')
        category = request.data.get('category', '')

        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.5-flash')

            prompt = f"""Generate an IELTS Reading passage with questions for a {difficulty} level student.
{f'Category/topic: {category}' if category else 'Pick an interesting academic topic.'}

Difficulty guide:
- beginner: 150-200 words, simple vocabulary, straightforward questions
- intermediate: 250-350 words, standard IELTS level
- pro: 400-500 words, complex academic language, challenging questions

Return ONLY a valid JSON object with this exact format:
{{
    "title": "<passage title>",
    "passage_text": "<the full passage text>",
    "questions": [
        {{
            "question_text": "<question>",
            "question_type": "mcq",
            "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
            "correct_answer": "<correct option text>",
            "order": 1
        }},
        {{
            "question_text": "<question>",
            "question_type": "true_false_ng",
            "options": null,
            "correct_answer": "<true/false/not given>",
            "order": 2
        }},
        {{
            "question_text": "<question>",
            "question_type": "mcq",
            "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
            "correct_answer": "<correct option text>",
            "order": 3
        }}
    ]
}}

Generate exactly 3-5 questions. Mix MCQ and True/False/Not Given types."""

            response = model.generate_content(prompt)
            text = response.text.strip()

            if text.startswith('```'):
                text = text.split('\n', 1)[1]
                text = text.rsplit('```', 1)[0]

            data = json.loads(text)
            return Response(data)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
