from django.contrib import admin
from .models import SpeakingTest, AudioFile, SpeakingFeedback


class AudioFileInline(admin.TabularInline):
    model = AudioFile
    extra = 0


class SpeakingFeedbackInline(admin.StackedInline):
    model = SpeakingFeedback
    extra = 0


@admin.register(SpeakingTest)
class SpeakingTestAdmin(admin.ModelAdmin):
    list_display = ['user', 'part_number', 'status', 'duration', 'created_at']
    list_filter = ['part_number', 'status']
    search_fields = ['user__username', 'topic']
    inlines = [AudioFileInline, SpeakingFeedbackInline]


@admin.register(AudioFile)
class AudioFileAdmin(admin.ModelAdmin):
    list_display = ['speaking_test', 'duration', 'format', 'created_at']


@admin.register(SpeakingFeedback)
class SpeakingFeedbackAdmin(admin.ModelAdmin):
    list_display = ['speaking_test', 'overall_band', 'pronunciation_score', 'created_at']
