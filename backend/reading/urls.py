from django.urls import path
from . import views

urlpatterns = [
    path('passages/', views.ReadingPassageListView.as_view(), name='reading-passages'),
    path('passages/<int:pk>/', views.ReadingPassageDetailView.as_view(), name='reading-passage-detail'),
    path('passages/create/', views.ReadingPassageCreateView.as_view(), name='reading-passage-create'),
    path('passages/<int:pk>/edit/', views.ReadingPassageCreateView.as_view(), name='reading-passage-edit'),
    path('tests/start/', views.ReadingTestStartView.as_view(), name='reading-test-start'),
    path('tests/<int:pk>/submit/', views.ReadingTestSubmitView.as_view(), name='reading-test-submit'),
    path('tests/<int:pk>/result/', views.ReadingTestResultView.as_view(), name='reading-test-result'),
    path('tests/history/', views.ReadingTestHistoryView.as_view(), name='reading-test-history'),
]
