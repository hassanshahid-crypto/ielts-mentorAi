from django.urls import path
from . import views

urlpatterns = [
    path('tests/', views.WritingTestListCreateView.as_view(), name='writing-tests'),
    path('tests/<int:pk>/', views.WritingTestDetailView.as_view(), name='writing-test-detail'),
    path('tests/<int:pk>/submit/', views.WritingTestSubmitView.as_view(), name='writing-test-submit'),
    path('tests/<int:pk>/feedback/', views.WritingFeedbackView.as_view(), name='writing-feedback'),
]
