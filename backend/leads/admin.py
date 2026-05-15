from django.contrib import admin
from .models import Lead, Consulta, Tarefa, Origem, Interesse, KanbanColumn, Orientacao, AssuntoOrientacao

@admin.register(Origem)
class OrigemAdmin(admin.ModelAdmin):
    list_display = ('nome', 'clinica')
    list_filter = ('clinica',)
    search_fields = ('nome',)

@admin.register(Interesse)
class InteresseAdmin(admin.ModelAdmin):
    list_display = ('nome', 'clinica')
    list_filter = ('clinica',)
    search_fields = ('nome',)

@admin.register(AssuntoOrientacao)
class AssuntoOrientacaoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'clinica')
    list_filter = ('clinica',)
    search_fields = ('nome',)

@admin.register(KanbanColumn)
class KanbanColumnAdmin(admin.ModelAdmin):
    list_display = ('title', 'key', 'clinica', 'ordenacao')
    list_filter = ('clinica',)
    search_fields = ('title', 'key')

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('nome', 'telefone', 'status', 'clinica', 'origem', 'interesse', 'created_at')
    list_filter = ('status', 'clinica', 'origem', 'interesse', 'compareceu')
    search_fields = ('nome', 'telefone', 'email')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Consulta)
class ConsultaAdmin(admin.ModelAdmin):
    list_display = ('lead', 'data_hora', 'status', 'clinica', 'resolvido')
    list_filter = ('status', 'clinica', 'resolvido')
    search_fields = ('lead__nome', 'observacoes')

@admin.register(Tarefa)
class TarefaAdmin(admin.ModelAdmin):
    list_display = ('descricao', 'tipo_repeticao', 'data_lembrete', 'concluida', 'atribuido_a', 'clinica')
    list_filter = ('tipo_repeticao', 'concluida', 'clinica', 'atribuido_a')
    search_fields = ('descricao',)

@admin.register(Orientacao)
class OrientacaoAdmin(admin.ModelAdmin):
    list_display = ('paciente_nome', 'assunto', 'clinica', 'created_at')
    list_filter = ('clinica', 'assunto')
    search_fields = ('paciente_nome', 'descricao')
