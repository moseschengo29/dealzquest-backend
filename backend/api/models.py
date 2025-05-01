from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import JSONField  # Django 3.1+


class Product(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(null=True, blank=True)
    source = models.CharField(max_length=100)
    url = models.URLField()
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SearchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    query = models.CharField(max_length=255)
    results = models.JSONField(blank=True, null=True)  # ← stores the results
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = 'Search histories'

    def __str__(self):
        return f"{self.user.username}: {self.query}"

class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username}: {self.product.name}"

class ProductCategory(models.Model):
    name = models.CharField(max_length=100)
    
    class Meta:
        verbose_name_plural = 'Product categories'
        
    def __str__(self):
        return self.name

class ProductPrice(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='prices')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    source = models.CharField(max_length=100)
    url = models.URLField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['price']
        
    def __str__(self):
        return f"{self.product.name} - {self.price} ({self.source})"