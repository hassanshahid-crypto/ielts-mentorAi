from django.db import models
from django.conf import settings


class SpeakingTest(models.Model):
    PART_CHOICES = (
        (1, 'Part 1 - Introduction'),
        (2, 'Part 2 - Long Turn'),
        (3, 'Part 3 - Discussion'),
    )
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('evaluated', 'Evaluated'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='speaking_tests')
    topic = models.TextField()
    part_number = models.IntegerField(choices=PART_CHOICES, default=1)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='in_progress')
    transcript = models.TextField(blank=True)
    duration = models.IntegerField(default=0, help_text='Duration in seconds')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'speaking_tests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - Part {self.part_number} - {self.created_at.strftime('%Y-%m-%d')}"


class AudioFile(models.Model):
    speaking_test = models.ForeignKey(SpeakingTest, on_delete=models.CASCADE, related_name='audio_files')
    file = models.FileField(upload_to='audio/')
    duration = models.FloatField(default=0)
    format = models.CharField(max_length=10, default='webm')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audio_files'

    def __str__(self):
        return f"Audio for {self.speaking_test}"


class SpeakingFeedback(models.Model):
    speaking_test = models.OneToOneField(SpeakingTest, on_delete=models.CASCADE, related_name='feedback')
    pronunciation_score = models.FloatField(default=0)
    fluency_score = models.FloatField(default=0)
    grammar_score = models.FloatField(default=0)
    coherence_score = models.FloatField(default=0)
    vocabulary_score = models.FloatField(default=0)
    overall_band = models.FloatField(default=0)
    feedback_text = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)
    ai_model_used = models.CharField(max_length=50, default='gemini-flash')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'speaking_feedback'

    def __str__(self):
        return f"Feedback for {self.speaking_test} - Band {self.overall_band}"
