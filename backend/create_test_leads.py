import os
import django
import datetime
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from clinicas.models import Clinica
from leads.models import Lead, Origem, Interesse, Consulta

# Get or create the clinic
clinica = Clinica.objects.first()
if not clinica:
    clinica = Clinica.objects.create(nome='Clínica Leadora', slug='leadora')

# Get or create sample origins and interests
instagram, _ = Origem.objects.get_or_create(clinica=clinica, nome='Instagram')
facebook, _ = Origem.objects.get_or_create(clinica=clinica, nome='Facebook')
tiktok, _ = Origem.objects.get_or_create(clinica=clinica, nome='TikTok')

botox, _ = Interesse.objects.get_or_create(clinica=clinica, nome='Botox')
preenchimento, _ = Interesse.objects.get_or_create(clinica=clinica, nome='Preenchimento')
consulta_geral, _ = Interesse.objects.get_or_create(clinica=clinica, nome='Consulta Geral')

today = datetime.date.today()

leads_data = [
    # 4 leads in pre-consultation FUP matching exactly the days
    {
        'nome': 'Alice Ferreira (Pre-FUP 1 d)',
        'email': 'alice@email.com',
        'telefone': '(11) 98888-1111',
        'data_primeiro_contato': today - datetime.timedelta(days=1),
        'origem': instagram,
        'interesse': botox,
        'compareceu': False
    },
    {
        'nome': 'Bruno Mendes (Pre-FUP 8 d)',
        'email': 'bruno@email.com',
        'telefone': '(11) 98888-2222',
        'data_primeiro_contato': today - datetime.timedelta(days=8),
        'origem': facebook,
        'interesse': preenchimento,
        'compareceu': False
    },
    {
        'nome': 'Carla Santos (Pre-FUP 23 d)',
        'email': 'carla@email.com',
        'telefone': '(11) 98888-3333',
        'data_primeiro_contato': today - datetime.timedelta(days=23),
        'origem': tiktok,
        'interesse': consulta_geral,
        'compareceu': False
    },
    {
        'nome': 'Daniel Oliveira (Pre-FUP 24 d)',
        'email': 'daniel@email.com',
        'telefone': '(11) 98888-4444',
        'data_primeiro_contato': today - datetime.timedelta(days=24),
        'origem': instagram,
        'interesse': botox,
        'compareceu': False
    },

    # 4 leads in post-consultation FUP (attended)
    {
        'nome': 'Elena Martins (Pos-FUP 1 d)',
        'email': 'elena@email.com',
        'telefone': '(11) 98888-5555',
        'data_primeiro_contato': today - datetime.timedelta(days=30),
        'origem': facebook,
        'interesse': preenchimento,
        'compareceu': True,
        'consult_days_ago': 1
    },
    {
        'nome': 'Fábio Costa (Pos-FUP 8 d)',
        'email': 'fabio@email.com',
        'telefone': '(11) 98888-6666',
        'data_primeiro_contato': today - datetime.timedelta(days=35),
        'origem': tiktok,
        'interesse': consulta_geral,
        'compareceu': True,
        'consult_days_ago': 8
    },
    {
        'nome': 'Gisele Lima (Pos-FUP 23 d)',
        'email': 'gisele@email.com',
        'telefone': '(11) 98888-7777',
        'data_primeiro_contato': today - datetime.timedelta(days=40),
        'origem': instagram,
        'interesse': botox,
        'compareceu': True,
        'consult_days_ago': 23
    },
    {
        'nome': 'Henrique Alves (Pos-FUP 7 d)',
        'email': 'henrique@email.com',
        'telefone': '(11) 98888-8888',
        'data_primeiro_contato': today - datetime.timedelta(days=45),
        'origem': facebook,
        'interesse': preenchimento,
        'compareceu': True,
        'consult_days_ago': 7
    },

    # 2 leads who scheduled but did not attend (compareceu=False)
    {
        'nome': 'Irene Rocha (Faltou)',
        'email': 'irene@email.com',
        'telefone': '(11) 98888-9999',
        'data_primeiro_contato': today - datetime.timedelta(days=15),
        'origem': tiktok,
        'interesse': consulta_geral,
        'compareceu': False,
        'consult_days_ago': 2
    },
    {
        'nome': 'Jonas Pires (Faltou)',
        'email': 'jonas@email.com',
        'telefone': '(11) 98888-0000',
        'data_primeiro_contato': today - datetime.timedelta(days=20),
        'origem': instagram,
        'interesse': botox,
        'compareceu': False,
        'consult_days_ago': 3
    },
]

print("Starting lead generation...")
for data in leads_data:
    consult_days_ago = data.pop('consult_days_ago', None)
    lead = Lead.objects.create(clinica=clinica, status='NOVO', **data)
    print(f"Created Lead: {lead.nome}")

    if consult_days_ago is not None:
        # Create consultation
        dt = timezone.now() - datetime.timedelta(days=consult_days_ago)
        Consulta.objects.create(
            clinica=clinica,
            lead=lead,
            data_hora=dt,
            status='COMPARECEU' if lead.compareceu else 'FALTOU',
            observacoes='Consulta de teste'
        )
        print(f"  Created Consultation for {lead.nome} with status {'COMPARECEU' if lead.compareceu else 'FALTOU'}")

print("Done! All 10 leads and consultations were successfully created.")
