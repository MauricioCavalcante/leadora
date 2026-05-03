# Leadora 🚀

Plataforma inteligente de captação, atendimento e acompanhamento de leads para clínicas médicas e estéticas.

O **Leadora** foi projetado para otimizar o processo de follow-up (FUP), conversão de pacientes e agendamento de consultas com interfaces intuitivas, relatórios visuais ricos e controle detalhado de leads.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Framework**: Next.js (App Router)
- **Estilização**: Tailwind CSS com Vanilla CSS
- **Estado**: React Context

### Backend
- **Framework**: Django & Django Ninja (APIs REST rápidas e tipadas)
- **Database**: PostgreSQL (ou SQLite para desenvolvimento local)

---

## ⚙️ Arquitetura do Projeto

O projeto é estruturado como um monorepo dividido em duas partes principais:

```
leadora/
├── backend/       # Código-fonte do Django
└── frontend/      # Código-fonte do Next.js
```

---

## 🚦 Como Iniciar o Projeto Localmente

### Pré-requisitos
- Python 3.10 ou superior
- Node.js 18 ou superior

### 1. Backend

Acesse o diretório do backend e configure o ambiente:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Ou no Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

O servidor backend estará disponível em `http://localhost:8000`.

### 2. Frontend

Acesse o diretório do frontend e inicialize o servidor de desenvolvimento:

```bash
cd frontend
npm install
npm run dev
```

O site estará disponível em `http://localhost:3000`.

---

## 📋 Histórico de Versões

O versionamento segue a especificação de Semantic Versioning (SemVer). Como o sistema ainda está em fase de pré-lançamento para produção, a versão atual é a **v0.9.0**.

### `v0.9.0` (Atual - Em Desenvolvimento)
- ✨ **Nova Coluna Kanban**: Adicionada a coluna **"Encerrado"** ao quadro Kanban.
- 🔄 **Status Mapping Automático**: Leads e consultas agora têm os status sincronizados automaticamente com o Kanban (Ex: Novos leads mudam para "Em Atendimento" ao marcar FUPs; criação de consultas altera para "Consulta Marcada"; consultas resolvidas e comparecidas movem para "Encerrado").
- 📊 **Card de Lembretes**: Novo painel no dashboard para visualização de lembretes de consultas agendadas ordenados por data.
- 🎨 **Layout Ajustado**: Redução na largura do menu recolhido (Sidebar) para um layout mais compacto (`w-16`) e inclusão do ícone animado de menu `panels-top-left` no hover.
- 📋 **FUP Pós-Consulta**: Nova página dedicada aos leads de pós-consulta.

### `v0.8.0`
- 📑 Adicionada página de FUP com filtros por data e interesses.
- 🏥 Correções na tabela de FUP para melhor alinhamento das datas de contato e checkboxes.
- 👥 Visualização e controle de contatos e leads por clínica.

### `v0.7.0`
- 📅 Criação da interface de agenda e consultas médicas com lembretes automáticos.
- 👤 Funcionalidades administrativas e controle de permissões por clínica para usuários com cargos como Gestor, Secretária e Médica.
- 🎂 Inclusão dos Aniversariantes do Dia e do Mês no dashboard principal.

---

## 📄 Licença

Este projeto é de uso interno e proprietário. Todos os direitos reservados.
