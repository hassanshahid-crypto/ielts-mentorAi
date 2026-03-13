from django.db import models
from django.conf import settings


class ReadingPassage(models.Model):
    DIFFICULTY_CHOICES = (
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    )

    title = models.CharField(max_length=255)
    passage_text = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    category = models.CharField(max_length=100, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_passages')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reading_passages'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ReadingQuestion(models.Model):
    QUESTION_TYPE_CHOICES = (
        ('mcq', 'Multiple Choice'),
        ('true_false_ng', 'True/False/Not Given'),
        ('fill_blank', 'Fill in the Blank'),
        ('matching', 'Matching'),
        ('short_answer', 'Short Answer'),
    )

    passage = models.ForeignKey(ReadingPassage, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=15, choices=QUESTION_TYPE_CHOICES)
    options = models.JSONField(blank=True, null=True, help_text='Options for MCQ/Matching as JSON array')
    correct_answer = models.CharField(max_length=500)
    explanation = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        db_table = 'reading_questions'
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class ReadingTest(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reading_tests')
    passage = models.ForeignKey(ReadingPassage, on_delete=models.CASCADE, related_name='tests')
    answers = models.JSONField(default=dict, help_text='Map of question_id to user answer')
    score = models.FloatField(default=0)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    time_spent = models.IntegerField(default=0, help_text='Time spent in seconds')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reading_tests'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.passage.title} - {self.score}/{self.total_questions}"
