from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, SearchHistory, Favorite

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class SearchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchHistory
        fields = ['id', 'query', 'timestamp']
        read_only_fields = ['user']

class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'product', 'timestamp']
        read_only_fields = ['user']

class FavoriteCreateSerializer(serializers.ModelSerializer):
    product_id = serializers.CharField()

    class Meta:
        model = Favorite
        fields = ['product_id']

    def validate_product_id(self, value):
        product = Product.objects.filter(id=value).first()
        if product:
            return product

        # Try to get product data from request context (you must pass it manually)
        search_data = self.context.get('search_data', [])
        match = next((item for item in search_data if item['id'] == value), None)
        if not match:
            raise serializers.ValidationError("Product does not exist in results or database")

        # Create the product from search result
        return Product.objects.create(
            id=match['id'],
            name=match['name'],
            price=match['price'],
            image=match['image'],
            source=match['source'],
            url=match['url'],
            rating=match['rating']
        )

    def create(self, validated_data):
        return Favorite.objects.create(
            user=self.context['request'].user,
            product=validated_data['product_id']
        )
    
    
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user