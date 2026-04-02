from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('placement/questions/', views.PlacementQuestionsView.as_view(), name='placement-questions'),
    path('placement/submit/', views.PlacementSubmitView.as_view(), name='placement-submit'),
    path('progression/', views.ProgressionCheckView.as_view(), name='progression-check'),
]
