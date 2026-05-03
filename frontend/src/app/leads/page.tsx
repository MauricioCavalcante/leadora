'use client';

import React, { useState } from 'react';
import { useDashboard } from '../dashboard/context';
import { API_URL } from '@/config';

export default function LeadsPage() {
  const {
    token,
    selectedClinicaId,
    leads,
    setLeads,
    fetchLeads,
    interesses,
    setInteresses,
    fetchInteresses,
  } = useDashboard();

  const [editLead, setEditLead] = useState<any>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [dataPrimeiroContato, setDataPrimeiroContato] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('');
  const [faltas, setFaltas] = useState(0);
  const [selectedInteresseId, setSelectedInteresseId] = useState<any>('');
  const [compareceu, setCompareceu] = useState(false);

  React.useEffect(() => {
    if (token && selectedClinicaId) {
      fetchLeads(token, selectedClinicaId);
      if (fetchInteresses) {
        fetchInteresses(token, selectedClinicaId);
      }
    }
  }, [token, selectedClinicaId]);

  const openEditModal = (lead: any) => {
    setEditLead(lead);
    setNome(lead.nome || '');
    setEmail(lead.email || '');
    setTelefone(lead.telefone || '');
    setDataNascimento(lead.data_nascimento || '');
    setDataPrimeiroContato(lead.data_primeiro_contato || '');
    setObservacoes(lead.observacoes || '');
    setStatus(lead.status || 'NOVO');
    setFaltas(lead.faltas || 0);
    setSelectedInteresseId(lead.interesse ? lead.interesse.id : '');
    setCompareceu(lead.compareceu || false);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
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
          data_primeiro_contato: dataPrimeiroContato || null,
          observacoes,
          status,
          faltas,
          interesse_id: selectedInteresseId || null,
          compareceu,
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

  const handleDeleteLead = async (leadId: number) => {
    if (!token || !selectedClinicaId) return;
    if (!confirm('Tem certeza que deseja excluir permanentemente este lead?')) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchLeads(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateFaltas = async (leadId: number, currentFaltas: number, delta: number) => {
    if (!token || !selectedClinicaId) return;

    const nextFaltas = Math.max(0, currentFaltas + delta);
    const updatedLeads = leads.map((l) => (l.id === leadId ? { ...l, faltas: nextFaltas } : l));
    setLeads(updatedLeads);

    try {
      await fetch(`${API_URL}/api/v1/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ faltas: nextFaltas }),
      });
    } catch (err) {
      fetchLeads(token, selectedClinicaId);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-7xl mx-auto px-2 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Leads</h2>
          <p className="text-xs text-slate-400 font-medium">Gestão completa de leads recebidos ou criados manualmente</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        {leads.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-12 select-none">
            Nenhum lead encontrado no momento.
          </p>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white select-none">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Lead</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Contato</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Primeiro Contato</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider">Faltas</th>
                  <th className="py-3.5 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-800 tracking-tight">{l.nome}</span>
                        {l.observacoes && (
                          <span className="text-xs text-slate-400 font-medium line-clamp-1 max-w-xs">{l.observacoes}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-brand-blue bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-xl w-max">
                          {l.telefone || '-'}
                        </span>
                        {l.email && <span className="text-xs text-slate-400 font-medium">{l.email}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-slate-500 font-medium">
                        {l.data_primeiro_contato ? new Date(l.data_primeiro_contato).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-black tracking-wider bg-slate-50 text-slate-600 border border-slate-100 px-2 py-1 rounded-xl">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateFaltas(l.id, l.faltas, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition font-black text-sm select-none cursor-pointer active:scale-[0.94]"
                        >
                          -
                        </button>
                        <span className="text-sm font-extrabold text-slate-800 w-5 text-center">{l.faltas}</span>
                        <button
                          onClick={() => handleUpdateFaltas(l.id, l.faltas, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-brand-blue/5 hover:bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl transition font-black text-sm select-none cursor-pointer active:scale-[0.94]"
                        >
                          +
                        </button>
                      </div>
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
                          onClick={() => handleDeleteLead(l.id)}
                          className="px-3 py-1.5 flex items-center gap-1.5 bg-red-50 hover:bg-red-100/80 border border-red-100 hover:border-red-200 text-red-600 rounded-xl transition text-xs font-bold cursor-pointer select-none active:scale-[0.96]"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir
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
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-slate-100 select-none flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Editar Lead Completo</h3>
              <p className="text-xs text-slate-400 font-medium">Atualize todas as informações sobre este lead.</p>
            </div>

            <form onSubmit={handleUpdateLead} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data do Primeiro Contato</label>
                  <input
                    type="date"
                    value={dataPrimeiroContato}
                    onChange={(e) => setDataPrimeiroContato(e.target.value)}
                    className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faltas</label>
                  <input
                    type="number"
                    min={0}
                    value={faltas}
                    onChange={(e) => setFaltas(parseInt(e.target.value || '0'))}
                    className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                >
                  <option value="NOVO">NOVO</option>
                  <option value="FUP_1">FUP 1</option>
                  <option value="FUP_2">FUP 2</option>
                  <option value="FUP_3">FUP 3</option>
                  <option value="FUP_4">FUP 4</option>
                  <option value="AGENDADO">AGENDADO</option>
                  <option value="COMPARECEU">COMPARECEU</option>
                  <option value="FALTOU">FALTOU</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interesse</label>
                <select
                  value={selectedInteresseId || ''}
                  onChange={(e) => setSelectedInteresseId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition"
                >
                  <option value="">Nenhum interesse definido</option>
                  {interesses?.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="edit_leads_compareceu"
                  checked={compareceu}
                  onChange={(e) => setCompareceu(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-green border-slate-300 focus:ring-brand-green cursor-pointer"
                />
                <label htmlFor="edit_leads_compareceu" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Compareceu
                </label>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Observações</label>
                <textarea
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: Lead demonstrou interesse no procedimento..."
                  className="w-full text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 transition resize-none"
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
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
