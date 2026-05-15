from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Clinica, CustomUser

@admin.register(Clinica)
class ClinicaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'slug', 'telefone', 'email', 'created_at')
    search_fields = ('nome', 'slug', 'email')
    prepopulated_fields = {'slug': ('nome',)}

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'clinicas')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'telefone', 'clinicas')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'telefone', 'clinicas')}),
    )
    filter_horizontal = ('clinicas',)
