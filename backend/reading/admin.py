from django.contrib import admin
from .models import ReadingPassage, ReadingQuestion, ReadingTest


class ReadingQuestionInline(admin.TabularInline):
    model = ReadingQuestion
    extra = 1


@admin.register(ReadingPassage)
class ReadingPassageAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'category', 'created_at']
    list_filter = ['difficulty', 'category']
    search_fields = ['title']
    inlines = [ReadingQuestionInline]


@admin.register(ReadingQuestion)
class ReadingQuestionAdmin(admin.ModelAdmin):
    list_display = ['passage', 'question_type', 'order']
    list_filter = ['question_type']


@admin.register(ReadingTest)
class ReadingTestAdmin(admin.ModelAdmin):
    list_display = ['user', 'passage', 'score', 'correct_answers', 'total_questions', 'status', 'created_at']
    list_filter = ['status']
    search_fields = ['user__username']
