'use client';

import React, { useState } from 'react';
import { useDashboard, Tarefa } from '../dashboard/context';
import { API_URL } from '@/config';

export default function TarefasPage() {
  const {
    token,
    selectedClinicaId,
    tarefas,
    profissionais,
    leads,
    fetchTarefas,
    fetchLeads,
  } = useDashboard();

  React.useEffect(() => {
    if (token && selectedClinicaId) {
      fetchTarefas(token, selectedClinicaId);
      fetchLeads(token, selectedClinicaId);
    }
  }, [token, selectedClinicaId]);

  // Create Task fields
  const [isCreateTarefaModalOpen, setIsCreateTarefaModalOpen] = useState(false);
  const [desc, setDesc] = useState('');
  const [tipoRep, setTipoRep] = useState('PONTUAL');
  const [dataLemb, setDataLemb] = useState('');
  const [atribuidoId, setAtribuidoId] = useState<number | ''>('');
  const [leadId, setLeadId] = useState<number | ''>('');

  // Cyclic parameters for create
  const [weekday, setWeekday] = useState('1'); // Monday = 1
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [month, setMonth] = useState('1');

  // Edit Task fields
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [editDesc, setEditDesc] = useState('');
  const [editTipoRep, setEditTipoRep] = useState('PONTUAL');
  const [editDataLemb, setEditDataLemb] = useState('');
  const [editAtribuidoId, setEditAtribuidoId] = useState<number | ''>('');
  const [editLeadId, setEditLeadId] = useState<number | ''>('');

  // Cyclic parameters for edit
  const [editWeekday, setEditWeekday] = useState('1');
  const [editDayOfMonth, setEditDayOfMonth] = useState('1');
  const [editMonth, setEditMonth] = useState('1');

  // Compute next occurrence date in YYYY-MM-DD format
  const computeNextDate = (tipo: string, wd: string, dom: string, m: string) => {
    const now = new Date();
    let computed = new Date();

    if (tipo === 'DIARIA') {
      computed.setDate(now.getDate() + 1);
    } else if (tipo === 'SEMANAL') {
      const targetWd = parseInt(wd, 10);
      let currentWd = now.getDay();
      if (currentWd === 0) currentWd = 7; // Convert Sunday from 0 to 7
      let daysDiff = targetWd - currentWd;
      if (daysDiff <= 0) daysDiff += 7;
      computed.setDate(now.getDate() + daysDiff);
    } else if (tipo === 'MENSAL') {
      const targetDom = parseInt(dom, 10);
      computed.setDate(targetDom);
      if (computed <= now) {
        computed.setMonth(computed.getMonth() + 1);
      }
    } else if (tipo === 'ANUAL') {
      const targetDom = parseInt(dom, 10);
      const targetMonth = parseInt(m, 10) - 1;
      computed.setMonth(targetMonth, targetDom);
      if (computed <= now) {
        computed.setFullYear(computed.getFullYear() + 1);
      }
    }

    const year = computed.getFullYear();
    const mm = String(computed.getMonth() + 1).padStart(2, '0');
    const dd = String(computed.getDate()).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleCreateTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId) return;

    let finalDate = dataLemb;
    if (tipoRep !== 'PONTUAL') {
      finalDate = computeNextDate(tipoRep, weekday, dayOfMonth, month);
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/tarefas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinica_id: selectedClinicaId,
          descricao: desc,
          tipo_repeticao: tipoRep,
          data_lembrete: finalDate || null,
          atribuido_a_id: atribuidoId || null,
          lead_id: leadId || null,
        }),
      });

      if (res.ok) {
        setIsCreateTarefaModalOpen(false);
        setDesc('');
        setTipoRep('PONTUAL');
        setDataLemb('');
        setAtribuidoId('');
        setLeadId('');
        fetchTarefas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId || !editingTarefa) return;

    let finalDate = editDataLemb;
    if (editTipoRep !== 'PONTUAL') {
      finalDate = computeNextDate(editTipoRep, editWeekday, editDayOfMonth, editMonth);
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/tarefas/${editingTarefa.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descricao: editDesc,
          tipo_repeticao: editTipoRep,
          data_lembrete: finalDate || null,
          atribuido_a_id: editAtribuidoId || null,
          lead_id: editLeadId || null,
        }),
      });

      if (res.ok) {
        setEditingTarefa(null);
        setEditDesc('');
        setEditTipoRep('PONTUAL');
        setEditDataLemb('');
        setEditAtribuidoId('');
        setEditLeadId('');
        fetchTarefas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleConcluida = async (t: Tarefa) => {
    if (!token || !selectedClinicaId) return;

    let nextConcluida = !t.concluida;
    let nextDataLembrete = t.data_lembrete;

    if (nextConcluida && t.tipo_repeticao && t.tipo_repeticao !== 'PONTUAL') {
      nextConcluida = false;
      const current = t.data_lembrete ? new Date(t.data_lembrete + 'T12:00:00Z') : new Date();

      if (t.tipo_repeticao === 'DIARIA') {
        current.setDate(current.getDate() + 1);
      } else if (t.tipo_repeticao === 'SEMANAL') {
        current.setDate(current.getDate() + 7);
      } else if (t.tipo_repeticao === 'MENSAL') {
        current.setMonth(current.getMonth() + 1);
      } else if (t.tipo_repeticao === 'ANUAL') {
        current.setFullYear(current.getFullYear() + 1);
      }
      const y = current.getUTCFullYear();
      const m = String(current.getUTCMonth() + 1).padStart(2, '0');
      const d = String(current.getUTCDate()).padStart(2, '0');
      nextDataLembrete = `${y}-${m}-${d}`;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/tarefas/${t.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          concluida: nextConcluida,
          data_lembrete: nextDataLembrete || null,
        }),
      });

      if (res.ok) {
        fetchTarefas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTarefa = async (id: number) => {
    if (!token || !selectedClinicaId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/tarefas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchTarefas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (t: Tarefa) => {
    setEditingTarefa(t);
    setEditDesc(t.descricao);
    setEditTipoRep(t.tipo_repeticao || 'PONTUAL');
    setEditDataLemb(t.data_lembrete ? t.data_lembrete.substring(0, 10) : '');
    setEditAtribuidoId(t.atribuido_a ? t.atribuido_a.id : '');
    setEditLeadId(t.lead ? t.lead.id : '');
  };

  return (
    <div className="flex flex-col gap-6 select-none max-w-7xl mx-auto px-2 py-4">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Gerenciador de Tarefas</h2>
          <p className="text-xs text-slate-400 font-medium">Controle de tarefas recorrentes ou pontuais da clínica</p>
        </div>
        <button
          onClick={() => setIsCreateTarefaModalOpen(true)}
          className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition active:scale-[0.98] flex items-center gap-2 text-sm cursor-pointer select-none"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Nova Tarefa
        </button>
      </div>

      {tarefas.length === 0 ? (
        <div className="text-center py-12 font-bold text-slate-400 select-none bg-white rounded-2xl border border-slate-100 shadow-sm">
          Nenhuma tarefa cadastrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tarefas.map((t: Tarefa) => {
            const isToday = t.data_lembrete && new Date(t.data_lembrete + 'T12:00:00Z').toDateString() === new Date().toDateString();
            const isLate = t.data_lembrete && !t.concluida && new Date(t.data_lembrete + 'T12:00:00Z') < new Date();

            return (
              <div
                key={t.id}
                className={`bg-white p-5 rounded-2xl border flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition ${isToday ? 'border-amber-400/60 bg-amber-50/20' : 'border-slate-100'
                  }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-sm font-bold text-slate-800 break-words leading-tight max-w-[80%]">
                      {t.descricao}
                    </span>
                    <input
                      type="checkbox"
                      checked={t.concluida}
                      onChange={() => handleToggleConcluida(t)}
                      className="w-5 h-5 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer mt-0.5"
                    />
                  </div>

                  {t.data_lembrete && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded leading-none border ${isLate
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isToday
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                        {isLate ? 'Atrasada' : isToday ? 'Hoje' : 'Agendada'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(t.data_lembrete + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  {t.tipo_repeticao && t.tipo_repeticao !== 'PONTUAL' && (
                    <span className="self-start text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded leading-none">
                      Recorrência: {t.tipo_repeticao}
                    </span>
                  )}

                  {t.atribuido_a && (
                    <span className="text-xs text-slate-400 font-bold mt-1">
                      Para: <span className="text-indigo-600">{t.atribuido_a.username}</span>
                    </span>
                  )}

                  {t.lead && (
                    <span className="text-xs text-slate-400 font-bold mt-1">
                      Lead: <span className="text-brand-blue">{t.lead.nome}</span>
                    </span>
                  )}
                </div>

                <div className="border-t border-slate-50 pt-3 flex items-center justify-end gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(t)}
                    className="text-xs font-black text-brand-blue hover:text-brand-blue/80 bg-brand-blue/5 hover:bg-brand-blue/10 px-2.5 py-1 rounded-xl transition cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteTarefa(t.id)}
                    className="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl transition cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nova Tarefa Modal */}
      {isCreateTarefaModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-5 transform transition animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Criar Nova Tarefa</h3>
                <p className="text-xs text-slate-400 font-medium">Adicione lembretes ou tarefas cíclicas</p>
              </div>
              <button
                onClick={() => setIsCreateTarefaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateTarefa} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Descrição *</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Ex: Ligar para paciente"
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Relacionar a um Lead</label>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Nenhum lead selecionado</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Frequência de Repetição</label>
                <select
                  value={tipoRep}
                  onChange={(e) => setTipoRep(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="PONTUAL">Não repetir</option>
                  <option value="DIARIA">Repetir diariamente</option>
                  <option value="SEMANAL">Repetir semanalmente</option>
                  <option value="MENSAL">Repetir mensalmente</option>
                  <option value="ANUAL">Repetir anualmente</option>
                </select>
              </div>

              {tipoRep === 'PONTUAL' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Data do Lembrete</label>
                  <input
                    type="date"
                    required
                    value={dataLemb}
                    onChange={(e) => setDataLemb(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  />
                </div>
              )}

              {tipoRep === 'SEMANAL' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Dia da Semana *</label>
                  <select
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  >
                    <option value="1">Segunda-feira</option>
                    <option value="2">Terça-feira</option>
                    <option value="3">Quarta-feira</option>
                    <option value="4">Quinta-feira</option>
                    <option value="5">Sexta-feira</option>
                    <option value="6">Sábado</option>
                    <option value="7">Domingo</option>
                  </select>
                </div>
              )}

              {tipoRep === 'MENSAL' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Dia do Mês *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  />
                </div>
              )}

              {tipoRep === 'ANUAL' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-600">Mês *</label>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                    >
                      <option value="1">Janeiro</option>
                      <option value="2">Fevereiro</option>
                      <option value="3">Março</option>
                      <option value="4">Abril</option>
                      <option value="5">Maio</option>
                      <option value="6">Junho</option>
                      <option value="7">Julho</option>
                      <option value="8">Agosto</option>
                      <option value="9">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-600">Dia *</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={dayOfMonth}
                      onChange={(e) => setDayOfMonth(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Atribuir a Profissional</label>
                <select
                  value={atribuidoId}
                  onChange={(e) => setAtribuidoId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Nenhum profissional definido</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.username} ({p.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer"
                >
                  Adicionar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tarefa Modal */}
      {editingTarefa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-5 transform transition animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Editar Tarefa</h3>
                <p className="text-xs text-slate-400 font-medium">Modifique detalhes da tarefa cadastrada</p>
              </div>
              <button
                onClick={() => setEditingTarefa(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateTarefa} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Descrição *</label>
                <input
                  type="text"
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Relacionar a um Lead</label>
                <select
                  value={editLeadId}
                  onChange={(e) => setEditLeadId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Nenhum lead selecionado</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Frequência de Repetição</label>
                <select
                  value={editTipoRep}
                  onChange={(e) => setEditTipoRep(e.target.value)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="PONTUAL">Não repetir</option>
                  <option value="DIARIA">Repetir diariamente</option>
                  <option value="SEMANAL">Repetir semanalmente</option>
                  <option value="MENSAL">Repetir mensalmente</option>
                  <option value="ANUAL">Repetir anualmente</option>
                </select>
              </div>

              {editTipoRep === 'PONTUAL' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Data do Lembrete</label>
                  <input
                    type="date"
                    required
                    value={editDataLemb}
                    onChange={(e) => setEditDataLemb(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  />
                </div>
              )}

              {editTipoRep === 'SEMANAL' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Dia da Semana *</label>
                  <select
                    value={editWeekday}
                    onChange={(e) => setEditWeekday(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  >
                    <option value="1">Segunda-feira</option>
                    <option value="2">Terça-feira</option>
                    <option value="3">Quarta-feira</option>
                    <option value="4">Quinta-feira</option>
                    <option value="5">Sexta-feira</option>
                    <option value="6">Sábado</option>
                    <option value="7">Domingo</option>
                  </select>
                </div>
              )}

              {editTipoRep === 'MENSAL' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600">Dia do Mês *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editDayOfMonth}
                    onChange={(e) => setEditDayOfMonth(e.target.value)}
                    className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  />
                </div>
              )}

              {editTipoRep === 'ANUAL' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-600">Mês *</label>
                    <select
                      value={editMonth}
                      onChange={(e) => setEditMonth(e.target.value)}
                      className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                    >
                      <option value="1">Janeiro</option>
                      <option value="2">Fevereiro</option>
                      <option value="3">Março</option>
                      <option value="4">Abril</option>
                      <option value="5">Maio</option>
                      <option value="6">Junho</option>
                      <option value="7">Julho</option>
                      <option value="8">Agosto</option>
                      <option value="9">Setembro</option>
                      <option value="10">Outubro</option>
                      <option value="11">Novembro</option>
                      <option value="12">Dezembro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-600">Dia *</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      required
                      value={editDayOfMonth}
                      onChange={(e) => setEditDayOfMonth(e.target.value)}
                      className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Atribuir a Profissional</label>
                <select
                  value={editAtribuidoId}
                  onChange={(e) => setEditAtribuidoId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Nenhum profissional definido</option>
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.username} ({p.role})
                    </option>
                  ))}
                </select>
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
