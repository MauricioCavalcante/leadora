'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../../dashboard/context';
import { API_URL } from '@/config';

interface Clinica {
  id: number;
  uuid?: string;
  nome: string;
  slug: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

interface Profissional {
  id: number;
  username: string;
  role: string;
  email: string;
  telefone?: string;
}

export default function ClinicaDetailPage({ params }: { params: React.Usable<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const clinicIdOrUuid = resolvedParams.id;

  const { token, fetchClinicas } = useDashboard();

  // General state
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Team states
  const [associatedProfissionais, setAssociatedProfissionais] = useState<Profissional[]>([]);
  const [allProfissionais, setAllProfissionais] = useState<Profissional[]>([]);
  const [selectedProfissionalId, setSelectedProfissionalId] = useState<number | ''>('');

  // New professional creation state
  const [isNewProfOpen, setIsNewProfOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('MEDICO');
  const [newTelefone, setNewTelefone] = useState('');
  const [profError, setProfError] = useState('');

  // Edit professional state
  const [isEditProfOpen, setIsEditProfOpen] = useState(false);
  const [editProfId, setEditProfId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editError, setEditError] = useState('');

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_');
  };

  const handleNomeChange = (val: string) => {
    setNome(val);
    setSlug(generateSlug(val));
  };

  const fetchClinicaDetail = async () => {
    if (!token || !clinicIdOrUuid) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/clinicas/${clinicIdOrUuid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClinica(data);
        setNome(data.nome);
        setSlug(data.slug);
        setEmail(data.email || '');
        setTelefone(data.telefone || '');
        setEndereco(data.endereco || '');
        fetchTeam(data.id);
      } else {
        setError('Não foi possível carregar os detalhes da clínica.');
      }
    } catch (err) {
      setError('Erro de rede ao buscar dados da clínica.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async (cid: number) => {
    if (!token) return;
    try {
      // Fetch clinic's associated professionals
      const resLinked = await fetch(`${API_URL}/api/v1/profissionais?clinica_id=${cid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resLinked.ok) {
        setAssociatedProfissionais(await resLinked.json());
      }

      // Fetch all professionals in the workspace
      const resAll = await fetch(`${API_URL}/api/v1/workspace-profissionais`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resAll.ok) {
        setAllProfissionais(await resAll.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token && clinicIdOrUuid) {
      fetchClinicaDetail();
    }
  }, [token, clinicIdOrUuid]);

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !clinica) return;
    setError('');

    const idOrUuid = clinica.uuid || clinica.id;

    try {
      const res = await fetch(`${API_URL}/api/v1/clinicas/${idOrUuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, slug, email, telefone, endereco }),
      });

      if (res.ok) {
        fetchClinicas(token);
        alert('Clínica atualizada com sucesso!');
      } else {
        const data = await res.json();
        setError(data.detail || 'Erro ao atualizar clínica.');
      }
    } catch (err) {
      setError('Erro de rede ao atualizar clínica.');
    }
  };

  const handleAssociateProfissional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !clinica || !selectedProfissionalId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/profissionais/associar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: selectedProfissionalId,
          clinica_id: clinica.id,
        }),
      });

      if (res.ok) {
        setSelectedProfissionalId('');
        fetchTeam(clinica.id);
      } else {
        alert('Erro ao associar profissional.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisassociateProfissional = async (userId: number) => {
    if (!token || !clinica) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/profissionais/desassociar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          clinica_id: clinica.id,
        }),
      });

      if (res.ok) {
        fetchTeam(clinica.id);
      } else {
        alert('Erro ao desvincular profissional.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNewProfissional = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfError('');
    if (!token || !clinica) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/profissionais`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinica_id: clinica.id,
          username: newUsername,
          password: newPassword,
          email: newEmail,
          role: newRole,
          telefone: newTelefone || null,
        }),
      });

      if (res.ok) {
        setNewUsername('');
        setNewPassword('');
        setNewEmail('');
        setNewRole('MEDICO');
        setNewTelefone('');
        setIsNewProfOpen(false);
        fetchTeam(clinica.id);
      } else {
        const d = await res.json();
        setProfError(d.detail || 'Erro ao criar profissional.');
      }
    } catch (err) {
      setProfError('Erro na requisição.');
    }
  };

  const openEditProfModal = (p: Profissional) => {
    setEditProfId(p.id);
    setEditUsername(p.username);
    setEditEmail(p.email);
    setEditPassword('');
    setEditRole(p.role);
    setEditTelefone(p.telefone || '');
    setEditError('');
    setIsEditProfOpen(true);
  };

  const handleEditProfissional = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!token || !clinica || !editProfId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/profissionais/${editProfId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: editUsername || undefined,
          email: editEmail || undefined,
          password: editPassword || undefined,
          role: editRole || undefined,
          telefone: editTelefone || null,
        }),
      });

      if (res.ok) {
        setIsEditProfOpen(false);
        fetchTeam(clinica.id);
      } else {
        const d = await res.json();
        setEditError(d.detail || 'Erro ao editar profissional.');
      }
    } catch (err) {
      setEditError('Erro na requisição.');
    }
  };

  const handleDeleteProfissional = async (userId: number) => {
    if (!token || !clinica) return;
    if (!confirm('Deseja realmente excluir este profissional? Esta ação é irreversível.')) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/profissionais/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchTeam(clinica.id);
      } else {
        const d = await res.json();
        alert(d.detail || 'Erro ao deletar profissional.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unlinkedProfissionais = allProfissionais.filter(
    (p) => !associatedProfissionais.some((ap) => ap.id === p.id)
  );

  const medicos = associatedProfissionais.filter((p) => p.role === 'MEDICO');
  const secretarias = associatedProfissionais.filter((p) => p.role === 'SECRETARIA');
  const gestores = associatedProfissionais.filter((p) => p.role === 'GESTOR');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center select-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-blue animate-spin mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span className="text-sm text-slate-400 font-bold tracking-tight">Carregando dados da clínica...</span>
      </div>
    );
  }

  if (error || !clinica) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center select-none m-4">
        <h4 className="text-base font-extrabold tracking-tight">Erro</h4>
        <p className="text-xs font-medium mt-1">{error || 'Clínica não encontrada.'}</p>
        <button
          onClick={() => router.push('/administrativo')}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition text-sm cursor-pointer shadow-sm inline-block"
        >
          Voltar para Clínicas
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 max-w-5xl mx-auto select-none">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/administrativo')}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl shadow-sm hover:shadow-md active:scale-95 transition cursor-pointer text-slate-500 hover:text-slate-800"
          title="Voltar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
            {clinica.nome}
          </h1>
          <span className="text-xs text-slate-400 font-medium">Informações e Gerenciamento de Equipe</span>
        </div>
      </div>

      {/* Grid: 2 columns in large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left column: Clinic Details Form (3 cols) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">
              Informações Gerais
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Visualize ou edite as informações de contato desta clínica
            </p>
          </div>

          <form onSubmit={handleSaveClinic} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Nome da Clínica *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => handleNomeChange(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
              />
            </div>

            <div className="flex flex-col">
              <input
                type="text"
                hidden
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Telefone (Contato)</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Opcional"
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Email (Contato)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Opcional"
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Endereço</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Opcional"
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
              />
            </div>

            <button
              type="submit"
              className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-3 rounded-xl transition shadow-md active:scale-[0.98] cursor-pointer mt-2"
            >
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Right column: Association actions (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Associate an existing professional */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">
                Vincular Profissional
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Adicione à clínica profissionais já cadastrados no seu workspace
              </p>
            </div>

            <form onSubmit={handleAssociateProfissional} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Escolha o Profissional</label>
                <select
                  required
                  value={selectedProfissionalId}
                  onChange={(e) => setSelectedProfissionalId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Selecione um profissional</option>
                  {unlinkedProfissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.username} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={!selectedProfissionalId}
                className="bg-brand-green hover:bg-brand-green/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl transition shadow-md active:scale-[0.98] cursor-pointer"
              >
                Associar
              </button>
            </form>
          </div>

          {/* Prompt to register a new professional */}
          <div className="bg-indigo-50/40 p-6 rounded-2xl border border-indigo-100/50 flex flex-col gap-3">
            <div>
              <h3 className="text-sm font-black text-indigo-900 tracking-tight">Profissional não cadastrado?</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                Você pode cadastrar um novo médico ou secretária diretamente no workspace.
              </p>
            </div>
            <button
              onClick={() => {
                setProfError('');
                setIsNewProfOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-sm hover:shadow-md cursor-pointer text-sm"
            >
              + Novo Profissional
            </button>
          </div>
        </div>
      </div>

      {/* TEAM SECTION (ManyToMany listing of doctors and secretaries) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
            Relação da Equipe da Clínica
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Veja a equipe vinculada a esta clínica e remova profissionais se necessário
          </p>
        </div>

        {/* Doctors Table */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Médicos ({medicos.length})
          </h4>
          {medicos.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium italic pl-3">Nenhum médico cadastrado para esta clínica.</p>
          ) : (
            <div className="overflow-x-auto select-none border border-slate-100 rounded-xl bg-slate-50/30">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone</th>
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {medicos.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4">
                        <span className="text-sm font-bold text-slate-800">{u.username}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs text-slate-500 font-medium">{u.telefone || '-'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleDisassociateProfissional(u.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer transition"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Secretaries Table */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Secretárias ({secretarias.length})
          </h4>
          {secretarias.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium italic pl-3">Nenhuma secretária cadastrada para esta clínica.</p>
          ) : (
            <div className="overflow-x-auto select-none border border-slate-100 rounded-xl bg-slate-50/30">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone</th>
                    <th className="py-2.5 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {secretarias.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4">
                        <span className="text-sm font-bold text-slate-800">{u.username}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs text-slate-500 font-medium">{u.email}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-xs text-slate-500 font-medium">{u.telefone || '-'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          onClick={() => handleDisassociateProfissional(u.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer transition"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* NEW PROFESSIONAL MODAL */}
      {isNewProfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in-0 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Criar Profissional</h3>
                <p className="text-xs text-slate-400 font-medium">Cadastre um profissional no seu workspace</p>
              </div>
              <button
                onClick={() => setIsNewProfOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateNewProfissional} className="p-6 grid grid-cols-2 gap-4 overflow-y-auto max-h-[80vh]">
              {profError && (
                <div className="col-span-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium">
                  {profError}
                </div>
              )}

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Usuário *</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: dr_carla"
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Senha *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ex: carla@clinica.com"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Cargo *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="GESTOR">Gestor</option>
                  <option value="MEDICO">Médico</option>
                  <option value="SECRETARIA">Secretária</option>
                </select>
              </div>

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Telefone (Opcional)</label>
                <input
                  type="text"
                  value={newTelefone}
                  onChange={(e) => setNewTelefone(e.target.value)}
                  placeholder="Ex: (62) 98888-7777"
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="col-span-2 flex justify-end items-center gap-3 mt-2 border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewProfOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer text-sm shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl transition cursor-pointer text-sm shadow-md active:scale-[0.98]"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFESSIONAL MODAL */}
      {isEditProfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in-0 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Editar Profissional</h3>
                <p className="text-xs text-slate-400 font-medium">Altere os dados do profissional</p>
              </div>
              <button
                onClick={() => setIsEditProfOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditProfissional} className="p-6 grid grid-cols-2 gap-4 overflow-y-auto max-h-[80vh]">
              {editError && (
                <div className="col-span-2 bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium">
                  {editError}
                </div>
              )}

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Usuário *</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Senha (opcional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Deixe em branco p/ manter"
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Cargo *</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="GESTOR">Gestor</option>
                  <option value="MEDICO">Médico</option>
                  <option value="SECRETARIA">Secretária</option>
                </select>
              </div>

              <div className="col-span-1 flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Telefone (Opcional)</label>
                <input
                  type="text"
                  value={editTelefone}
                  onChange={(e) => setEditTelefone(e.target.value)}
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="col-span-2 flex justify-end items-center gap-3 mt-2 border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditProfOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer text-sm shadow-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white font-bold rounded-xl transition cursor-pointer text-sm shadow-md active:scale-[0.98]"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
