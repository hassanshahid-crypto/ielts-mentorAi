from rest_framework import serializers
from .models import SpeakingTest, AudioFile, SpeakingFeedback


class SpeakingFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpeakingFeedback
        fields = '__all__'
        read_only_fields = ['speaking_test', 'created_at']


class AudioFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioFile
        fields = '__all__'
        read_only_fields = ['speaking_test', 'created_at']


class SpeakingTestSerializer(serializers.ModelSerializer):
    feedback = SpeakingFeedbackSerializer(read_only=True)
    audio_files = AudioFileSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = SpeakingTest
        fields = ['id', 'user', 'user_name', 'topic', 'part_number', 'status',
                  'transcript', 'duration', 'feedback', 'audio_files',
                  'created_at', 'updated_at']
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']


class SpeakingTestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SpeakingTest
        fields = ['topic', 'part_number']


class SpeakingTestSubmitSerializer(serializers.Serializer):
    transcript = serializers.CharField()
    duration = serializers.IntegerField(required=False, default=0)
