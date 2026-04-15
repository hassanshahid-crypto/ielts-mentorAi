from django.db import models
from django.conf import settings


class WritingTest(models.Model):
    TASK_TYPE_CHOICES = (
        ('task1', 'Task 1'),
        ('task2', 'Task 2'),
    )
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('evaluated', 'Evaluated'),
    )

    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('pro', 'Pro'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='writing_tests')
    task_type = models.CharField(max_length=5, choices=TASK_TYPE_CHOICES)
    topic = models.TextField()
    instructions = models.TextField(blank=True)
    difficulty = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES, default='intermediate')
    writing_text = models.TextField(blank=True)
    word_count = models.IntegerField(default=0)
    time_spent = models.IntegerField(default=0, help_text='Time spent in seconds')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'writing_tests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.task_type} - {self.created_at.strftime('%Y-%m-%d')}"


class WritingFeedback(models.Model):
    writing_test = models.OneToOneField(WritingTest, on_delete=models.CASCADE, related_name='feedback')
    task_achievement = models.FloatField(default=0)
    coherence_cohesion = models.FloatField(default=0)
    lexical_resource = models.FloatField(default=0)
    grammatical_range = models.FloatField(default=0)
    overall_band = models.FloatField(default=0)
    feedback_text = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)
    ai_model_used = models.CharField(max_length=50, default='gemini-flash')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'writing_feedback'

    def __str__(self):
        return f"Feedback for {self.writing_test} - Band {self.overall_band}"
