from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Q
import random
from django.core.cache import cache
from celery import shared_task



from .models import Product, SearchHistory, Favorite, UserRecommendation
from .serializers import (
    ProductSerializer, 
    SearchHistorySerializer, 
    FavoriteSerializer,
    FavoriteCreateSerializer,
    UserSerializer,
    UserRegistrationSerializer
)
from .scrapers import scrape_products
from rest_framework.views import APIView


# Auth views
@api_view(['POST'])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'token': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'token': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET'])
def search_products(request):
    query = request.query_params.get('q', '')
    if not query:
        return Response({'error': 'Please provide a search query'}, status=status.HTTP_400_BAD_REQUEST)
    
    products = scrape_products(query)

    for product in products:
        cache.set(f"product_{product['id']}", product, timeout=600)  # 600 seconds = 10 minutes

    if request.user.is_authenticated:
        SearchHistory.objects.create(user=request.user, query=query)
        generate_user_recommendations.delay(request.user.id)

    return Response(products)


@api_view(['GET'])
def get_product(request, id):
    product = cache.get(f"product_{id}")
    
    if not product:
        return Response({'error': 'Product not foundd'}, status=status.HTTP_404_NOT_FOUND)
    
    # Add more detailed data
    product['description'] = f"This is a detailed description of {product['name']}..."
    product['specs'] = {
        "Brand": "Example Brand",
        "Model": "Model XYZ",
        "Color": "Black",
        "Dimensions": "10 x 5 x 2 inches",
        "Weight": "500g"
    }

    return Response(product)


@api_view(['GET'])
def get_similar_products(request, id):
    # In a real implementation, this would find similar products
    # For demo purposes, we'll return random products
    all_products = scrape_products('')
    similar_products = random.sample(all_products, min(4, len(all_products)))
    return Response(similar_products)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommended_products(request):
    recommendations = (
        UserRecommendation.objects
        .filter(user=request.user)
        .order_by('-created_at')
        .values_list('product_data', flat=True)[:10]
    )
    return Response(recommendations)

@shared_task
def generate_user_recommendations(user_id):
    from django.contrib.auth.models import User
    user = User.objects.get(id=user_id)

    # Fetch latest search queries and favorites
    search_queries = (
        SearchHistory.objects
        .filter(user=user)
        .order_by('-timestamp')[:5]
        .values_list('query', flat=True)
    )
    favorite_titles = (
        Favorite.objects
        .filter(user=user)
        .values_list('product__name', flat=True)[:10]
    )

    seed_queries = list(set(search_queries) | set(favorite_titles))

    recommended_products = []
    for query in seed_queries:
        products = scrape_products(query)
        recommended_products.extend(products[:2])

    # Deduplicate and limit
    seen = set()
    unique_recommendations = []
    for product in recommended_products:
        identifier = product.get("id") or product.get("name")
        if identifier not in seen:
            seen.add(identifier)
            unique_recommendations.append(product)

    limited_recommendations = unique_recommendations[:10]

    # Clear previous recommendations
    UserRecommendation.objects.filter(user=user).delete()

    # Store new ones
    for product in limited_recommendations:
        UserRecommendation.objects.create(user=user, product_data=product)

    return True


# User data views
class SearchHistoryListCreateView(generics.ListCreateAPIView):
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SearchHistoryResultView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            search = SearchHistory.objects.get(pk=pk, user=request.user)

            # If results are null, run scraping and update
            if not search.results:
                results = scrape_products(search.query)
                search.results = results
                search.save()

            return Response({
                "query": search.query,
                "results": search.results
            })

        except SearchHistory.DoesNotExist:
            return Response({"error": "Search history not found."}, status=404)



class SearchHistoryDeleteView(generics.DestroyAPIView):
    serializer_class = SearchHistorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_search_history(request):
    SearchHistory.objects.filter(user=request.user).delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

class FavoriteListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FavoriteCreateSerializer
        return FavoriteSerializer
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        
        # Extract recent search results from frontend or session
        search_data = self.request.data.get('search_data', [])
        context['search_data'] = search_data
        return context

    
    def perform_create(self, serializer):
        serializer.save()


class FavoriteDeleteView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)