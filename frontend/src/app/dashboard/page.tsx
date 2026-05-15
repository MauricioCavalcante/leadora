'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDashboard, Tarefa } from './context';
import { API_URL } from '@/config';

export default function DashboardPage() {
  const {
    token,
    selectedClinicaId,
    leads,
    consultas,
    tarefas,
    orientacoes,
    setTarefas,
    fetchLeads,
    fetchConsultas,
    fetchTarefas,
    fetchOrientacoes
  } = useDashboard();
  const [completingTask, setCompletingTask] = useState<Tarefa | null>(null);

  React.useEffect(() => {
    if (token && selectedClinicaId) {
      fetchLeads(token, selectedClinicaId);
      fetchConsultas(token, selectedClinicaId);
      fetchTarefas(token, selectedClinicaId);
      fetchOrientacoes(token, selectedClinicaId);
    }
  }, [token, selectedClinicaId]);

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  const aniversariantesHoje = leads.filter((l) => {
    if (!l.data_nascimento) return false;
    const parts = l.data_nascimento.split('-');
    if (parts.length < 3) return false;
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return m === currentMonth && d === currentDay;
  });

  const aniversariantesMes = leads.filter((l) => {
    if (!l.data_nascimento) return false;
    const parts = l.data_nascimento.split('-');
    if (parts.length < 3) return false;
    const m = parseInt(parts[1], 10);
    return m === currentMonth;
  });

  const tarefasPendentes = tarefas.filter((t) => !t.concluida);

  const leadsComComparecimento = leads.filter(l => l.compareceu).length;
  const leadsSemComparecimento = leads.length - leadsComComparecimento;
  const pctSim = leads.length > 0 ? Math.round((leadsComComparecimento / leads.length) * 100) : 0;
  const pctNao = leads.length > 0 ? 100 - pctSim : 0;

  const origemCounts: { [key: string]: number } = {};
  leads.forEach(l => {
    const origName = l.origem?.nome || l.origem_manual || 'Não Informado';
    origemCounts[origName] = (origemCounts[origName] || 0) + 1;
  });

  const interesseCounts: { [key: string]: number } = {};
  leads.forEach(l => {
    const intName = l.interesse?.nome || 'Não Informado';
    interesseCounts[intName] = (interesseCounts[intName] || 0) + 1;
  });

  const assuntoCounts: { [key: string]: number } = {};
  orientacoes.forEach(o => {
    const assName = o.assunto?.nome || o.assunto_texto || 'Outros / Geral';
    assuntoCounts[assName] = (assuntoCounts[assName] || 0) + 1;
  });

  const orientacoesRecentes = orientacoes.filter(o => {
    const d = new Date(o.created_at);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const handleConclude = async (t: Tarefa) => {
    if (!token || !selectedClinicaId) return;

    let nextConcluida = true;
    let nextDataLembrete = t.data_lembrete;

    // Handle cyclic tasks recurrence like in the tasks page
    if (t.tipo_repeticao && t.tipo_repeticao !== 'PONTUAL') {
      nextConcluida = false;
      const current = t.data_lembrete ? new Date(t.data_lembrete + 'T12:00:00Z') : new Date();

      if (t.tipo_repeticao === 'SEMANAL') {
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

    // Immediately update local state for real-time responsiveness
    const updatedTarefas = tarefas.map((item) => {
      if (item.id === t.id) {
        return { ...item, concluida: nextConcluida, data_lembrete: nextDataLembrete };
      }
      return item;
    });
    setTarefas(updatedTarefas);

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
      } else {
        // Fallback on error: revert state
        fetchTarefas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
      fetchTarefas(token, selectedClinicaId);
    }
  };

  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Resumo visual dos dados (KPI Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Leads Ativos</span>
          <span className="text-3xl font-black text-brand-blue">{leads.length}</span>
          <p className="text-xs text-slate-400 font-medium leading-normal">
            Leads cadastrados e em follow-up na clínica
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Novos Leads</span>
          <span className="text-3xl font-black text-indigo-600">
            {leads.filter((l) => l.status === 'NOVO').length}
          </span>
          <p className="text-xs text-slate-400 font-medium leading-normal">
            Leads que acabaram de entrar no sistema
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Em Atendimento</span>
          <span className="text-3xl font-black text-amber-500">
            {leads.filter((l) => l.status === 'EM_ATENDIMENTO').length}
          </span>
          <p className="text-xs text-slate-400 font-medium leading-normal">
            Leads que receberam tentativas de contato
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Consultas Marcadas</span>
          <span className="text-3xl font-black text-emerald-500">{consultas.length}</span>
          <p className="text-xs text-slate-400 font-medium leading-normal">
            Pacientes que agendaram comparecimento
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Orientações</span>
          <span className="text-3xl font-black text-brand-green">{orientacoes.length}</span>
          <p className="text-xs text-slate-400 font-medium leading-normal">
            Total de orientações prestadas ({orientacoesRecentes} nos últimos 7 dias)
          </p>
        </div>
      </section>

      {/* Graficos Quantitativos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Comparecimento (Borda de torta) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Comparecimento
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-normal">
              Presença confirmada de leads na clínica
            </p>
          </div>

          <div className="flex flex-col items-center justify-center relative py-2">
            {leads.length > 0 ? (
              <>
                <svg className="w-32 h-32 transform -rotate-90 select-none">
                  <circle
                    cx="64"
                    cy="64"
                    r="40"
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="40"
                    fill="transparent"
                    stroke="#4f46e5"
                    strokeWidth="12"
                    strokeDasharray={251.3}
                    strokeDashoffset={251.3 - (pctSim / 100) * 251.3}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-800 leading-none">{pctSim}%</span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase mt-0.5 tracking-wider">Sim</span>
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-slate-400">Nenhum dado</p>
            )}
          </div>

          <div className="flex justify-around border-t border-slate-50 pt-3 mt-1 select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
              <span className="text-xs font-bold text-slate-600">Sim: <strong className="text-indigo-600">{pctSim}%</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-200"></span>
              <span className="text-xs font-bold text-slate-600">Não: <strong className="text-slate-400">{pctNao}%</strong></span>
            </div>
          </div>
        </div>

        {/* Quantidade por Origem */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Leads por Origem
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-normal">
              Distribuição por canal de captação
            </p>
          </div>

          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
            {Object.keys(origemCounts).length > 0 ? (
              Object.entries(origemCounts).map(([key, count]) => {
                const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={key} className="flex flex-col gap-1 select-none">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="truncate max-w-[160px]">{key}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden border border-slate-100/60 p-[1px]">
                      <div
                        className="bg-brand-blue h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs font-medium text-slate-400 text-center py-4 italic">Nenhum dado cadastrado.</p>
            )}
          </div>
        </div>

        {/* Quantidade por Interesse */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Leads por Interesse
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-normal">
              Categorização por interesse ou procedimento
            </p>
          </div>

          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
            {Object.keys(interesseCounts).length > 0 ? (
              Object.entries(interesseCounts).map(([key, count]) => {
                const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={key} className="flex flex-col gap-1 select-none">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="truncate max-w-[160px]">{key}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden border border-slate-100/60 p-[1px]">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs font-medium text-slate-400 text-center py-4 italic">Nenhum dado cadastrado.</p>
            )}
          </div>
        </div>
        {/* Orientações por Assunto */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Orientações por Assunto
            </h3>
            <p className="text-xs text-slate-400 font-medium leading-normal">
              Principais dúvidas e temas das orientações
            </p>
          </div>

          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
            {Object.keys(assuntoCounts).length > 0 ? (
              Object.entries(assuntoCounts).map(([key, count]) => {
                const pct = orientacoes.length > 0 ? Math.round((count / orientacoes.length) * 100) : 0;
                return (
                  <div key={key} className="flex flex-col gap-1 select-none">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span className="truncate max-w-[160px]">{key}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-2.5 overflow-hidden border border-slate-100/60 p-[1px]">
                      <div
                        className="bg-brand-green h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs font-medium text-slate-400 text-center py-4 italic">Nenhum dado cadastrado.</p>
            )}
          </div>
        </div>
      </section>

      {/* Aniversariantes & Tarefas Pendentes */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Aniversariantes do dia e do mês */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9V9a2 2 0 00-2-2H8a2 2 0 00-2 2v3h12z" />
              </svg>
              Aniversariantes do Dia e do Mês
            </h2>
            <p className="text-xs text-slate-400 font-medium">Acompanhe aniversariantes de hoje e deste mês</p>
          </div>

          {/* Do Dia */}
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded leading-none">
              Hoje ({currentDay}/{currentMonth})
            </span>
            {aniversariantesHoje.length === 0 ? (
              <p className="text-xs text-slate-400 mt-2 font-medium">Nenhum aniversariante hoje.</p>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {aniversariantesHoje.map((l) => (
                  <div key={l.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800">{l.nome}</span>
                    <span className="text-xs font-bold text-brand-blue">{l.telefone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Do Mês */}
          <div className="border-t border-slate-100 pt-4">
            <span className="text-xs font-black uppercase text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded leading-none">
              Deste Mês
            </span>
            {aniversariantesMes.length === 0 ? (
              <p className="text-xs text-slate-400 mt-2 font-medium">Nenhum aniversariante este mês.</p>
            ) : (
              <div className="flex flex-col gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
                {aniversariantesMes.map((l) => {
                  const dobParts = l.data_nascimento?.split('-');
                  const day = dobParts ? dobParts[2] : '';
                  return (
                    <div key={l.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-sm font-bold text-slate-800 block leading-tight">{l.nome}</span>
                        <span className="text-[10px] font-bold text-slate-400">Dia {day}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-blue">{l.telefone}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Lembretes da Agenda */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lembretes da Agenda
              </h2>
              <p className="text-xs text-slate-400 font-medium">Lembretes de consultas agendadas</p>
            </div>
            <Link
              href="/consultas"
              title="Ver todas as consultas"
              className="text-slate-400 hover:text-indigo-600 transition p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {consultas.filter(c => c.data_lembrete).length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-6">Nenhum lembrete pendente.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1 select-none">
              {consultas
                .filter(c => c.data_lembrete)
                .sort((a, b) => (a.data_lembrete! > b.data_lembrete! ? 1 : -1))
                .map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-xl flex flex-col gap-2 transition select-none">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex flex-col gap-1 flex-1">
                        <span className="text-sm font-bold text-slate-800 leading-snug">
                          {c.lead?.nome || 'Paciente'}
                        </span>
                        {c.observacoes && (
                          <span className="text-xs text-slate-400 font-medium line-clamp-2">
                            {c.observacoes}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded leading-none shrink-0">
                        {new Date(c.data_lembrete! + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Tarefas Pendentes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Tarefas Pendentes
              </h2>
              <p className="text-xs text-slate-400 font-medium">Listagem de tarefas não concluídas</p>
            </div>
            <Link
              href="/tarefas"
              title="Ver todas as tarefas"
              className="text-slate-400 hover:text-indigo-600 transition p-1.5 hover:bg-slate-50 rounded-xl cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {tarefasPendentes.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium text-center py-6">Todas as tarefas estão concluídas!</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
              {tarefasPendentes.map((t) => (
                <div key={t.id} className="p-4 bg-slate-50 hover:bg-slate-100/50 border border-slate-100 rounded-xl flex flex-col gap-2 transition select-none">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-sm font-bold text-slate-800 leading-snug">{t.descricao}</span>
                      {t.atribuido_a && (
                        <span className="text-xs text-slate-400 font-bold">
                          Atribuído a: <span className="text-indigo-600">{t.atribuido_a.username}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {t.data_lembrete && (
                        <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded leading-none shrink-0">
                          {new Date(t.data_lembrete).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      <button
                        onClick={() => setCompletingTask(t)}
                        className="text-[11px] font-black uppercase text-white bg-brand-green hover:bg-brand-green/90 px-2.5 py-1.5 rounded-xl shadow transition active:scale-[0.98] cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        Concluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Modal */}
      {completingTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 flex flex-col gap-4 transform transition">
            <div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">Concluir Tarefa</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium leading-normal">
                Tem certeza que deseja marcar a tarefa <strong className="text-slate-800">{completingTask.descricao}</strong> como concluída?
              </p>
            </div>

            <div className="flex justify-end items-center gap-3 mt-2 shrink-0">
              <button
                onClick={() => setCompletingTask(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await handleConclude(completingTask);
                  setCompletingTask(null);
                }}
                className="text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer active:scale-[0.98]"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
