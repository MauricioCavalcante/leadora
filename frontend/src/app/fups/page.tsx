'use client';

import React from 'react';
import { useDashboard, Lead } from '../dashboard/context';
import { API_URL } from '@/config';

export default function FupsPage() {
  const {
    token,
    selectedClinicaId,
    leads,
    fetchLeads,
  } = useDashboard();

  React.useEffect(() => {
    if (token && selectedClinicaId) {
      fetchLeads(token, selectedClinicaId);
    }
  }, [token, selectedClinicaId]);

  const handleUpdateFup = async (leadId: number, payload: any) => {
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

  const getFupDate = (createdAt: string | undefined, dataPrimeiroContato: string | undefined, daysToAdd: number) => {
    let dt: Date;
    if (dataPrimeiroContato) {
      // Use 'T12:00:00Z' to avoid time zone shifts with date strings
      dt = new Date(dataPrimeiroContato + 'T12:00:00Z');
    } else if (createdAt) {
      dt = new Date(createdAt);
    } else {
      return null;
    }
    dt.setDate(dt.getDate() + daysToAdd);
    return dt;
  };

  const getFupStatus = (createdAt: string | undefined, dataPrimeiroContato: string | undefined, daysToAdd: number, done: boolean | undefined) => {
    if (done) return { label: 'Concluído', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    const deadline = getFupDate(createdAt, dataPrimeiroContato, daysToAdd);
    if (!deadline) return { label: 'Agendado', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) return { label: 'Atrasado', color: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' };
    if (deadline.getTime() === today.getTime()) return { label: 'Hoje', color: 'bg-amber-50 text-amber-700 border-amber-200' };

    return { label: 'Agendado', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' };
  };

  return (
    <div className="flex flex-col gap-6 select-none px-2 py-4">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Régua de Follow-up (FUP)</h2>
        <p className="text-xs text-slate-400 font-medium">Controle as confirmações de contato e o resultado com cada lead</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
        {leads.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium text-center py-6 select-none">
            Nenhum lead em follow-up no momento.
          </p>
        ) : (
          <div className="overflow-x-auto select-none border border-slate-100 rounded-2xl bg-white">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Paciente / Contato</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Interesse</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Primeiro Contato</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">FUP 1</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">FUP 2</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">FUP 3</th>
                  <th className="py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.map((l) => {
                  // Dentro do leads.map((l) => { ...
                  const status1 = getFupStatus(l.created_at ?? undefined, l.data_primeiro_contato ?? undefined, 1, l.fup1_feito);
                  const status2 = getFupStatus(l.created_at ?? undefined, l.data_primeiro_contato ?? undefined, 8, l.fup2_feito);
                  const status3 = getFupStatus(l.created_at ?? undefined, l.data_primeiro_contato ?? undefined, 23, l.fup3_feito);

                  const date1 = getFupDate(l.created_at ?? undefined, l.data_primeiro_contato ?? undefined, 1);
                  const date2 = getFupDate(l.created_at ?? undefined, l.data_primeiro_contato ?? undefined, 8);
                  const date3 = getFupDate(l.created_at ?? undefined, l.data_primeiro_contato ?? undefined, 23);

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-4 whitespace-nowrap border-r border-slate-50/80">
                        <div className="flex flex-col select-none">
                          <span className="text-sm font-black text-slate-800 tracking-tight leading-snug whitespace-nowrap">
                            {l.nome}
                          </span>
                          <span className="text-xs font-bold text-slate-400 leading-normal mt-0.5 whitespace-nowrap">
                            {l.telefone}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2.5 py-1 rounded-xl leading-none">
                          {l.interesse ? l.interesse.nome : 'Nenhum'}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md inline-block whitespace-nowrap">
                          {l.data_primeiro_contato ? new Date(l.data_primeiro_contato + 'T12:00:00Z').toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                        </span>
                      </td>

                      {/* FUP 1 */}
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
                            onClick={() => handleUpdateFup(l.id, { fup1_feito: !l.fup1_feito })}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition cursor-pointer select-none shrink-0 ${l.fup1_feito
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

                      {/* FUP 2 */}
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
                            onClick={() => handleUpdateFup(l.id, { fup2_feito: !l.fup2_feito })}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition cursor-pointer select-none shrink-0 ${l.fup2_feito
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

                      {/* FUP 3 */}
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
                            onClick={() => handleUpdateFup(l.id, { fup3_feito: !l.fup3_feito })}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition cursor-pointer select-none shrink-0 ${l.fup3_feito
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
                          value={l.resultado_fup || ''}
                          onChange={(e) => handleUpdateFup(l.id, { resultado_fup: e.target.value === '' ? null : e.target.value })}
                          className={`text-xs font-bold px-3 py-1 rounded-xl border focus:outline-none transition cursor-pointer ${l.resultado_fup === 'DESISTIU'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : l.resultado_fup === 'MARCOU'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : l.resultado_fup === 'SEM_RETORNO'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                          <option value="">Nenhum</option>
                          <option value="MARCOU">Marcou</option>
                          <option value="DESISTIU">Desistiu</option>
                          <option value="SEM_RETORNO">Sem Retorno</option>
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
