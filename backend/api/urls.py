from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/user/', views.get_user, name='user'),
    
    # Product endpoints
    path('products/search/', views.search_products, name='search_products'),
    path('products/<str:id>/', views.get_product, name='get_product'),
    path('products/similar/<str:id>/', views.get_similar_products, name='similar_products'),
    path('products/recommended/', views.get_recommended_products, name='recommended_products'),
    
    # User data endpoints
    path('user/search-history/', views.SearchHistoryListCreateView.as_view(), name='search_history'),
    path('user/search-history/query/<int:pk>/', views.SearchHistoryResultView.as_view(), name='search_history_results'),
    path('user/search-history/<int:pk>/', views.SearchHistoryDeleteView.as_view(), name='delete_search'),
    path('user/clear/search-history/', views.clear_search_history, name='clear_history'),
    
    path('user/favorites/', views.FavoriteListCreateView.as_view(), name='favorites'),
    path('user/favorites/<str:pk>/', views.FavoriteDeleteView.as_view(), name='delete_favorite'),
]