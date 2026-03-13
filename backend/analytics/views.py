from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from writing.models import WritingTest, WritingFeedback
from speaking.models import SpeakingTest, SpeakingFeedback
from reading.models import ReadingTest


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        writing_tests = WritingTest.objects.filter(user=user, status='evaluated')
        speaking_tests = SpeakingTest.objects.filter(user=user, status='evaluated')
        reading_tests = ReadingTest.objects.filter(user=user, status='completed')

        writing_avg = WritingFeedback.objects.filter(
            writing_test__user=user
        ).aggregate(avg=Avg('overall_band'))['avg'] or 0

        speaking_avg = SpeakingFeedback.objects.filter(
            speaking_test__user=user
        ).aggregate(avg=Avg('overall_band'))['avg'] or 0

        reading_avg = reading_tests.aggregate(avg=Avg('score'))['avg'] or 0

        total_tests = writing_tests.count() + speaking_tests.count() + reading_tests.count()
        overall_avg = 0
        if total_tests > 0:
            overall_avg = round((writing_avg + speaking_avg + reading_avg) / 3, 1)

        recent_writing = writing_tests[:5].values('id', 'task_type', 'status', 'created_at')
        recent_speaking = speaking_tests[:5].values('id', 'part_number', 'status', 'created_at')
        recent_reading = reading_tests[:5].values('id', 'passage__title', 'score', 'created_at')

        return Response({
            'total_tests': total_tests,
            'writing_count': writing_tests.count(),
            'speaking_count': speaking_tests.count(),
            'reading_count': reading_tests.count(),
            'writing_avg_band': round(writing_avg, 1),
            'speaking_avg_band': round(speaking_avg, 1),
            'reading_avg_score': round(reading_avg, 1),
            'overall_avg': overall_avg,
            'recent_writing': list(recent_writing),
            'recent_speaking': list(recent_speaking),
            'recent_reading': list(recent_reading),
        })


class StudentProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        days = int(request.query_params.get('days', 30))
        since = timezone.now() - timedelta(days=days)

        writing_progress = []
        writing_tests = WritingTest.objects.filter(
            user=user, status='evaluated', created_at__gte=since
        ).select_related('feedback').order_by('created_at')
        for test in writing_tests:
            if hasattr(test, 'feedback'):
                writing_progress.append({
                    'date': test.created_at.isoformat(),
                    'band': test.feedback.overall_band,
                    'task_type': test.task_type,
                    'type': 'writing',
                })

        speaking_progress = []
        speaking_tests = SpeakingTest.objects.filter(
            user=user, status='evaluated', created_at__gte=since
        ).select_related('feedback').order_by('created_at')
        for test in speaking_tests:
            if hasattr(test, 'feedback'):
                speaking_progress.append({
                    'date': test.created_at.isoformat(),
                    'band': test.feedback.overall_band,
                    'part': test.part_number,
                    'type': 'speaking',
                })

        reading_progress = []
        reading_tests = ReadingTest.objects.filter(
            user=user, status='completed', created_at__gte=since
        ).order_by('created_at')
        for test in reading_tests:
            reading_progress.append({
                'date': test.created_at.isoformat(),
                'score': test.score,
                'type': 'reading',
            })

        return Response({
            'writing_progress': writing_progress,
            'speaking_progress': speaking_progress,
            'reading_progress': reading_progress,
        })


class AdminStudentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        students = User.objects.filter(role='student', is_active=True)
        search = request.query_params.get('search')
        if search:
            students = students.filter(
                Q(username__icontains=search) | Q(email__icontains=search)
            )

        data = []
        for student in students:
            writing_count = WritingTest.objects.filter(user=student, status='evaluated').count()
            speaking_count = SpeakingTest.objects.filter(user=student, status='evaluated').count()
            reading_count = ReadingTest.objects.filter(user=student, status='completed').count()

            writing_avg = WritingFeedback.objects.filter(
                writing_test__user=student
            ).aggregate(avg=Avg('overall_band'))['avg'] or 0

            speaking_avg = SpeakingFeedback.objects.filter(
                speaking_test__user=student
            ).aggregate(avg=Avg('overall_band'))['avg'] or 0

            reading_avg = ReadingTest.objects.filter(
                user=student, status='completed'
            ).aggregate(avg=Avg('score'))['avg'] or 0

            total = writing_count + speaking_count + reading_count
            avg_score = round((writing_avg + speaking_avg + reading_avg) / 3, 1) if total > 0 else 0

            data.append({
                'id': student.id,
                'username': student.username,
                'email': student.email,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'total_tests': total,
                'writing_tests': writing_count,
                'speaking_tests': speaking_count,
                'reading_tests': reading_count,
                'avg_score': avg_score,
                'last_active': student.last_login,
                'joined': student.created_at,
            })

        return Response(data)


class AdminStudentDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        student = User.objects.get(pk=pk, role='student')

        writing_tests = WritingTest.objects.filter(user=student, status='evaluated').select_related('feedback')
        speaking_tests = SpeakingTest.objects.filter(user=student, status='evaluated').select_related('feedback')
        reading_tests = ReadingTest.objects.filter(user=student, status='completed')

        writing_data = []
        for t in writing_tests:
            entry = {'date': t.created_at.isoformat(), 'task_type': t.task_type, 'word_count': t.word_count}
            if hasattr(t, 'feedback'):
                entry.update({
                    'band': t.feedback.overall_band,
                    'task_achievement': t.feedback.task_achievement,
                    'coherence': t.feedback.coherence_cohesion,
                    'lexical': t.feedback.lexical_resource,
                    'grammar': t.feedback.grammatical_range,
                })
            writing_data.append(entry)

        speaking_data = []
        for t in speaking_tests:
            entry = {'date': t.created_at.isoformat(), 'part': t.part_number, 'duration': t.duration}
            if hasattr(t, 'feedback'):
                entry.update({
                    'band': t.feedback.overall_band,
                    'pronunciation': t.feedback.pronunciation_score,
                    'fluency': t.feedback.fluency_score,
                    'grammar': t.feedback.grammar_score,
                    'coherence': t.feedback.coherence_score,
                    'vocabulary': t.feedback.vocabulary_score,
                })
            speaking_data.append(entry)

        reading_data = [{
            'date': t.created_at.isoformat(),
            'passage': t.passage.title,
            'score': t.score,
            'correct': t.correct_answers,
            'total': t.total_questions,
            'time': t.time_spent,
        } for t in reading_tests]

        return Response({
            'student': {
                'id': student.id,
                'username': student.username,
                'email': student.email,
                'first_name': student.first_name,
                'last_name': student.last_name,
                'joined': student.created_at,
            },
            'writing_tests': writing_data,
            'speaking_tests': speaking_data,
            'reading_tests': reading_data,
        })


class AdminOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_students = User.objects.filter(role='student').count()
        total_writing = WritingTest.objects.filter(status='evaluated').count()
        total_speaking = SpeakingTest.objects.filter(status='evaluated').count()
        total_reading = ReadingTest.objects.filter(status='completed').count()

        last_7_days = timezone.now() - timedelta(days=7)
        active_students = User.objects.filter(
            role='student', last_login__gte=last_7_days
        ).count()

        avg_writing = WritingFeedback.objects.aggregate(avg=Avg('overall_band'))['avg'] or 0
        avg_speaking = SpeakingFeedback.objects.aggregate(avg=Avg('overall_band'))['avg'] or 0
        avg_reading = ReadingTest.objects.filter(status='completed').aggregate(avg=Avg('score'))['avg'] or 0

        return Response({
            'total_students': total_students,
            'active_students': active_students,
            'total_tests': total_writing + total_speaking + total_reading,
            'total_writing_tests': total_writing,
            'total_speaking_tests': total_speaking,
            'total_reading_tests': total_reading,
            'avg_writing_band': round(avg_writing, 1),
            'avg_speaking_band': round(avg_speaking, 1),
            'avg_reading_score': round(avg_reading, 1),
        })
