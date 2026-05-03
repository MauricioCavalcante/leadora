import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from clinicas.models import Clinica, CustomUser
from leads.models import Lead, Origem

# Create a sample Clinica
clinica, created = Clinica.objects.get_or_create(
    slug='leadora',
    defaults={'nome': 'Clínica Leadora'}
)
if created:
    print("Created Clinica Leadora")

# Create Admin User
if not CustomUser.objects.filter(username='admin').exists():
    admin_user = CustomUser.objects.create_superuser(
        username='admin',
        email='admin@leadora.com',
        password='adminpassword',
        role='ADMINISTRADOR'
    )
    admin_user.clinicas.add(clinica)
    print("Created Admin User: username=admin, password=adminpassword")

# Create Médico User
if not CustomUser.objects.filter(username='medico').exists():
    medico_user = CustomUser.objects.create_user(
        username='medico',
        email='medico@leadora.com',
        password='medicopassword',
        role='MEDICO'
    )
    medico_user.clinicas.add(clinica)
    print("Created Médico User: username=medico, password=medicopassword")

# Create sample Origins
instagram, _ = Origem.objects.get_or_create(clinica=clinica, nome='Instagram')
facebook, _ = Origem.objects.get_or_create(clinica=clinica, nome='Facebook')
tiktok, _ = Origem.objects.get_or_create(clinica=clinica, nome='TikTok')
manual, _ = Origem.objects.get_or_create(clinica=clinica, nome='Manual')
print("Created sample Origins")

# Create initial sample Lead
if not Lead.objects.filter(clinica=clinica).exists():
    Lead.objects.create(
        clinica=clinica,
        nome='João da Silva',
        email='joao@email.com',
        telefone='(11) 99999-8888',
        origem=manual,
        status='NOVO'
    )
    print("Created initial sample Lead")
