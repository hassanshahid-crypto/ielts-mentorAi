from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from django.utils import timezone
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

            return Response(ReadingTestResultSerializer(test).data)
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
