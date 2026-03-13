from rest_framework import serializers
from .models import WritingTest, WritingFeedback


class WritingFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = WritingFeedback
        fields = '__all__'
        read_only_fields = ['writing_test', 'created_at']


class WritingTestSerializer(serializers.ModelSerializer):
    feedback = WritingFeedbackSerializer(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = WritingTest
        fields = ['id', 'user', 'user_name', 'task_type', 'topic', 'instructions',
                  'writing_text', 'word_count', 'time_spent', 'status',
                  'feedback', 'created_at', 'updated_at']
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']


class WritingTestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WritingTest
        fields = ['task_type', 'topic', 'instructions']


class WritingTestSubmitSerializer(serializers.Serializer):
    writing_text = serializers.CharField()
    time_spent = serializers.IntegerField(required=False, default=0)
