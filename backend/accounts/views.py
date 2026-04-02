import json
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Registration successful.',
                'user': UserProfileSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful.',
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'user': UserProfileSerializer(user).data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password changed successfully.'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


PLACEMENT_QUESTIONS = {
    "reading": {
        "passage": "The development of the Internet has fundamentally changed modern communication. Before the digital age, people relied on letters, telegrams, and landline telephones to stay in touch. The introduction of email in the 1990s revolutionized personal and business communication, making it possible to send messages instantly across the globe. Social media platforms, which emerged in the early 2000s, further transformed how people interact, allowing users to share updates, photos, and videos with large audiences. However, these advances have also raised concerns about privacy, misinformation, and the impact of screen time on mental health. Despite these challenges, digital communication continues to evolve, with new technologies like artificial intelligence and virtual reality promising to reshape how we connect with one another.",
        "questions": [
            {
                "id": "r1",
                "question": "What did people rely on before the digital age for communication?",
                "options": [
                    "Email and social media",
                    "Letters, telegrams, and landline telephones",
                    "Virtual reality and AI",
                    "Text messages and video calls"
                ],
                "correct_answer": "Letters, telegrams, and landline telephones"
            },
            {
                "id": "r2",
                "question": "When did email revolutionize communication?",
                "options": ["1970s", "1980s", "1990s", "2000s"],
                "correct_answer": "1990s"
            },
            {
                "id": "r3",
                "question": "What concern is NOT mentioned about digital communication?",
                "options": [
                    "Privacy issues",
                    "Misinformation",
                    "High costs",
                    "Impact on mental health"
                ],
                "correct_answer": "High costs"
            }
        ]
    },
    "writing_prompt": "Some people believe that technology has made our lives easier, while others argue it has created new problems. Discuss both views and give your opinion. Write at least 100 words.",
    "speaking_prompt": "Describe a skill you learned recently. You should say: what the skill is, how you learned it, why you decided to learn it, and explain how you felt after learning it. Speak for at least 1 minute."
}


def evaluate_placement_writing(writing_text):
    """Evaluate placement writing using Gemini AI."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"""You are an expert IELTS examiner. Evaluate this short writing sample and give an overall band score from 0.0 to 9.0.

Student's Response:
{writing_text}

Return ONLY a valid JSON object: {{"overall_band": <score>, "feedback": "<brief feedback>"}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('```', 1)[0]
        result = json.loads(text)
        return float(result.get('overall_band', 4.0))
    except Exception:
        word_count = len(writing_text.split())
        return min(6.0, max(3.0, word_count / 50))


def evaluate_placement_speaking(transcript):
    """Evaluate placement speaking using Gemini AI."""
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')

        prompt = f"""You are an expert IELTS examiner. Evaluate this speaking transcript and give an overall band score from 0.0 to 9.0.

Student's Transcript:
{transcript}

Return ONLY a valid JSON object: {{"overall_band": <score>, "feedback": "<brief feedback>"}}"""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('```', 1)[0]
        result = json.loads(text)
        return float(result.get('overall_band', 4.0))
    except Exception:
        word_count = len(transcript.split())
        return min(6.0, max(3.0, word_count / 30))


class PlacementQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.has_completed_placement:
            return Response({'error': 'Placement test already completed.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PLACEMENT_QUESTIONS)


class PlacementSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.has_completed_placement:
            return Response({'error': 'Placement test already completed.'}, status=status.HTTP_400_BAD_REQUEST)

        reading_answers = request.data.get('reading_answers', {})
        writing_text = request.data.get('writing_text', '')
        speaking_transcript = request.data.get('speaking_transcript', '')

        # Score reading
        correct = 0
        total = len(PLACEMENT_QUESTIONS['reading']['questions'])
        for q in PLACEMENT_QUESTIONS['reading']['questions']:
            if reading_answers.get(q['id'], '').strip() == q['correct_answer']:
                correct += 1
        reading_score = round((correct / total * 9) if total > 0 else 0, 1)

        # Score writing and speaking via AI
        writing_score = evaluate_placement_writing(writing_text) if writing_text.strip() else 0
        speaking_score = evaluate_placement_speaking(speaking_transcript) if speaking_transcript.strip() else 0

        avg_score = round((reading_score + writing_score + speaking_score) / 3, 1)

        if avg_score >= 6.5:
            level = 'pro'
        elif avg_score >= 4.5:
            level = 'intermediate'
        else:
            level = 'beginner'

        user.difficulty_level = level
        user.has_completed_placement = True
        user.save()

        return Response({
            'difficulty_level': level,
            'reading_score': reading_score,
            'writing_score': round(writing_score, 1),
            'speaking_score': round(speaking_score, 1),
            'avg_score': avg_score,
        })


class ProgressionCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from accounts.progression import check_and_promote
        result = check_and_promote(request.user)
        if result:
            return Response(result)
        return Response({'current_level': request.user.difficulty_level, 'is_max_level': False})
