from django.contrib import admin
from .models import WritingTest, WritingFeedback


class WritingFeedbackInline(admin.StackedInline):
    model = WritingFeedback
    extra = 0
    readonly_fields = ['created_at']


@admin.register(WritingTest)
class WritingTestAdmin(admin.ModelAdmin):
    list_display = ['user', 'task_type', 'word_count', 'status', 'created_at']
    list_filter = ['task_type', 'status']
    search_fields = ['user__username', 'topic']
    inlines = [WritingFeedbackInline]


@admin.register(WritingFeedback)
class WritingFeedbackAdmin(admin.ModelAdmin):
    list_display = ['writing_test', 'overall_band', 'task_achievement', 'created_at']
    list_filter = ['overall_band']
