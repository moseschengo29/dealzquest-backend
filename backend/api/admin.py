from django.contrib import admin
from .models import Product, SearchHistory, Favorite, ProductCategory, ProductPrice

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'source', 'rating', 'created_at')
    search_fields = ('name', 'source')
    list_filter = ('source', 'created_at')

@admin.register(SearchHistory)
class SearchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'query', 'timestamp')
    search_fields = ('user__username', 'query')
    list_filter = ('timestamp',)

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('user__username', 'product__name')

admin.site.register(ProductCategory)
admin.site.register(ProductPrice)