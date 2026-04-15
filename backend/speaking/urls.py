from django.urls import path
from . import views

urlpatterns = [
    path('tests/', views.SpeakingTestListCreateView.as_view(), name='speaking-tests'),
    path('templates/', views.SpeakingTemplatesView.as_view(), name='speaking-templates'),
    path('test-set/', views.SpeakingTestSetView.as_view(), name='speaking-test-set'),
    path('test-set/create/', views.CreateSpeakingTestSetView.as_view(), name='speaking-test-set-create'),
    path('session/submit/', views.SubmitSpeakingSessionView.as_view(), name='speaking-session-submit'),
    path('tests/<int:pk>/', views.SpeakingTestDetailView.as_view(), name='speaking-test-detail'),
    path('tests/<int:pk>/submit/', views.SpeakingTestSubmitView.as_view(), name='speaking-test-submit'),
    path('tests/<int:pk>/audio/', views.AudioFileUploadView.as_view(), name='speaking-audio-upload'),
    path('tests/<int:pk>/feedback/', views.SpeakingFeedbackView.as_view(), name='speaking-feedback'),
    path('generate-topic/', views.GenerateSpeakingTopicView.as_view(), name='speaking-generate-topic'),
    path('generate-test-set/', views.GenerateSpeakingTestSetView.as_view(), name='speaking-generate-test-set'),
]
