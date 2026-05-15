import datetime
from typing import List, Optional
from ninja import NinjaAPI, Schema
from ninja.security import HttpBearer
from django.contrib.auth import authenticate
from django.utils import timezone
from clinicas.models import Clinica, CustomUser
from leads.models import Lead, Origem, Interesse, Consulta, Tarefa, KanbanColumn, Orientacao, AssuntoOrientacao

api = NinjaAPI(title="Leadora API", version="1.0.0")


# Security Bearer Auth
class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        from django.utils.html import strip_tags
        try:
            tok = strip_tags(token).strip()
            if "@" in tok:
                user = CustomUser.objects.filter(email__iexact=tok).first()
            else:
                user = CustomUser.objects.filter(username=tok).first()
            if user:
                return user
        except Exception:
            return None

auth_bearer = AuthBearer()

# --- Schemas ---
class KanbanColumnIn(Schema):
    clinica_id: int
    title: str
    key: str
    color: Optional[str] = 'bg-indigo-50 border-indigo-200 text-indigo-700'
    ordenacao: Optional[int] = 0

class KanbanColumnOut(Schema):
    id: int
    title: str
    key: str
    color: str
    ordenacao: int

class KanbanColumnUpdateIn(Schema):
    title: Optional[str] = None
    key: Optional[str] = None
    color: Optional[str] = None
    ordenacao: Optional[int] = None

class ClinicaOut(Schema):
    id: int
    uuid: Optional[str] = None
    nome: str
    slug: str
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None

    @staticmethod
    def resolve_uuid(obj):
        return str(obj.uuid) if obj.uuid else None


class LoginIn(Schema):
    username: str
    password: str

class LoginOut(Schema):
    token: str
    username: str
    role: str
    clinicas: List[ClinicaOut]

class OrigemIn(Schema):
    nome: str
    clinica_id: int

class OrigemOut(Schema):
    id: int
    nome: str

class InteresseIn(Schema):
    nome: str
    clinica_id: int

class InteresseOut(Schema):
    id: int
    nome: str

class LeadIn(Schema):
    clinica_id: int
    nome: str
    email: Optional[str] = None
    telefone: str
    data_nascimento: Optional[str] = None # format YYYY-MM-DD
    salvar_contato: bool = False
    origem_id: Optional[int] = None
    interesse_id: Optional[int] = None
    compareceu: Optional[bool] = False
    created_at: Optional[str] = None # Support backdating on creation too
    status: Optional[str] = None
    data_primeiro_contato: Optional[str] = None
    observacoes: Optional[str] = None
    resultado_fup: Optional[str] = None
    pos_fup1_feito: Optional[bool] = None
    pos_fup2_feito: Optional[bool] = None
    pos_fup3_feito: Optional[bool] = None
    resultado_pos_fup: Optional[str] = None

class LeadOut(Schema):
    id: int
    nome: str
    email: Optional[str] = None
    telefone: str
    data_nascimento: Optional[datetime.date] = None # Fixed type to serialize correctly
    salvar_contato: bool
    faltas: int
    data_primeiro_contato: Optional[datetime.date] = None
    observacoes: Optional[str] = None
    fup1_feito: bool
    fup2_feito: bool
    fup3_feito: bool
    fup4_feito: bool
    pos_fup1_feito: bool = False
    pos_fup2_feito: bool = False
    pos_fup3_feito: bool = False
    origem: Optional[OrigemOut] = None
    interesse: Optional[InteresseOut] = None
    compareceu: bool = False
    origem_manual: Optional[str] = None
    status: str
    resultado_fup: Optional[str] = None
    resultado_pos_fup: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

class LeadUpdateIn(Schema):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    data_nascimento: Optional[str] = None
    salvar_contato: Optional[bool] = None
    origem_id: Optional[int] = None
    interesse_id: Optional[int] = None
    compareceu: Optional[bool] = None
    status: Optional[str] = None
    resultado_fup: Optional[str] = None
    created_at: Optional[str] = None
    fup1_feito: Optional[bool] = None
    fup2_feito: Optional[bool] = None
    fup3_feito: Optional[bool] = None
    fup4_feito: Optional[bool] = None
    pos_fup1_feito: Optional[bool] = None
    pos_fup2_feito: Optional[bool] = None
    pos_fup3_feito: Optional[bool] = None
    resultado_pos_fup: Optional[str] = None
    data_primeiro_contato: Optional[str] = None
    observacoes: Optional[str] = None
    faltas: Optional[int] = None



class ClinicaIn(Schema):
    nome: str
    slug: str
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None

class ClinicaUpdateIn(Schema):
    nome: Optional[str] = None
    slug: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None

class ProfissionalIn(Schema):
    clinica_id: int
    username: str
    password: str
    email: str
    role: str
    telefone: Optional[str] = None

class ProfissionalOut(Schema):
    id: int
    username: str
    role: str
    email: str
    telefone: Optional[str] = None

class ProfissionalUpdateIn(Schema):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    telefone: Optional[str] = None

class ConsultaIn(Schema):
    clinica_id: int
    lead_id: int
    data_hora: str # format YYYY-MM-DD HH:MM or ISO
    observacoes: Optional[str] = None
    status: Optional[str] = "AGENDADO"
    data_lembrete: Optional[str] = None
    valor: Optional[float] = None
    resolvido: Optional[bool] = False

class ConsultaOut(Schema):
    id: int
    clinica: ClinicaOut
    lead: LeadOut
    data_hora: datetime.datetime
    observacoes: Optional[str] = None
    status: str
    data_lembrete: Optional[datetime.date] = None
    valor: Optional[float] = None
    resolvido: Optional[bool] = False

class ConsultaUpdateIn(Schema):
    data_hora: Optional[str] = None
    observacoes: Optional[str] = None
    status: Optional[str] = None
    data_lembrete: Optional[str] = None
    valor: Optional[float] = None
    resolvido: Optional[bool] = None

class UserOut(Schema):
    id: int
    username: str
    role: str

class TarefaIn(Schema):
    clinica_id: int
    descricao: str
    atribuido_a_id: Optional[int] = None
    tipo_repeticao: str = "PONTUAL"
    data_lembrete: Optional[str] = None
    lead_id: Optional[int] = None

class TarefaOut(Schema):
    id: int
    descricao: str
    tipo_repeticao: str
    data_lembrete: Optional[datetime.date] = None
    concluida: bool
    atribuido_a: Optional[UserOut] = None
    created_at: datetime.datetime
    lead: Optional[LeadOut] = None

class AssuntoOrientacaoIn(Schema):
    clinica_id: int
    nome: str

class AssuntoOrientacaoOut(Schema):
    id: int
    nome: str

class OrientacaoIn(Schema):
    clinica_id: int
    paciente_nome: str
    assunto_id: Optional[int] = None
    assunto_texto: Optional[str] = None
    descricao: Optional[str] = None

class OrientacaoOut(Schema):
    id: int
    clinica: ClinicaOut
    paciente_nome: str
    assunto: Optional[AssuntoOrientacaoOut] = None
    assunto_texto: Optional[str] = None
    descricao: Optional[str] = None
    created_at: datetime.datetime

class TarefaUpdateIn(Schema):
    descricao: Optional[str] = None
    concluida: Optional[bool] = None
    tipo_repeticao: Optional[str] = None
    data_lembrete: Optional[str] = None
    atribuido_a_id: Optional[int] = None
    lead_id: Optional[int] = None


# --- Auth Endpoints ---
@api.post("/auth/login", response=LoginOut, auth=None)
def login(request, data: LoginIn):
    from django.utils.html import strip_tags
    username = strip_tags(data.username).strip()
    password = data.password

    if "@" in username:
        # Check if user exists by email
        user_by_email = CustomUser.objects.filter(email__iexact=username).first()
        if user_by_email:
            username = user_by_email.username

    user = authenticate(username=username, password=password)
    if not user:
        from ninja.errors import HttpError
        raise HttpError(401, "Invalid username or password")

    user_clinicas = user.clinicas.all()
    return {
        "token": user.username,
        "username": user.username,
        "role": user.role,
        "clinicas": user_clinicas
    }


# --- Clinics Endpoints ---
@api.get("/clinicas", response=List[ClinicaOut], auth=auth_bearer)
def list_clinicas(request):
    return request.auth.clinicas.all()

@api.post("/clinicas", response=ClinicaOut, auth=auth_bearer)
def create_clinica(request, data: ClinicaIn):
    clinica, created = Clinica.objects.get_or_create(
        slug=data.slug,
        defaults={
            "nome": data.nome,
            "telefone": data.telefone,
            "email": data.email,
            "endereco": data.endereco
        }
    )
    request.auth.clinicas.add(clinica)
    return clinica

@api.get("/clinicas/{id_or_uuid}", response=ClinicaOut, auth=auth_bearer)
def get_clinica(request, id_or_uuid: str):
    from ninja.errors import HttpError
    try:
        if "-" in id_or_uuid or len(id_or_uuid) > 30:
            c = Clinica.objects.get(uuid=id_or_uuid)
        else:
            c = Clinica.objects.get(id=int(id_or_uuid))
    except Exception:
        raise HttpError(404, "Clínica not found")
    if not request.auth.clinicas.filter(id=c.id).exists():
        raise HttpError(403, "Not allowed")
    return c

@api.patch("/clinicas/{id_or_uuid}", response=ClinicaOut, auth=auth_bearer)
def update_clinica(request, id_or_uuid: str, data: ClinicaUpdateIn):
    from ninja.errors import HttpError
    try:
        if "-" in id_or_uuid or len(id_or_uuid) > 30:
            c = Clinica.objects.get(uuid=id_or_uuid)
        else:
            c = Clinica.objects.get(id=int(id_or_uuid))
    except Exception:
        raise HttpError(404, "Clínica not found")
    if not request.auth.clinicas.filter(id=c.id).exists():
        raise HttpError(403, "Not allowed")
    for attr, val in data.dict(exclude_unset=True).items():
        if val is not None:
            setattr(c, attr, val)
    c.save()
    return c

@api.delete("/clinicas/{id_or_uuid}", auth=auth_bearer)
def delete_clinica(request, id_or_uuid: str):
    from ninja.errors import HttpError
    try:
        if "-" in id_or_uuid or len(id_or_uuid) > 30:
            c = Clinica.objects.get(uuid=id_or_uuid)
        else:
            c = Clinica.objects.get(id=int(id_or_uuid))
    except Exception:
        raise HttpError(404, "Clínica not found")
    if not request.auth.clinicas.filter(id=c.id).exists():
        raise HttpError(403, "Not allowed")
    c.delete()
    return {"status": "success"}

# --- Dynamic Origem CRUD Endpoints ---
@api.get("/origens", response=List[OrigemOut], auth=auth_bearer)
def list_origens(request, clinica_id: int):
    if not request.auth.clinicas.filter(id=clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to view origins for this clinic")
    return Origem.objects.filter(clinica_id=clinica_id)

@api.post("/origens", response=OrigemOut, auth=auth_bearer)
def create_origem(request, data: OrigemIn):
    if not request.auth.clinicas.filter(id=data.clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to create origins for this clinic")
    origem = Origem.objects.create(clinica_id=data.clinica_id, nome=data.nome)
    return origem

# --- Dynamic Interesse CRUD Endpoints ---
@api.get("/interesses", response=List[InteresseOut], auth=auth_bearer)
def list_interesses(request, clinica_id: int):
    if not request.auth.clinicas.filter(id=clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to view interests for this clinic")
    return Interesse.objects.filter(clinica_id=clinica_id)

@api.post("/interesses", response=InteresseOut, auth=auth_bearer)
def create_interesse(request, data: InteresseIn):
    if not request.auth.clinicas.filter(id=data.clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to create interests for this clinic")
    interesse = Interesse.objects.create(clinica_id=data.clinica_id, nome=data.nome)
    return interesse

# --- Professional Endpoints ---
class AssociateProfessionalIn(Schema):
    user_id: int
    clinica_id: int

@api.get("/workspace-profissionais", response=List[ProfissionalOut], auth=auth_bearer)
def list_workspace_profissionais(request):
    return CustomUser.objects.filter(clinicas__in=request.auth.clinicas.all()).distinct()

@api.post("/profissionais/associar", auth=auth_bearer)
def associate_profissional(request, data: AssociateProfessionalIn):
    from ninja.errors import HttpError
    if not request.auth.clinicas.filter(id=data.clinica_id).exists():
        raise HttpError(403, "Forbidden")
    try:
        user = CustomUser.objects.get(id=data.user_id)
        clinica = Clinica.objects.get(id=data.clinica_id)
    except Exception:
        raise HttpError(404, "User or Clinic not found")
    user.clinicas.add(clinica)
    return {"status": "success"}

@api.post("/profissionais/desassociar", auth=auth_bearer)
def disassociate_profissional(request, data: AssociateProfessionalIn):
    from ninja.errors import HttpError
    if not request.auth.clinicas.filter(id=data.clinica_id).exists():
        raise HttpError(403, "Forbidden")
    try:
        user = CustomUser.objects.get(id=data.user_id)
        clinica = Clinica.objects.get(id=data.clinica_id)
    except Exception:
        raise HttpError(404, "User or Clinic not found")
    user.clinicas.remove(clinica)
    return {"status": "success"}

@api.get("/profissionais", response=List[ProfissionalOut], auth=auth_bearer)
def list_profissionais(request, clinica_id: int):
    if not request.auth.clinicas.filter(id=clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to view this clinic's professionals")

    users = CustomUser.objects.filter(clinicas__id=clinica_id)
    return users

@api.post("/profissionais", response=ProfissionalOut, auth=auth_bearer)
def create_profissional(request, data: ProfissionalIn):
    from django.utils.html import strip_tags
    from ninja.errors import HttpError
    if request.auth.role not in ["ADMINISTRADOR", "GESTOR"]:
        raise HttpError(403, "Apenas administradores e gestores podem gerenciar profissionais")

    if not request.auth.clinicas.filter(id=data.clinica_id).exists():
        raise HttpError(403, "Not allowed to register professionals in this clinic")

    try:
        clinica = Clinica.objects.get(id=data.clinica_id)
    except Clinica.DoesNotExist:
        raise HttpError(404, "Clínica not found")

    email = strip_tags(data.email).strip()

    # Extract the username from the part before @ in email
    if "@" in email:
        username = email.split("@")[0].lower().strip().replace(" ", "_")
    else:
        username = strip_tags(data.username).strip().lower().replace(" ", "_")

    if not username:
        username = "user"

    # Make sure the username is unique
    base_username = username
    i = 1
    while CustomUser.objects.filter(username=username).exists():
        username = f"{base_username}{i}"
        i += 1

    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        password=data.password,
        role=strip_tags(data.role).strip().upper(),
        telefone=strip_tags(data.telefone).strip() if data.telefone else None
    )
    user.clinicas.add(clinica)
    return user

@api.patch("/profissionais/{user_id}", response=ProfissionalOut, auth=auth_bearer)
def update_profissional(request, user_id: int, data: ProfissionalUpdateIn):
    from django.utils.html import strip_tags
    from ninja.errors import HttpError

    if request.auth.role not in ["ADMINISTRADOR", "GESTOR"]:
        raise HttpError(403, "Apenas administradores e gestores podem gerenciar profissionais")

    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        raise HttpError(404, "Profissional not found")

    if not request.auth.clinicas.filter(id__in=user.clinicas.all()).exists():
        raise HttpError(403, "Not allowed to manage this professional")

    if data.username is not None:
        u = strip_tags(data.username).strip().lower().replace(" ", "_")
        if u and u != user.username:
            if CustomUser.objects.filter(username=u).exclude(id=user_id).exists():
                raise HttpError(400, "Este nome de usuário já está em uso")
            user.username = u

    if data.email is not None:
        email = strip_tags(data.email).strip()
        if email and email != user.email:
            user.email = email
            if "@" in email and not data.username:
                u = email.split("@")[0].lower().strip().replace(" ", "_")
                if not CustomUser.objects.filter(username=u).exclude(id=user_id).exists():
                    user.username = u

    if data.password is not None:
        p = data.password.strip()
        if p:
            user.set_password(p)

    if data.role is not None:
        user.role = strip_tags(data.role).strip().upper()

    if data.telefone is not None:
        user.telefone = strip_tags(data.telefone).strip()

    user.save()
    return user

@api.delete("/profissionais/{user_id}", auth=auth_bearer)
def delete_profissional(request, user_id: int):
    from ninja.errors import HttpError
    if request.auth.role not in ["ADMINISTRADOR", "GESTOR"]:
        raise HttpError(403, "Apenas administradores e gestores podem gerenciar profissionais")

    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        raise HttpError(404, "Profissional not found")

    if not request.auth.clinicas.filter(id__in=user.clinicas.all()).exists():
        raise HttpError(403, "Not allowed to delete this professional")

    if user == request.auth:
        raise HttpError(400, "Você não pode deletar a si mesmo")

    user.delete()
    return {"status": "success"}

# --- Lead Endpoints ---
@api.get("/leads", response=List[LeadOut], auth=auth_bearer)
def list_leads(request, clinica_id: int, status: Optional[str] = None):
    if not request.auth.clinicas.filter(id=clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to access leads for this clinic")

    leads = Lead.objects.filter(clinica_id=clinica_id)
    if status:
        leads = leads.filter(status=status)
    return leads.order_by("-created_at")

@api.post("/leads", response=LeadOut, auth=auth_bearer)
def create_lead(request, data: LeadIn):
    from django.utils.html import strip_tags
    if not request.auth.clinicas.filter(id=data.clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to create leads for this clinic")

    data_dict = data.dict(exclude_unset=True)
    for k, v in data_dict.items():
        if isinstance(v, str):
            data_dict[k] = strip_tags(v)

    clin_id = data_dict.pop("clinica_id")
    orig_id = data_dict.pop("origem_id", None)
    int_id = data_dict.pop("interesse_id", None)
    initial_status = data_dict.pop("status", "NOVO") or "NOVO"

    if data_dict["data_nascimento"]:
        try:
            data_dict["data_nascimento"] = datetime.datetime.strptime(data_dict["data_nascimento"], "%Y-%m-%d").date()
        except ValueError:
            data_dict["data_nascimento"] = None
    else:
        data_dict["data_nascimento"] = None

    if data_dict.get("data_primeiro_contato"):
        try:
            data_dict["data_primeiro_contato"] = datetime.datetime.strptime(data_dict["data_primeiro_contato"], "%Y-%m-%d").date()
        except ValueError:
            data_dict["data_primeiro_contato"] = None
    else:
        data_dict["data_primeiro_contato"] = None

    c_at = timezone.now()
    c_at_str = data_dict.pop("created_at", None)
    if c_at_str:
        try:
            c_at = datetime.datetime.fromisoformat(c_at_str.replace('Z', '+00:00'))
        except Exception:
            pass

    lead = Lead.objects.create(
        clinica_id=clin_id,
        status=initial_status,
        origem_id=orig_id,
        interesse_id=int_id,
        created_at=c_at,
        **data_dict
    )
    return lead

@api.patch("/leads/{lead_id}", response=LeadOut, auth=auth_bearer)
def patch_lead(request, lead_id: int, data: LeadUpdateIn):
    try:
        lead = Lead.objects.get(id=lead_id)
    except Lead.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Lead not found")

    # Validate permission
    if not request.auth.clinicas.filter(id=lead.clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to update this lead")

    for attr, value in data.dict(exclude_unset=True).items():
        if attr == "data_nascimento" and value:
            try:
                lead.data_nascimento = datetime.datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError:
                pass
        elif attr == "data_primeiro_contato" and value:
            try:
                lead.data_primeiro_contato = datetime.datetime.strptime(value, "%Y-%m-%d").date()
            except ValueError:
                pass
        elif attr == "created_at" and value:
            try:
                lead.created_at = datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
            except Exception:
                try:
                    lead.created_at = datetime.datetime.strptime(value, "%Y-%m-%d").date()
                except Exception:
                    pass
        elif attr == "origem_id":
            lead.origem_id = value
        elif attr == "interesse_id":
            lead.interesse_id = value
        elif attr == "compareceu":
            lead.compareceu = bool(value)
        elif attr == "resultado_fup":
            lead.resultado_fup = value
        elif attr == "resultado_pos_fup":
            lead.resultado_pos_fup = value
        elif value is not None:
            setattr(lead, attr, value)

    # Automatically set status to EM_ATENDIMENTO if any FUP has been check marked
    if lead.fup1_feito or lead.fup2_feito or lead.fup3_feito or lead.fup4_feito:
        if lead.status == "NOVO":
            lead.status = "EM_ATENDIMENTO"

    lead.save()
    return lead


# --- Consultations Endpoints ---
@api.get("/consultas", response=List[ConsultaOut], auth=auth_bearer)
def list_consultas(request, clinica_id: int):
    if not request.auth.clinicas.filter(id=clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to view appointments for this clinic")
    return Consulta.objects.filter(clinica_id=clinica_id).order_by("data_hora")

@api.post("/consultas", response=ConsultaOut, auth=auth_bearer)
def create_consulta(request, data: ConsultaIn):
    if not request.auth.clinicas.filter(id=data.clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to create appointments for this clinic")
    
    try:
        dt = datetime.datetime.fromisoformat(data.data_hora.replace('Z', '+00:00'))
    except Exception:
        try:
            dt = datetime.datetime.strptime(data.data_hora, "%Y-%m-%d %H:%M")
        except Exception:
            from ninja.errors import HttpError
            raise HttpError(400, "Invalid data_hora format. Use YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD HH:MM")

    consulta = Consulta.objects.create(
        clinica_id=data.clinica_id,
        lead_id=data.lead_id,
        data_hora=dt,
        observacoes=data.observacoes,
        status=data.status or "AGENDADO",
        data_lembrete=data.data_lembrete or None,
        valor=data.valor,
        resolvido=data.resolvido or False
    )
    if consulta.status == "COMPARECEU":
        consulta.lead.compareceu = True
        if consulta.resolvido:
            consulta.lead.status = "ENCERRADO"
        else:
            consulta.lead.status = "CONSULTA_MARCADA"
        consulta.lead.save()
    else:
        consulta.lead.status = "CONSULTA_MARCADA"
        consulta.lead.save()
    return consulta

@api.patch("/consultas/{consulta_id}", response=ConsultaOut, auth=auth_bearer)
def update_consulta(request, consulta_id: int, data: ConsultaUpdateIn):
    try:
        consulta = Consulta.objects.get(id=consulta_id)
    except Consulta.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Consulta not found")

    if not request.auth.clinicas.filter(id=consulta.clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to update this appointment")

    prev_status = consulta.status

    for attr, value in data.dict(exclude_unset=True).items():
        if attr == "data_hora" and value:
            try:
                dt = datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
            except Exception:
                try:
                    dt = datetime.datetime.strptime(value, "%Y-%m-%d %H:%M")
                except Exception:
                    from ninja.errors import HttpError
                    raise HttpError(400, "Invalid format")
            consulta.data_hora = dt
        elif attr == "data_lembrete":
            consulta.data_lembrete = value or None
        elif value is not None:
            setattr(consulta, attr, value)

    # Attendance/No-show tracking logic:
    # If changed to FALTOU and previous was not FALTOU -> increment faltas.
    # If changed from FALTOU to something else -> decrement faltas.
    if consulta.status == "FALTOU" and prev_status != "FALTOU":
        consulta.lead.faltas += 1
        consulta.lead.save()
    elif prev_status == "FALTOU" and consulta.status != "FALTOU":
        consulta.lead.faltas = max(0, consulta.lead.faltas - 1)
        consulta.lead.save()

    if consulta.status == "COMPARECEU":
        consulta.lead.compareceu = True
        if consulta.resolvido:
            consulta.lead.status = "ENCERRADO"
        else:
            consulta.lead.status = "CONSULTA_MARCADA"
        consulta.lead.save()
    elif consulta.resolvido:
        consulta.lead.status = "ENCERRADO"
        consulta.lead.save()
    elif consulta.status == "AGENDADO":
        consulta.lead.status = "CONSULTA_MARCADA"
        consulta.lead.save()

    consulta.save()
    return consulta

@api.delete("/consultas/{consulta_id}", auth=auth_bearer)
def delete_consulta(request, consulta_id: int):
    try:
        consulta = Consulta.objects.get(id=consulta_id)
    except Consulta.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Consulta not found")

    if not request.auth.clinicas.filter(id=consulta.clinica_id).exists():
        from ninja.errors import HttpError
        raise HttpError(403, "Not allowed to delete this appointment")

    if consulta.status == "FALTOU":
        consulta.lead.faltas = max(0, consulta.lead.faltas - 1)
        consulta.lead.save()

    consulta.delete()
    return {"success": True}

# Webhook ingestion from Kommo or similar
class WebhookIn(Schema):
    nome: str
    email: Optional[str] = None
    telefone: str
    data_nascimento: Optional[str] = None
    salvar_contato: bool = False

@api.post("/leads/webhook", auth=None)
def webhook_lead(request, clinica_slug: str, data: WebhookIn):
    try:
        clinica = Clinica.objects.get(slug=clinica_slug)
    except Clinica.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Clínica not found")

    dt_nasc = None
    if data.data_nascimento:
        try:
            dt_nasc = datetime.datetime.strptime(data.data_nascimento, "%Y-%m-%d").date()
        except ValueError:
            pass

    lead = Lead.objects.create(
        clinica=clinica,
        nome=data.nome,
        email=data.email,
        telefone=data.telefone,
        data_nascimento=dt_nasc,
        salvar_contato=data.salvar_contato,
        origem_manual="KOMMO",
        status="NOVO"
    )
    return {"status": "success", "lead_id": lead.id}

# --- Tarefas Endpoints ---

@api.get("/tarefas", response=List[TarefaOut], auth=AuthBearer())
def list_tarefas(request, clinica_id: int):
    return Tarefa.objects.filter(clinica_id=clinica_id).select_related('atribuido_a').order_by('-created_at')

@api.post("/tarefas", response=TarefaOut, auth=AuthBearer())
def create_tarefa(request, data: TarefaIn):
    try:
        clinica = Clinica.objects.get(id=data.clinica_id)
    except Clinica.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Clínica not found")
    
    atribuido_a = None
    if data.atribuido_a_id:
        try:
            atribuido_a = CustomUser.objects.get(id=data.atribuido_a_id)
            if atribuido_a.role == "MEDICO":
                from ninja.errors import HttpError
                raise HttpError(400, "Médicos não podem ter tarefas atribuídas.")
        except CustomUser.DoesNotExist:
            pass

    dt_lembrete = None
    if data.data_lembrete:
        try:
            dt_lembrete = datetime.datetime.strptime(data.data_lembrete, "%Y-%m-%d").date()
        except ValueError:
            pass

    tarefa = Tarefa.objects.create(
        clinica=clinica,
        descricao=data.descricao,
        atribuido_a=atribuido_a,
        tipo_repeticao=data.tipo_repeticao,
        data_lembrete=dt_lembrete,
        lead_id=data.lead_id
    )
    return tarefa

@api.patch("/tarefas/{tarefa_id}", response=TarefaOut, auth=AuthBearer())
def update_tarefa(request, tarefa_id: int, data: TarefaUpdateIn):
    try:
        tarefa = Tarefa.objects.get(id=tarefa_id)
    except Tarefa.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Tarefa not found")

    if data.descricao is not None:
        tarefa.descricao = data.descricao
    if data.concluida is not None:
        tarefa.concluida = data.concluida
    if data.tipo_repeticao is not None:
        tarefa.tipo_repeticao = data.tipo_repeticao
    if data.data_lembrete is not None:
        try:
            tarefa.data_lembrete = datetime.datetime.strptime(data.data_lembrete, "%Y-%m-%d").date()
        except ValueError:
            tarefa.data_lembrete = None
    if data.atribuido_a_id is not None:
        try:
            target_user = CustomUser.objects.get(id=data.atribuido_a_id)
            if target_user.role == "MEDICO":
                from ninja.errors import HttpError
                raise HttpError(400, "Médicos não podem ter tarefas atribuídas.")
            tarefa.atribuido_a = target_user
        except CustomUser.DoesNotExist:
            tarefa.atribuido_a = None
    if data.lead_id is not None:
        tarefa.lead_id = data.lead_id

    tarefa.save()
    return tarefa


@api.delete("/tarefas/{tarefa_id}", auth=AuthBearer())
def delete_tarefa(request, tarefa_id: int):
    t = Tarefa.objects.filter(id=tarefa_id).first()
    if not t:
        return api.create_response(request, {"detail": "Tarefa not found"}, status=404)
    t.delete()
    return {"success": True}

# -------------------------------------------------------------------
# ORIENTAÇÕES
# -------------------------------------------------------------------

@api.post("/orientacoes", response=OrientacaoOut, auth=AuthBearer())
def create_orientacao(request, data: OrientacaoIn):
    clinica = Clinica.objects.filter(id=data.clinica_id).first()
    if not clinica:
        return api.create_response(request, {"detail": "Clinica not found"}, status=404)
        
    assunto = None
    if data.assunto_id:
        assunto = AssuntoOrientacao.objects.filter(id=data.assunto_id).first()

    orientacao = Orientacao.objects.create(
        clinica=clinica,
        paciente_nome=data.paciente_nome,
        assunto=assunto,
        assunto_texto=data.assunto_texto,
        descricao=data.descricao
    )
    return orientacao

@api.get("/assuntos-orientacao", response=List[AssuntoOrientacaoOut], auth=AuthBearer())
def list_assuntos_orientacao(request, clinica_id: int):
    return list(AssuntoOrientacao.objects.filter(clinica_id=clinica_id))

@api.post("/assuntos-orientacao", response=AssuntoOrientacaoOut, auth=AuthBearer())
def create_assunto_orientacao(request, data: AssuntoOrientacaoIn):
    clinica = Clinica.objects.filter(id=data.clinica_id).first()
    if not clinica:
        return api.create_response(request, {"detail": "Clinica not found"}, status=404)
    return AssuntoOrientacao.objects.create(clinica=clinica, nome=data.nome)

@api.delete("/assuntos-orientacao/{assunto_id}", auth=AuthBearer())
def delete_assunto_orientacao(request, assunto_id: int):
    AssuntoOrientacao.objects.filter(id=assunto_id).delete()
    return {"success": True}

@api.get("/orientacoes", response=List[OrientacaoOut], auth=AuthBearer())
def list_orientacoes(request, clinica_id: int = None):
    qs = Orientacao.objects.all().order_by('-created_at')
    if clinica_id:
        qs = qs.filter(clinica_id=clinica_id)
    return list(qs)

@api.delete("/orientacoes/{orientacao_id}", auth=AuthBearer())
def delete_orientacao(request, orientacao_id: int):
    o = Orientacao.objects.filter(id=orientacao_id).first()
    if not o:
        return api.create_response(request, {"detail": "Orientacao not found"}, status=404)
    o.delete()
    return {"success": True}

@api.get("/kanban-columns", response=List[KanbanColumnOut], auth=AuthBearer())
def list_kanban_columns(request, clinica_id: int):
    cols = KanbanColumn.objects.filter(clinica_id=clinica_id).order_by('ordenacao', 'id')
    if not cols.exists():
        defaults = [
            ("NOVO", "Novo Lead", "bg-indigo-50 border-indigo-200 text-indigo-700", 0),
            ("EM_ATENDIMENTO", "Em Atendimento", "bg-amber-50 border-amber-200 text-amber-700", 1),
            ("CONSULTA_MARCADA", "Consulta Marcada", "bg-emerald-50 border-emerald-200 text-emerald-700", 2),
            ("ENCERRADO", "Encerrado", "bg-teal-50 border-teal-200 text-teal-700", 3),
            ("PERDIDO", "Perdido", "bg-rose-50 border-rose-200 text-rose-700", 4),
        ]
        for key, title, color, ord_val in defaults:
            KanbanColumn.objects.create(clinica_id=clinica_id, title=title, key=key, color=color, ordenacao=ord_val)
        cols = KanbanColumn.objects.filter(clinica_id=clinica_id).order_by('ordenacao', 'id')
    return cols

@api.post("/kanban-columns", response=KanbanColumnOut, auth=AuthBearer())
def create_kanban_column(request, data: KanbanColumnIn):
    try:
        clinica = Clinica.objects.get(id=data.clinica_id)
    except Clinica.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Clinica not found")
    col = KanbanColumn.objects.create(
        clinica=clinica,
        title=data.title,
        key=data.key,
        color=data.color or 'bg-indigo-50 border-indigo-200 text-indigo-700',
        ordenacao=data.ordenacao or 0
    )
    return col

@api.patch("/kanban-columns/{column_id}", response=KanbanColumnOut, auth=AuthBearer())
def update_kanban_column(request, column_id: int, data: KanbanColumnUpdateIn):
    try:
        col = KanbanColumn.objects.get(id=column_id)
    except KanbanColumn.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Column not found")
    for attr, value in data.dict(exclude_unset=True).items():
        if value is not None:
            setattr(col, attr, value)
    col.save()
    return col

@api.delete("/kanban-columns/{column_id}", auth=AuthBearer())
def delete_kanban_column(request, column_id: int):
    from leads.models import Lead, KanbanColumn
    try:
        col = KanbanColumn.objects.get(id=column_id)
    except KanbanColumn.DoesNotExist:
        from ninja.errors import HttpError
        raise HttpError(404, "Column not found")

    clinica_id = col.clinica_id
    deleted_key = col.key

    affected_leads = Lead.objects.filter(clinica_id=clinica_id, status=deleted_key)
    if affected_leads.exists():
        target_col, created = KanbanColumn.objects.get_or_create(
            clinica_id=clinica_id,
            key="LEADS_SEM_TRATAMENTO",
            defaults={
                "title": "Leads sem tratamento",
                "color": "bg-slate-50/70 border-slate-200 text-slate-700",
                "ordenacao": KanbanColumn.objects.filter(clinica_id=clinica_id).count() + 1
            }
        )
        affected_leads.update(status="LEADS_SEM_TRATAMENTO")

    col.delete()
    return {"status": "success"}


