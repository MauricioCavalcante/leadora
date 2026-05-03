from django.db import models
from django.utils import timezone
from django.conf import settings
from clinicas.models import Clinica

class Origem(models.Model):
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE, related_name='origens')
    nome = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nome} ({self.clinica.nome})"

class Interesse(models.Model):
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE, related_name='interesses')
    nome = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nome} ({self.clinica.nome})"

class KanbanColumn(models.Model):
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE, related_name='kanban_columns')
    title = models.CharField(max_length=100)
    key = models.CharField(max_length=50)
    color = models.CharField(max_length=100, default='bg-indigo-50 border-indigo-200 text-indigo-700')
    ordenacao = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.title} ({self.clinica.nome})"

class Lead(models.Model):
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE, related_name='leads')
    nome = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    telefone = models.CharField(max_length=50)
    data_nascimento = models.DateField(blank=True, null=True)
    salvar_contato = models.BooleanField(default=False)
    faltas = models.IntegerField(default=0)
    data_primeiro_contato = models.DateField(blank=True, null=True)
    observacoes = models.TextField(blank=True, null=True)
    
    # FUP completion checkboxes
    fup1_feito = models.BooleanField(default=False)
    fup2_feito = models.BooleanField(default=False)
    fup3_feito = models.BooleanField(default=False)
    fup4_feito = models.BooleanField(default=False)
    
    # ForeignKey to dynamic Origem
    origem = models.ForeignKey(Origem, on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    origem_manual = models.CharField(max_length=100, blank=True, null=True) # Fallback for old/legacy string origins
    
    interesse = models.ForeignKey(Interesse, on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    compareceu = models.BooleanField(default=False)

    # Post-consultation FUP fields
    pos_fup1_feito = models.BooleanField(default=False)
    pos_fup2_feito = models.BooleanField(default=False)
    pos_fup3_feito = models.BooleanField(default=False)
    resultado_pos_fup = models.CharField(max_length=50, blank=True, null=True)

    status = models.CharField(max_length=50, default='NOVO')
    resultado_fup = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nome} ({self.status})"

    def get_status_display(self):
        return self.status

class Consulta(models.Model):
    ATTENDANCE_CHOICES = [
        ('AGENDADO', 'Agendado'),
        ('COMPARECEU', 'Compareceu'),
        ('FALTOU', 'Faltou'),
    ]

    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE, related_name='consultas')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='consultas')
    data_hora = models.DateTimeField()
    observacoes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=ATTENDANCE_CHOICES, default='AGENDADO')
    
    data_lembrete = models.DateField(null=True, blank=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    resolvido = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.lead.nome} em {self.data_hora}"

class Tarefa(models.Model):
    clinica = models.ForeignKey(Clinica, on_delete=models.CASCADE, related_name='tarefas')
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='tarefas')
    descricao = models.CharField(max_length=500)
    atribuido_a = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='tarefas')
    TIPO_REPETICAO_CHOICES = [
        ('PONTUAL', 'Pontual / Lembrete'),
        ('SEMANAL', 'Semanal'),
        ('MENSAL', 'Mensal'),
        ('ANUAL', 'Anual'),
    ]
    tipo_repeticao = models.CharField(max_length=20, choices=TIPO_REPETICAO_CHOICES, default='PONTUAL')
    data_lembrete = models.DateField(null=True, blank=True)
    concluida = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.descricao
