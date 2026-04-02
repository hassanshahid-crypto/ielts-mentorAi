import json
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import WritingTest, WritingFeedback
from .serializers import (
    WritingTestSerializer,
    WritingTestCreateSerializer,
    WritingTestSubmitSerializer,
    WritingFeedbackSerializer,
)


def evaluate_writing_with_ai(writing_text, task_type, topic):
    """Evaluate writing using Google Gemini AI and return structured scores."""
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"""You are an expert IELTS examiner. Evaluate the following IELTS {task_type.replace('task', 'Task ')} writing response.

Topic: {topic}

Student's Response:
{writing_text}

Evaluate based on the four IELTS Writing criteria and provide scores from 0.0 to 9.0 (in 0.5 increments):
1. Task Achievement/Response
2. Coherence and Cohesion
3. Lexical Resource
4. Grammatical Range and Accuracy

Return ONLY a valid JSON object with this exact format:
{{
    "task_achievement": <score>,
    "coherence_cohesion": <score>,
    "lexical_resource": <score>,
    "grammatical_range": <score>,
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
        word_count = len(writing_text.split())
        base_score = min(6.0, max(3.0, word_count / 50))
        return {
            "task_achievement": base_score,
            "coherence_cohesion": base_score,
            "lexical_resource": base_score,
            "grammatical_range": base_score,
            "overall_band": base_score,
            "feedback_text": f"Auto-evaluated based on word count ({word_count} words). For detailed AI feedback, please configure the Gemini API key. Error: {str(e)}",
            "suggestions": "Ensure your response fully addresses the topic, use a range of vocabulary and grammatical structures, and organize your ideas clearly with proper paragraphing.",
        }


class WritingTestListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == 'admin':
            tests = WritingTest.objects.all()
        else:
            tests = WritingTest.objects.filter(user=request.user)
        task_type = request.query_params.get('task_type')
        if task_type:
            tests = tests.filter(task_type=task_type)
        serializer = WritingTestSerializer(tests, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WritingTestCreateSerializer(data=request.data)
        if serializer.is_valid():
            test = serializer.save(user=request.user)
            return Response(WritingTestSerializer(test).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WritingTestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_test(self, request, pk):
        if request.user.role == 'admin':
            return get_object_or_404(WritingTest, pk=pk)
        return get_object_or_404(WritingTest, pk=pk, user=request.user)

    def get(self, request, pk):
        test = self._get_test(request, pk)
        serializer = WritingTestSerializer(test)
        return Response(serializer.data)

    def put(self, request, pk):
        test = self._get_test(request, pk)
        serializer = WritingTestSerializer(test, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        test = self._get_test(request, pk)
        test.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WritingTestSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        test = get_object_or_404(WritingTest, pk=pk, user=request.user)
        if test.status == 'evaluated':
            return Response({'error': 'Test already evaluated.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = WritingTestSubmitSerializer(data=request.data)
        if serializer.is_valid():
            writing_text = serializer.validated_data['writing_text']
            time_spent = serializer.validated_data.get('time_spent', 0)

            test.writing_text = writing_text
            test.word_count = len(writing_text.split())
            test.time_spent = time_spent
            test.status = 'submitted'
            test.save()

            ai_result = evaluate_writing_with_ai(writing_text, test.task_type, test.topic)

            feedback = WritingFeedback.objects.create(
                writing_test=test,
                task_achievement=ai_result['task_achievement'],
                coherence_cohesion=ai_result['coherence_cohesion'],
                lexical_resource=ai_result['lexical_resource'],
                grammatical_range=ai_result['grammatical_range'],
                overall_band=ai_result['overall_band'],
                feedback_text=ai_result['feedback_text'],
                suggestions=ai_result['suggestions'],
            )

            test.status = 'evaluated'
            test.save()

            # Check difficulty progression
            from accounts.progression import check_and_promote
            progression = check_and_promote(request.user)

            data = WritingTestSerializer(test).data
            if progression:
                data['progression'] = progression
            return Response(data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WritingFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        if request.user.role == 'admin':
            test = get_object_or_404(WritingTest, pk=pk)
        else:
            test = get_object_or_404(WritingTest, pk=pk, user=request.user)
        if not hasattr(test, 'feedback'):
            return Response({'error': 'No feedback available.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = WritingFeedbackSerializer(test.feedback)
        return Response(serializer.data)


class GenerateWritingTopicView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task_type = request.data.get('task_type', 'task2')
        difficulty = request.data.get('difficulty', 'intermediate')
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""Generate a single IELTS Writing {task_type.replace('task', 'Task ')} topic/prompt for a {difficulty} level student.
The topic should be appropriate for the difficulty level:
- beginner: simple everyday topics
- intermediate: standard IELTS exam topics
- pro: complex analytical topics

Return ONLY the topic text, no extra explanation."""
            response = model.generate_content(prompt)
            return Response({'topic': response.text.strip()})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
