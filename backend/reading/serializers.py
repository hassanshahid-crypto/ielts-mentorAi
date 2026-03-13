from rest_framework import serializers
from .models import ReadingPassage, ReadingQuestion, ReadingTest


class ReadingQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingQuestion
        fields = ['id', 'question_text', 'question_type', 'options', 'order']


class ReadingQuestionWithAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingQuestion
        fields = ['id', 'question_text', 'question_type', 'options', 'correct_answer', 'explanation', 'order']


class ReadingPassageListSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = ReadingPassage
        fields = ['id', 'title', 'difficulty', 'category', 'question_count', 'created_at']

    def get_question_count(self, obj):
        return obj.questions.count()


class ReadingPassageDetailSerializer(serializers.ModelSerializer):
    questions = ReadingQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = ReadingPassage
        fields = ['id', 'title', 'passage_text', 'difficulty', 'category', 'questions', 'created_at']


class ReadingTestSerializer(serializers.ModelSerializer):
    passage_title = serializers.CharField(source='passage.title', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ReadingTest
        fields = ['id', 'user', 'user_name', 'passage', 'passage_title', 'answers',
                  'score', 'total_questions', 'correct_answers', 'time_spent',
                  'status', 'started_at', 'completed_at', 'created_at']
        read_only_fields = ['user', 'score', 'total_questions', 'correct_answers',
                           'status', 'started_at', 'completed_at', 'created_at']


class ReadingTestSubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(child=serializers.CharField())
    time_spent = serializers.IntegerField(required=False, default=0)


class ReadingTestResultSerializer(serializers.ModelSerializer):
    passage_title = serializers.CharField(source='passage.title', read_only=True)
    questions = serializers.SerializerMethodField()

    class Meta:
        model = ReadingTest
        fields = ['id', 'passage', 'passage_title', 'answers', 'score',
                  'total_questions', 'correct_answers', 'time_spent',
                  'status', 'questions', 'started_at', 'completed_at']

    def get_questions(self, obj):
        questions = obj.passage.questions.all()
        return ReadingQuestionWithAnswerSerializer(questions, many=True).data


class ReadingPassageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingPassage
        fields = ['title', 'passage_text', 'difficulty', 'category']


class ReadingQuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReadingQuestion
        fields = ['question_text', 'question_type', 'options', 'correct_answer', 'explanation', 'order']
