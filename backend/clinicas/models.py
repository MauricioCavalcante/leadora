from django.db import models
from django.contrib.auth.models import AbstractUser

import uuid

class Clinica(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, null=True, blank=True)
    nome = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    telefone = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    endereco = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('ADMINISTRADOR', 'Administrador'),
        ('GESTOR', 'Gestor'),
        ('SECRETARIA', 'Secretária'),
        ('MEDICO', 'Médico'),
    ]
    # Changed from ForeignKey to ManyToManyField to support multi-clinics per user
    clinicas = models.ManyToManyField(Clinica, related_name='usuarios', blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='MEDICO')
    telefone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
