'use client';

import React, { useState } from 'react';
import { useDashboard } from '../dashboard/context';
import { API_URL } from '@/config';

export default function ContatosPage() {
  const {
    token,
    selectedClinicaId,
    leads,
    setLeads,
    fetchLeads,
  } = useDashboard();

  const [editLead, setEditLead] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');

  React.useEffect(() => {
    if (token && selectedClinicaId) {
      fetchLeads(token, selectedClinicaId);
    }
  }, [token, selectedClinicaId]);

  const savedContacts = leads.filter((l) => l.salvar_contato);

  const openEditModal = (lead: any) => {
    setEditLead(lead);
    setNome(lead.nome || '');
    setEmail(lead.email || '');
    setTelefone(lead.telefone || '');
    setDataNascimento(lead.data_nascimento || '');
  };

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId || !editLead) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/leads/${editLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          data_nascimento: dataNascimento || null,
        }),
      });

      if (res.ok) {
        setEditLead(null);
        fetchLeads(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveContact = async (leadId: number) => {
    if (!token || !selectedClinicaId) return;

    try {
      await fetch(`${API_URL}/api/v1/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ salvar_contato: false }),
      });
      fetchLeads(token, selectedClinicaId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-7xl mx-auto px-2 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Contatos</h2>
          <p className="text-xs text-slate-400 font-medium">Lista de contatos salvos (leads marcados para salvar contato)</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        {savedContacts.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-12 select-none">
            Nenhum contato salvo no momento.
          </p>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white select-none">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Nome</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Telefone</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Data de Nascimento</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {savedContacts.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold text-slate-800 tracking-tight">{l.nome}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold text-brand-blue bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl">
                        {l.telefone || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-500 font-medium">
                        {l.email || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-500 font-medium">
                        {l.data_nascimento ? new Date(l.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(l)}
                          className="px-3 py-1.5 flex items-center gap-1.5 bg-brand-blue/5 hover:bg-brand-blue/10 border border-brand-blue/10 hover:border-brand-blue/20 text-brand-blue rounded-xl transition text-xs font-bold cursor-pointer select-none active:scale-[0.96]"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleRemoveContact(l.id)}
                          className="px-3 py-1.5 flex items-center gap-1.5 bg-red-50 hover:bg-red-100/80 border border-red-100 hover:border-red-200 text-red-600 rounded-xl transition text-xs font-bold cursor-pointer select-none active:scale-[0.96]"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-slate-100 select-none flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Editar Dados Pessoais</h3>
              <p className="text-xs text-slate-400 font-medium">Atualize as informações de contato do lead.</p>
            </div>

            <form onSubmit={handleUpdateContact} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditLead(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition text-xs font-bold cursor-pointer select-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white font-extrabold rounded-xl shadow-md shadow-brand-blue/10 hover:shadow-brand-blue/20 transition text-xs cursor-pointer select-none"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
