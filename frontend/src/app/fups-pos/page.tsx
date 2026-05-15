'use client';

import React from 'react';
import { useDashboard, Lead } from '../dashboard/context';
import { API_URL } from '@/config';

export default function FupsPosPage() {
  const {
    token,
    selectedClinicaId,
    leads,
    consultas,
    fetchLeads,
    fetchConsultas,
  } = useDashboard();

  React.useEffect(() => {
    if (token && selectedClinicaId) {
      fetchLeads(token, selectedClinicaId);
      fetchConsultas(token, selectedClinicaId);
    }
  }, [token, selectedClinicaId]);

  const handleUpdateFup = async (leadId: number, payload: Partial<Lead>) => {
    if (!token || !selectedClinicaId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchLeads(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLeadConsultationDate = (leadId: number) => {
    const consultation = consultas.find((c) => c.lead?.id === leadId);
    if (!consultation) return null;
    return consultation.data_hora;
  };

  const getFupDate = (dataConsulta: string | null | undefined, daysToAdd: number) => {
    if (!dataConsulta) return null;
    let dt = new Date(dataConsulta);
    dt.setDate(dt.getDate() + daysToAdd);
    return dt;
  };

  const getFupStatus = (dataConsulta: string | null | undefined, daysToAdd: number, done: boolean | null | undefined) => {
    if (done) return { label: 'Concluído', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    const deadline = getFupDate(dataConsulta, daysToAdd);
    if (!deadline) return { label: 'Agendado', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) return { label: 'Atrasado', color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' };
    if (deadline.getTime() === today.getTime()) return { label: 'Hoje', color: 'bg-amber-50 text-amber-700 border-amber-200' };

    return { label: 'Agendado', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' };
  };

  // 1. Must have compared (compareceu === true)
  const filteredLeads = leads.filter((l: Lead) => l.compareceu);

  return (
    <div className="flex flex-col gap-6 select-none px-2 py-4">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Régua de Follow-up Pós-Consulta</h2>
        <p className="text-xs text-slate-400 font-medium">Controle as confirmações e resultados do follow-up pós-consulta para cada paciente</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        {filteredLeads.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-6 select-none">
            Nenhum lead em follow-up pós-consulta no momento.
          </p>
        ) : (
          <div className="overflow-x-auto select-none border border-slate-100 rounded-2xl bg-white">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Paciente / Contato</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Interesse</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Data da Consulta</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">FUP Pós 1</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">FUP Pós 2</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">FUP Pós 3</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((l: Lead) => {
                  const dataConsulta = getLeadConsultationDate(l.id);
                  const status1 = getFupStatus(dataConsulta, 1, l.fup1_feito ?? undefined);
const status2 = getFupStatus(dataConsulta, 8, l.fup2_feito ?? undefined);
const status3 = getFupStatus(dataConsulta, 23, l.fup3_feito ?? undefined);

                  const date1 = getFupDate(dataConsulta, 1);
                  const date2 = getFupDate(dataConsulta, 8);
                  const date3 = getFupDate(dataConsulta, 23);

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition">
                      {/* Paciente / Contato */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col select-none">
                          <span className="text-sm font-bold text-slate-800 leading-tight">{l.nome}</span>
                          <span className="text-xs font-medium text-slate-400 leading-tight select-none">{l.telefone}</span>
                        </div>
                      </td>

                      {/* Interesse */}
                      <td className="py-4 px-4 whitespace-nowrap select-none">
                        {l.interesse ? (
                          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-xl">
                            {l.interesse.nome}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium select-none">-</span>
                        )}
                      </td>

                      {/* Data da Consulta */}
                      <td className="py-4 px-4 whitespace-nowrap select-none">
                        <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-block">
                          {dataConsulta
                            ? new Date(dataConsulta).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : '-'}
                        </span>
                      </td>

                      {/* FUP Pós 1 */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            {status1.label !== 'Agendado' && (
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-xl border leading-none whitespace-nowrap w-fit ${status1.color}`}>
                                {status1.label}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-block whitespace-nowrap">
                              {date1 ? date1.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateFup(l.id, { pos_fup1_feito: !l.pos_fup1_feito })}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition cursor-pointer select-none shrink-0 ${l.pos_fup1_feito
                                ? 'bg-brand-green border-brand-green text-white shadow'
                                : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                              }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </td>

                      {/* FUP Pós 2 */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            {status2.label !== 'Agendado' && (
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-xl border leading-none whitespace-nowrap w-fit ${status2.color}`}>
                                {status2.label}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-block whitespace-nowrap">
                              {date2 ? date2.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateFup(l.id, { pos_fup2_feito: !l.pos_fup2_feito })}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition cursor-pointer select-none shrink-0 ${l.pos_fup2_feito
                                ? 'bg-brand-green border-brand-green text-white shadow'
                                : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                              }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </td>

                      {/* FUP Pós 3 */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-1">
                            {status3.label !== 'Agendado' && (
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-xl border leading-none whitespace-nowrap w-fit ${status3.color}`}>
                                {status3.label}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-block whitespace-nowrap">
                              {date3 ? date3.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateFup(l.id, { pos_fup3_feito: !l.pos_fup3_feito })}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition cursor-pointer select-none shrink-0 ${l.pos_fup3_feito
                                ? 'bg-brand-green border-brand-green text-white shadow'
                                : 'bg-white border-slate-300 text-slate-300 hover:border-slate-400'
                              }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </div>
                      </td>

                      {/* Resultado */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={l.resultado_pos_fup || ''}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUpdateFup(l.id, { resultado_pos_fup: e.target.value === '' ? null : e.target.value })}
                          className={`text-xs font-bold px-3 py-1 rounded-xl border focus:outline-none transition cursor-pointer ${
                            l.resultado_pos_fup === 'DESISTIU'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : l.resultado_pos_fup === 'MARCOU'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : l.resultado_pos_fup === 'SEM RETORNO'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <option value="">Nenhum</option>
                          <option value="MARCOU">Marcou</option>
                          <option value="DESISTIU">Desistiu</option>
                          <option value="SEM RETORNO">Sem Retorno</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
