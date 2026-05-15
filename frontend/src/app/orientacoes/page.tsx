'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard } from '../dashboard/context';
import { API_URL } from '@/config';

interface AssuntoOrientacao {
  id: number;
  nome: string;
}

interface Orientacao {
  id: number;
  paciente_nome: string;
  assunto?: AssuntoOrientacao;
  assunto_texto?: string;
  descricao?: string;
  created_at: string;
}

export default function OrientacoesPage() {
  const { token, selectedClinicaId, orientacoes, fetchOrientacoes } = useDashboard();
  const [assuntos, setAssuntos] = useState<AssuntoOrientacao[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pacienteNome, setPacienteNome] = useState('');
  const [selectedAssuntoId, setSelectedAssuntoId] = useState<number | string>('');
  const [novoAssuntoNome, setNovoAssuntoNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const fetchAssuntos = async () => {
    if (!token || !selectedClinicaId) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/assuntos-orientacao?clinica_id=${selectedClinicaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAssuntos(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAll = async () => {
    if (!token || !selectedClinicaId) return;
    setLoading(true);
    await Promise.all([
      fetchOrientacoes(token, selectedClinicaId),
      fetchAssuntos()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, [token, selectedClinicaId]);

  const handleCreateOrientacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId) return;

    let finalAssuntoId = selectedAssuntoId;
    if (selectedAssuntoId === 'NOVO' && novoAssuntoNome.trim()) {
      try {
        const resAssunto = await fetch(`${API_URL}/api/v1/assuntos-orientacao`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            clinica_id: selectedClinicaId,
            nome: novoAssuntoNome.trim(),
          }),
        });
        if (resAssunto.ok) {
          const createdAssunto = await resAssunto.json();
          finalAssuntoId = createdAssunto.id;
          fetchAssuntos();
        }
      } catch (err) {
        console.error(err);
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/orientacoes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinica_id: selectedClinicaId,
          paciente_nome: pacienteNome,
          assunto_id: typeof finalAssuntoId === 'number' ? finalAssuntoId : null,
          descricao,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setPacienteNome('');
        setSelectedAssuntoId('');
        setNovoAssuntoNome('');
        setDescricao('');
        fetchOrientacoes(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este registro de orientação?')) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/orientacoes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchOrientacoes(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-8 select-none animate-fade-in max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            🗣️ Orientações
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Registre pacientes que entraram em contato apenas para tirar dúvidas.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-green hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all transform active:scale-95 flex items-center gap-2 text-sm cursor-pointer"
        >
          <span>➕</span> Nova Orientação
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse">Carregando...</div>
        ) : orientacoes.length === 0 ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">Nenhuma orientação registrada ainda.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Paciente</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Assunto</th>
                  <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orientacoes.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-4 px-6 text-sm font-bold text-slate-500">
                      {new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 text-sm font-black text-slate-800">{o.paciente_nome}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{o.assunto?.nome || o.assunto_texto || '-'}</span>
                        {o.descricao && <span className="text-xs font-medium text-slate-400 line-clamp-1">{o.descricao}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleDelete(o.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Nova Orientação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm border border-slate-200 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrientacao} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Paciente</label>
                <input
                  type="text"
                  required
                  value={pacienteNome}
                  onChange={(e) => setPacienteNome(e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-4 py-3 outline-none font-bold text-slate-800 transition placeholder:text-slate-300"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="flex flex-col gap-1.5 select-none">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto</label>
                <select
                  value={selectedAssuntoId || ''}
                  onChange={(e) => setSelectedAssuntoId(e.target.value === 'NOVO' ? 'NOVO' : (e.target.value ? parseInt(e.target.value, 10) : ''))}
                  className="w-full text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-4 py-3 outline-none font-bold text-slate-800 transition"
                >
                  <option value="">Selecione um assunto</option>
                  {assuntos.map((ass) => (
                    <option key={ass.id} value={ass.id}>
                      {ass.nome}
                    </option>
                  ))}
                  <option value="NOVO" className="font-bold text-brand-blue">+ Adicionar Novo Assunto</option>
                </select>
                {selectedAssuntoId === 'NOVO' && (
                  <input
                    type="text"
                    required
                    value={novoAssuntoNome}
                    onChange={(e) => setNovoAssuntoNome(e.target.value)}
                    placeholder="Qual o novo assunto?"
                    className="mt-2 w-full text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-4 py-3 outline-none font-bold text-slate-800 transition"
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detalhes (Opcional)</label>
                <textarea
                  rows={3}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full text-sm bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-brand-blue rounded-xl px-4 py-3 outline-none font-medium text-slate-700 transition placeholder:text-slate-300 resize-none"
                  placeholder="Resumo do que foi falado..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-green hover:bg-emerald-600 text-white font-black py-3.5 rounded-xl shadow-sm transition-all transform active:scale-95 mt-2 cursor-pointer"
              >
                Salvar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
