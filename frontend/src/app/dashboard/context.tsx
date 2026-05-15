'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';

export interface Clinica {
  id: number;
  nome: string;
  slug: string;
}

export interface Origem {
  id: number;
  nome: string;
}

export interface Lead {
  id: number;
  nome: string;
  email?: string;
  telefone: string;
  data_nascimento?: string;
  status: string;
  faltas: number;
  created_at?: string;
  origem?: { id: number; nome: string };
  origem_manual?: string;
  interesse?: { id: number; nome: string };
  interesse_manual?: string;
  compareceu?: boolean;
  fup1_feito?: boolean;
  fup2_feito?: boolean;
  fup3_feito?: boolean;
  fup4_feito?: boolean;
  pos_fup1_feito?: boolean;
  pos_fup2_feito?: boolean;
  pos_fup3_feito?: boolean;
  data_primeiro_contato?: string;
  observacoes?: string;
  salvar_contato?: boolean;
  resultado_fup?: string;
  resultado_pos_fup?: string;
}

export interface Consulta {
  id: number;
  lead: Lead;
  data_hora: string;
  observacoes?: string;
  status?: string;
  data_lembrete?: string;
  valor?: number;
  resolvido?: boolean;
  clinica?: { id: number; nome: string };
}

export interface Tarefa {
  id: number;
  descricao: string;
  tipo_repeticao: string;
  data_lembrete?: string | null;
  concluida: boolean;
  atribuido_a?: { id: number; username: string; role: string } | null;
  created_at: string;
}

export interface Profissional {
  id: number;
  username: string;
  role: string;
  email: string;
}

export interface Interesse {
  id: number;
  nome: string;
}

export interface AssuntoOrientacao {
  id: number;
  nome: string;
}

export interface Orientacao {
  id: number;
  paciente_nome: string;
  assunto?: AssuntoOrientacao;
  assunto_texto?: string;
  descricao?: string;
  created_at: string;
}

export interface DashboardContextType {
  token: string | null;
  username: string | null;
  role: string | null;
  clinicas: Clinica[];
  selectedClinicaId: number | null;
  setSelectedClinicaId: (id: number | null) => void;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  origens: Origem[];
  setOrigens: React.Dispatch<React.SetStateAction<Origem[]>>;
  interesses: Interesse[];
  setInteresses: React.Dispatch<React.SetStateAction<Interesse[]>>;
  consultas: Consulta[];
  setConsultas: React.Dispatch<React.SetStateAction<Consulta[]>>;
  tarefas: Tarefa[];
  setTarefas: React.Dispatch<React.SetStateAction<Tarefa[]>>;
  orientacoes: Orientacao[];
  setOrientacoes: React.Dispatch<React.SetStateAction<Orientacao[]>>;
  profissionais: Profissional[];
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (v: boolean) => void;
  loading: boolean;
  fetchLeads: (authToken: string, clinicaId: number) => void;
  fetchOrigens: (authToken: string, clinicaId: number) => void;
  fetchInteresses: (authToken: string, clinicaId: number) => void;
  fetchConsultas: (authToken: string, clinicaId: number) => void;
  fetchTarefas: (authToken: string, clinicaId: number) => void;
  fetchProfissionais: (authToken: string, clinicaId: number) => void;
  fetchOrientacoes: (authToken: string, clinicaId: number) => void;
  fetchClinicas: (authToken: string) => void;
  logout: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [selectedClinicaId, setSelectedClinicaId] = useState<number | null>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [origens, setOrigens] = useState<Origem[]>([]);
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [orientacoes, setOrientacoes] = useState<Orientacao[]>([]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('username') || '';
    const r = localStorage.getItem('role') || '';

    if (!t) {
      router.push('/login');
    } else {
      setToken(t);
      setUsername(u);
      setRole(r);
      fetchClinicas(t);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (!e.newValue) {
          router.push('/login');
        } else {
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchClinicas = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/clinicas`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setClinicas(data);
        if (data.length > 0) {
          let cid = data[0].id;
          const storedId = localStorage.getItem('selectedClinicaId');
          if (storedId) {
            const parsed = parseInt(storedId, 10);
            if (data.some((c: Clinica) => c.id === parsed)) {
              cid = parsed;
            }
          }
          setSelectedClinicaId(cid);
          fetchLeads(authToken, cid);
          fetchOrigens(authToken, cid);
          fetchInteresses(authToken, cid);
          fetchConsultas(authToken, cid);
          fetchTarefas(authToken, cid);
          fetchProfissionais(authToken, cid);
          fetchOrientacoes(authToken, cid);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeads = async (authToken: string, clinicaId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/v1/leads?clinica_id=${clinicaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrigens = async (authToken: string, clinicaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/origens?clinica_id=${clinicaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrigens(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInteresses = async (authToken: string, clinicaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/interesses?clinica_id=${clinicaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setInteresses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchConsultas = async (authToken: string, clinicaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/consultas?clinica_id=${clinicaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setConsultas(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTarefas = async (authToken: string, clinicaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/tarefas?clinica_id=${clinicaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setTarefas(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfissionais = async (authToken: string, clinicaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/profissionais?clinica_id=${clinicaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfissionais(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrientacoes = async (authToken: string, clinicaId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/orientacoes?clinica_id=${clinicaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setOrientacoes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    router.push('/login');
  };

  return (
    <DashboardContext.Provider
      value={{
        token,
        username,
        role,
        clinicas,
        selectedClinicaId,
        setSelectedClinicaId,
        leads,
        setLeads,
        origens,
        setOrigens,
        interesses,
        setInteresses,
        consultas,
        setConsultas,
        tarefas,
        setTarefas,
        orientacoes,
        setOrientacoes,
        profissionais,
        isSidebarExpanded,
        setIsSidebarExpanded,
        loading,
        fetchLeads,
        fetchOrigens,
        fetchInteresses,
        fetchConsultas,
        fetchTarefas,
        fetchProfissionais,
        fetchOrientacoes,
        fetchClinicas,
        logout,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
