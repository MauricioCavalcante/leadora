'use client';

import React, { useState } from 'react';
import { useDashboard, Consulta } from '../dashboard/context';
import { API_URL } from '@/config';

export default function ConsultasPage() {
  const {
    token,
    selectedClinicaId,
    leads,
    consultas,
    fetchConsultas,
    fetchLeads,
  } = useDashboard();

  React.useEffect(() => {
    if (token && selectedClinicaId) {
      fetchLeads(token, selectedClinicaId);
      fetchConsultas(token, selectedClinicaId);
    }
  }, [token, selectedClinicaId]);

  // Create Consulta fields
  const [modalConsLeadId, setModalConsLeadId] = useState<number | ''>('');
  const [modalConsDataHora, setModalConsDataHora] = useState('');
  const [modalConsObs, setModalConsObs] = useState('');
  const [modalConsValor, setModalConsValor] = useState('');
  const [modalConsDataLembrete, setModalConsDataLembrete] = useState('');
  const [modalConsResolvido, setModalConsResolvido] = useState(false);
  const [isCreateConsultaModalOpen, setIsCreateConsultaModalOpen] = useState(false);

  // Edit Consulta fields
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null);
  const [editConsDataHora, setEditConsDataHora] = useState('');
  const [editConsObs, setEditConsObs] = useState('');
  const [editConsValor, setEditConsValor] = useState('');
  const [editConsDataLembrete, setEditConsDataLembrete] = useState('');
  const [editConsResolvido, setEditConsResolvido] = useState(false);

  const handleCreateConsultaModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId || !modalConsLeadId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/consultas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinica_id: selectedClinicaId,
          lead_id: modalConsLeadId,
          data_hora: modalConsDataHora,
          observacoes: modalConsObs || null,
          status: 'AGENDADO',
          valor: modalConsValor ? parseFloat(modalConsValor) : null,
          data_lembrete: modalConsDataLembrete || null,
          resolvido: modalConsResolvido,
        }),
      });

      if (res.ok) {
        setIsCreateConsultaModalOpen(false);
        setModalConsLeadId('');
        setModalConsDataHora('');
        setModalConsObs('');
        setModalConsValor('');
        setModalConsDataLembrete('');
        setModalConsResolvido(false);
        fetchConsultas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId || !editingConsulta) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/consultas/${editingConsulta.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data_hora: editConsDataHora,
          observacoes: editConsObs || null,
          valor: editConsValor ? parseFloat(editConsValor) : null,
          data_lembrete: editConsDataLembrete || null,
          resolvido: editConsResolvido,
        }),
      });

      if (res.ok) {
        setEditingConsulta(null);
        setEditConsDataHora('');
        setEditConsObs('');
        setEditConsValor('');
        setEditConsDataLembrete('');
        setEditConsResolvido(false);
        fetchConsultas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConsultaStatusDirectly = async (consulta: Consulta, nextStatus: string) => {
    if (!token || !selectedClinicaId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/consultas/${consulta.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        fetchConsultas(token, selectedClinicaId);
        fetchLeads(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConsulta = async (consultaId: number) => {
    if (!token || !selectedClinicaId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/consultas/${consultaId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchConsultas(token, selectedClinicaId);
        fetchLeads(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (c: Consulta) => {
    setEditingConsulta(c);
    setEditConsDataHora(c.data_hora ? c.data_hora.substring(0, 16) : '');
    setEditConsObs(c.observacoes || '');
    setEditConsValor(c.valor !== undefined && c.valor !== null ? c.valor.toString() : '');
    setEditConsDataLembrete(c.data_lembrete || '');
    setEditConsResolvido(c.resolvido || false);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Marcação de Consultas</h2>
          <p className="text-xs text-slate-400 font-medium">Agende e gerencie o comparecimento de cada paciente</p>
        </div>
        <button
          onClick={() => setIsCreateConsultaModalOpen(true)}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-2 px-4 rounded-xl shadow-md transition active:scale-[0.98] flex items-center gap-2 text-sm cursor-pointer select-none"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Nova Consulta
        </button>
      </div>

      {/* Table listing */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        {consultas.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-6 select-none">
            Nenhuma consulta agendada no momento.
          </p>
        ) : (
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Paciente / Contato</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Info Lead</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Interesse</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Consulta</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Lembrete</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Valor / Pago</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Compareceu</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Resolvido</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Obs</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {consultas.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col select-none">
                        <span className="text-sm font-bold text-slate-800 tracking-tight leading-normal whitespace-nowrap">
                          {c.lead ? c.lead.nome : 'Sem Lead'}
                        </span>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                          {c.lead ? c.lead.telefone : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col select-none whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-400">Nascimento:</span>
                        <span className="text-xs font-bold text-slate-600">
                          {c.lead?.data_nascimento ? new Date(c.lead.data_nascimento).toLocaleDateString('pt-BR') : '-'}
                        </span>
                        <span className="text-xs font-medium text-slate-400 mt-1">1º Contato:</span>
                        <span className="text-xs font-bold text-slate-600">
                          {c.lead?.data_primeiro_contato ? new Date(c.lead.data_primeiro_contato).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-1 rounded-xl leading-none whitespace-nowrap">
                        {c.lead?.interesse ? c.lead.interesse.nome : 'Nenhum'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl leading-none whitespace-nowrap">
                        {c.data_hora ? new Date(c.data_hora).toLocaleString('pt-BR') : 'Sem data'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.data_lembrete ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100/60 px-2.5 py-1 rounded-xl leading-none whitespace-nowrap">
                          {new Date(c.data_lembrete).toLocaleDateString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-xl leading-none whitespace-nowrap">
                        {c.valor !== undefined && c.valor !== null ? `R$ ${parseFloat(c.valor.toString()).toFixed(2)}` : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={c.status || 'AGENDADO'}
                        onChange={(e) => handleUpdateConsultaStatusDirectly(c, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl border transition focus:outline-none cursor-pointer ${
                          c.status === 'COMPARECEU'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'FALTOU'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}
                      >
                        <option value="AGENDADO">Agendado</option>
                        <option value="COMPARECEU">Compareceu</option>
                        <option value="FALTOU">Faltou</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border leading-none ${
                          c.resolvido
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {c.resolvido ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-slate-400 font-medium leading-normal break-words max-w-xs block">
                        {c.observacoes || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEditModal(c)}
                          className="text-xs font-black text-brand-blue hover:text-brand-blue/80 bg-brand-blue/5 hover:bg-brand-blue/10 px-2.5 py-1 rounded-xl transition cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteConsulta(c.id)}
                          className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition cursor-pointer"
                        >
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

      {/* Nova Consulta Modal */}
      {isCreateConsultaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col gap-5 transform transition animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Marcar Nova Consulta</h3>
                <p className="text-xs text-slate-400 font-medium">Selecione o paciente e as novas informações</p>
              </div>
              <button
                onClick={() => setIsCreateConsultaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateConsultaModal} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Lead / Paciente *</label>
                <select
                  required
                  value={modalConsLeadId}
                  onChange={(e) => setModalConsLeadId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Selecione o lead</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome} ({l.telefone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Data e Horário *</label>
                <input
                  type="datetime-local"
                  required
                  value={modalConsDataHora}
                  onChange={(e) => setModalConsDataHora(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Valor da Consulta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  value={modalConsValor}
                  onChange={(e) => setModalConsValor(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Data do Lembrete</label>
                <input
                  type="date"
                  value={modalConsDataLembrete}
                  onChange={(e) => setModalConsDataLembrete(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="modalConsResolvido"
                  checked={modalConsResolvido}
                  onChange={(e) => setModalConsResolvido(e.target.checked)}
                  className="w-4 h-4 text-brand-blue border-slate-300 rounded focus:ring-brand-blue"
                />
                <label htmlFor="modalConsResolvido" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Resolvido (Encerramento da Consulta)
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Observações</label>
                <textarea
                  value={modalConsObs}
                  onChange={(e) => setModalConsObs(e.target.value)}
                  placeholder="Ex: Primeira consulta do paciente"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold h-20 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Consulta Modal */}
      {editingConsulta && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col gap-5 transform transition animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Editar Consulta</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Paciente: <span className="text-brand-blue font-bold">{editingConsulta.lead?.nome}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingConsulta(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateConsulta} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Data e Hora *</label>
                <input
                  type="datetime-local"
                  required
                  value={editConsDataHora}
                  onChange={(e) => setEditConsDataHora(e.target.value)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Valor da Consulta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 150.00"
                  value={editConsValor}
                  onChange={(e) => setEditConsValor(e.target.value)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Data do Lembrete</label>
                <input
                  type="date"
                  value={editConsDataLembrete}
                  onChange={(e) => setEditConsDataLembrete(e.target.value)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  id="editConsResolvido"
                  checked={editConsResolvido}
                  onChange={(e) => setEditConsResolvido(e.target.checked)}
                  className="w-4 h-4 text-brand-blue border-slate-300 rounded focus:ring-brand-blue"
                />
                <label htmlFor="editConsResolvido" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Resolvido (Encerramento da Consulta)
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Observações</label>
                <textarea
                  value={editConsObs}
                  onChange={(e) => setEditConsObs(e.target.value)}
                  placeholder="Ex: Primeira consulta do paciente"
                  className="px-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold h-20 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer"
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
