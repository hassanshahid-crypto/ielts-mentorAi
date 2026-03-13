from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.StudentDashboardView.as_view(), name='student-dashboard'),
    path('progress/', views.StudentProgressView.as_view(), name='student-progress'),
    path('admin/students/', views.AdminStudentListView.as_view(), name='admin-students'),
    path('admin/students/<int:pk>/', views.AdminStudentDetailView.as_view(), name='admin-student-detail'),
    path('admin/overview/', views.AdminOverviewView.as_view(), name='admin-overview'),
]
