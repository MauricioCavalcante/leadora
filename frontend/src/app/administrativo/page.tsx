'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../dashboard/context';
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

export default function AdministrativoPage() {
  const router = useRouter();
  const {
    token,
    clinicas,
    fetchClinicas,
  } = useDashboard();

  // Modals visibility states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form fields
  const [currentClinica, setCurrentClinica] = useState<Clinica | null>(null);
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [error, setError] = useState('');

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/[^\w\s-]/g, '') // remove special chars
      .replace(/\s+/g, '_'); // space to snake_case
  };

  const handleNomeChange = (val: string) => {
    setNome(val);
    setSlug(generateSlug(val));
  };

  const resetForm = () => {
    setNome('');
    setSlug('');
    setEmail('');
    setTelefone('');
    setEndereco('');
    setError('');
    setCurrentClinica(null);
  };

  // List clinics on mount
  useEffect(() => {
    if (token) {
      fetchClinicas(token);
    }
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/v1/clinicas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, slug, email, telefone, endereco }),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        resetForm();
        fetchClinicas(token);
      } else {
        const data = await res.json();
        setError(data.detail || 'Erro ao criar clínica.');
      }
    } catch (err) {
      setError('Erro de rede ao tentar criar clínica.');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentClinica) return;
    setError('');

    const idOrUuid = currentClinica.uuid || currentClinica.id;

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
        setIsEditOpen(false);
        resetForm();
        fetchClinicas(token);
      } else {
        const data = await res.json();
        setError(data.detail || 'Erro ao editar clínica.');
      }
    } catch (err) {
      setError('Erro de rede ao tentar editar clínica.');
    }
  };

  const handleDelete = async () => {
    if (!token || !currentClinica) return;
    setError('');

    const idOrUuid = currentClinica.uuid || currentClinica.id;

    try {
      const res = await fetch(`${API_URL}/api/v1/clinicas/${idOrUuid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setIsDeleteOpen(false);
        resetForm();
        fetchClinicas(token);
      } else {
        const data = await res.json();
        setError(data.detail || 'Erro ao excluir clínica.');
      }
    } catch (err) {
      setError('Erro de rede ao tentar excluir clínica.');
    }
  };

  const openEditModal = (e: React.MouseEvent, clinica: Clinica) => {
    e.stopPropagation();
    setCurrentClinica(clinica);
    setNome(clinica.nome);
    setSlug(clinica.slug);
    setEmail(clinica.email || '');
    setTelefone(clinica.telefone || '');
    setEndereco(clinica.endereco || '');
    setError('');
    setIsEditOpen(true);
  };

  const openDeleteModal = (e: React.MouseEvent, clinica: Clinica) => {
    e.stopPropagation();
    setCurrentClinica(clinica);
    setError('');
    setIsDeleteOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 select-none p-4 max-w-7xl mx-auto">
      {/* Header section with Create Clinic Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Gestão de Clínicas
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Gerencie todas as clínicas do seu empreendimento de forma unificada
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="w-full md:w-auto bg-brand-blue hover:bg-brand-blue/90 text-white font-bold px-5 py-3 rounded-xl transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Clínica
        </button>
      </div>

      {/* Grid listing all clinics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinicas && clinicas.map((c: Clinica) => (
          <div
            key={c.id}
            onClick={() => router.push(`/administrativo/${c.uuid || c.id}`)}
            className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 cursor-pointer hover:shadow-lg hover:border-slate-200/80 hover:-translate-y-1 transition duration-300"
          >
            {/* Actions overlay visible on hover */}
            <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => openEditModal(e, c)}
                className="p-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 rounded-xl transition cursor-pointer shadow-sm"
                title="Editar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={(e) => openDeleteModal(e, c)}
                className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl transition cursor-pointer shadow-sm"
                title="Excluir"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            {/* General Info */}
            <div className="flex flex-col gap-1 pr-16">
              <h3 className="text-xl font-bold text-slate-800 group-hover:text-brand-blue transition">
                {c.nome}
              </h3>
              <p className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md self-start border border-slate-100">
                {c.slug}
              </p>
            </div>

            <div className="border-t border-slate-50 mt-1 pt-3 flex flex-col gap-2">
              {c.email && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {c.email}
                </div>
              )}
              {c.telefone && (
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1c-10.16 0-18-7.84-18-18v-1z" />
                  </svg>
                  {c.telefone}
                </div>
              )}
              {c.endereco && (
                <div className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="line-clamp-2 leading-relaxed">{c.endereco}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {(!clinicas || clinicas.length === 0) && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300 mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h4 className="text-base font-extrabold text-slate-700 tracking-tight">Nenhuma clínica encontrada</h4>
            <p className="text-xs text-slate-400 font-medium max-w-sm mt-1">
              Comece cadastrando uma nova clínica para seu negócio utilizando o botão no topo da página.
            </p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in-0 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Criar Clínica</h3>
                <p className="text-xs text-slate-400 font-medium">Defina as informações gerais da clínica</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Nome da Clínica *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => handleNomeChange(e.target.value)}
                  placeholder="Ex: Clínica Maju"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Identificador (Slug) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  placeholder="Ex: clinica_maju"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-mono font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Telefone (Opcional)</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (62) 98888-7777"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Email (Opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: contato@clinica.com"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Endereço (Opcional)</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Rua 12, N 45, Setor Sul"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="flex justify-end items-center gap-3 mt-2 border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
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

      {/* EDIT MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in-0 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Editar Clínica</h3>
                <p className="text-xs text-slate-400 font-medium">Modifique as informações gerais da clínica</p>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium">
                  {error}
                </div>
              )}

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

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Identificador (Slug) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-mono font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700">Endereço</label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-medium"
                />
              </div>

              <div className="flex justify-end items-center gap-3 mt-2 border-t border-slate-50 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
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

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col p-6 overflow-hidden animate-in fade-in-0 duration-200">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Excluir Clínica</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Tem certeza que deseja excluir a clínica <strong>{currentClinica?.nome}</strong>? Esta ação é irreversível.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium mt-3">
                {error}
              </div>
            )}

            <div className="flex justify-end items-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-100 text-slate-700 font-bold rounded-xl transition cursor-pointer text-sm shadow-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition cursor-pointer text-sm shadow-md active:scale-[0.98]"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
