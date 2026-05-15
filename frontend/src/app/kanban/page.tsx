'use client';

import React, { useState, useEffect } from 'react';
import { useDashboard, Lead } from '../dashboard/context';
import { API_URL } from '@/config';

interface KanbanColumn {
  id: number;
  title: string;
  key: string;
  color: string;
  ordenacao: number;
}

const colorOptions = [
  { value: 'bg-indigo-50/70 border-indigo-200 text-indigo-700', label: 'Indigo (Padrão)', hex: '#4f46e5' },
  { value: 'bg-amber-50/70 border-amber-200 text-amber-700', label: 'Amber (Atenção)', hex: '#d97706' },
  { value: 'bg-emerald-50/70 border-emerald-200 text-emerald-700', label: 'Emerald (Sucesso)', hex: '#059669' },
  { value: 'bg-rose-50/70 border-rose-200 text-rose-700', label: 'Rose (Perdido)', hex: '#dc2626' },
  { value: 'bg-slate-50/70 border-slate-200 text-slate-700', label: 'Slate (Neutro)', hex: '#4b5563' },
  { value: 'bg-fuchsia-50/70 border-fuchsia-200 text-fuchsia-700', label: 'Fuchsia (Premium)', hex: '#c026d3' },
];

export default function KanbanPage() {
  const {
    token,
    selectedClinicaId,
    leads,
    origens,
    interesses,
    fetchLeads,
    fetchConsultas,
    fetchOrigens,
    fetchInteresses,
    setOrigens,
    setInteresses,
    loading,
  } = useDashboard();

  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(false);

  // Dynamic origin creation state
  const [isAddingOrigem, setIsAddingOrigem] = useState(false);
  const [newOrigemNome, setNewOrigemNome] = useState('');

  // Inline column creation at specific index
  const [isAddingColumnAtPosition, setIsAddingColumnAtPosition] = useState<number | null>(null);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineColor, setInlineColor] = useState(colorOptions[0].value);
  const [customHexInline, setCustomHexInline] = useState('#4f46e5');

  // Inline column editing
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [editColTitle, setEditColTitle] = useState('');
  const [editColColor, setEditColColor] = useState(colorOptions[0].value);
  const [customHexEdit, setCustomHexEdit] = useState('#4f46e5');

  // Inline column delete confirmation state
  const [columnToDelete, setColumnToDelete] = useState<number | null>(null);

  // Lead fields
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [selectedOrigemId, setSelectedOrigemId] = useState<number | ''>('');
  const [selectedInteresseId, setSelectedInteresseId] = useState<number | ''>('');
  const [isAddingInteresse, setIsAddingInteresse] = useState(false);
  const [newInteresseNome, setNewInteresseNome] = useState('');
  const [compareceu, setCompareceu] = useState(false);
  const [salvarContato, setSalvarContato] = useState(false);
  const [leadError, setLeadError] = useState('');
  const [selectedColumnForLead, setSelectedColumnForLead] = useState<string | null>(null);

  // Edit Lead state
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [editLeadNome, setEditLeadNome] = useState('');
  const [editLeadEmail, setEditLeadEmail] = useState('');
  const [editLeadTelefone, setEditLeadTelefone] = useState('');
  const [editLeadDataNascimento, setEditLeadDataNascimento] = useState('');
  const [editLeadSalvarContato, setEditLeadSalvarContato] = useState(false);
  const [editLeadSelectedOrigemId, setEditLeadSelectedOrigemId] = useState<number | ''>('');
  const [editLeadSelectedInteresseId, setEditLeadSelectedInteresseId] = useState<number | ''>('');
  const [editLeadCompareceu, setEditLeadCompareceu] = useState(false);

  // Lead Modals
  const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
  const [schedulingConsultaLead, setSchedulingConsultaLead] = useState<Lead | null>(null);
  const [modalConsDataHora, setModalConsDataHora] = useState('');
  const [modalConsObs, setModalConsObs] = useState('');

  const fetchColumns = async (tok: string, clinId: number) => {
    setColumnsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/kanban-columns?clinica_id=${clinId}`, {
        headers: {
          Authorization: `Bearer ${tok}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: KanbanColumn, b: KanbanColumn) => a.ordenacao - b.ordenacao);
        setColumns(sorted);
      }
    } catch (err) {
      console.error('Erro ao buscar colunas:', err);
    } finally {
      setColumnsLoading(false);
    }
  };

  useEffect(() => {
    if (token && selectedClinicaId) {
      fetchLeads(token, selectedClinicaId);
      fetchColumns(token, selectedClinicaId);
      fetchInteresses(token, selectedClinicaId);
    }
  }, [token, selectedClinicaId]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError('');
    if (!token || !selectedClinicaId) return;

    try {
      const initialStatus = selectedColumnForLead || (columns.length > 0 ? columns[0].key : 'NOVO');
      const res = await fetch(`${API_URL}/api/v1/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinica_id: selectedClinicaId,
          nome,
          email: email || null,
          telefone,
          data_nascimento: dataNascimento || null,
          salvar_contato: salvarContato,
          origem_id: selectedOrigemId || null,
          interesse_id: selectedInteresseId || null,
          compareceu,
          status: initialStatus,
        }),
      });

      if (!res.ok) {
        throw new Error('Erro ao criar lead. Verifique os campos.');
      }

      setNome('');
      setEmail('');
      setTelefone('');
      setDataNascimento('');
      setSelectedOrigemId('');
      setSelectedInteresseId('');
      setCompareceu(false);
      setSalvarContato(false);
      setIsCreateLeadModalOpen(false);
      setSelectedColumnForLead(null);

      fetchLeads(token, selectedClinicaId);
    } catch (err: any) {
      setLeadError(err.message || 'Erro ao criar lead.');
    }
  };

  const handleUpdateStatus = async (lead: Lead, newStatus: string) => {
    if (!token || !selectedClinicaId) return;

    try {
      const upperStatus = newStatus.toUpperCase();
      const bodyData: any = { status: newStatus };

      if (upperStatus.includes('CONSULTA') || upperStatus.includes('AGENDADO')) {
        bodyData.resultado_fup = 'Marcou';
      } else if (upperStatus.includes('PERDIDO') || upperStatus.includes('DESIST')) {
        bodyData.resultado_fup = 'Desistiu';
      } else if (upperStatus.includes('FUP') || upperStatus.includes('CONTATO')) {
        bodyData.resultado_fup = 'Ainda em FUP';
      }

      const res = await fetch(`${API_URL}/api/v1/leads/${lead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        fetchLeads(token, selectedClinicaId);

        if (newStatus === 'CONSULTA_MARCADA' || newStatus.toUpperCase().includes('CONSULTA')) {
          setSchedulingConsultaLead(lead);
          setModalConsDataHora('');
          setModalConsObs('');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId || !editingLead) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/leads/${editingLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: editLeadNome,
          email: editLeadEmail || null,
          telefone: editLeadTelefone,
          data_nascimento: editLeadDataNascimento || null,
          salvar_contato: editLeadSalvarContato,
          origem_id: editLeadSelectedOrigemId || null,
          interesse_id: editLeadSelectedInteresseId || null,
          compareceu: editLeadCompareceu,
        }),
      });

      if (res.ok) {
        setIsEditLeadModalOpen(false);
        setEditingLead(null);
        fetchLeads(token, selectedClinicaId);
      } else {
        alert('Erro ao atualizar lead.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateConsultaModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId || !schedulingConsultaLead) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/consultas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinica_id: selectedClinicaId,
          lead_id: schedulingConsultaLead.id,
          data_hora: modalConsDataHora,
          observacoes: modalConsObs || null,
          status: 'AGENDADO',
        }),
      });

      if (res.ok) {
        setSchedulingConsultaLead(null);
        setModalConsDataHora('');
        setModalConsObs('');
        fetchConsultas(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create inline Column at given `insertIndex`
  const handleCreateColumnAtPosition = async (insertIndex: number) => {
    if (!token || !selectedClinicaId || !inlineTitle) return;

    const keyStr = inlineTitle.toUpperCase().replace(/\s+/g, '_');

    try {
      for (const col of columns) {
        if (col.ordenacao >= insertIndex) {
          await fetch(`${API_URL}/api/v1/kanban-columns/${col.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ordenacao: col.ordenacao + 1 }),
          });
        }
      }

      const res = await fetch(`${API_URL}/api/v1/kanban-columns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clinica_id: selectedClinicaId,
          title: inlineTitle,
          key: keyStr,
          color: inlineColor,
          ordenacao: insertIndex,
        }),
      });

      if (res.ok) {
        setInlineTitle('');
        setInlineColor(colorOptions[0].value);
        setCustomHexInline('#4f46e5');
        setIsAddingColumnAtPosition(null);
        fetchColumns(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateColumnDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedClinicaId || !editingColumnId) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/kanban-columns/${editingColumnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editColTitle,
          color: editColColor,
        }),
      });

      if (res.ok) {
        setEditingColumnId(null);
        setEditColTitle('');
        setEditColColor(colorOptions[0].value);
        setCustomHexEdit('#4f46e5');
        fetchColumns(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteColumn = async (id: number) => {
    if (!token || !selectedClinicaId) return;
    setColumnToDelete(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/kanban-columns/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchColumns(token, selectedClinicaId);
        fetchLeads(token, selectedClinicaId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Drag and Drop for CARDS ---
  const onDragOverCard = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDropCard = (e: React.DragEvent, statusKey: string) => {
    e.preventDefault();
    const leadStr = e.dataTransfer.getData('lead');
    if (!leadStr) return;
    try {
      const parsedLead = JSON.parse(leadStr) as Lead;
      if (parsedLead.status !== statusKey) {
        handleUpdateStatus(parsedLead, statusKey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onDragStartCard = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData('lead', JSON.stringify(lead));
  };

  // --- Drag and Drop for COLUMNS ---
  const onDragStartCol = (e: React.DragEvent, colId: number) => {
    e.dataTransfer.setData('columnId', colId.toString());
  };

  const onDropCol = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const draggedIdStr = e.dataTransfer.getData('columnId');
    if (!draggedIdStr) return;
    const draggedId = parseInt(draggedIdStr, 10);
    if (isNaN(draggedId)) return;

    const draggedColIndex = columns.findIndex((c) => c.id === draggedId);
    if (draggedColIndex === -1 || draggedColIndex === targetIndex) return;

    const reordered = [...columns];
    const [removed] = reordered.splice(draggedColIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    const updated = reordered.map((col, idx) => ({ ...col, ordenacao: idx }));
    setColumns(updated);

    try {
      for (let i = 0; i < updated.length; i++) {
        await fetch(`${API_URL}/api/v1/kanban-columns/${updated[i].id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ordenacao: i }),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-fade-in max-w-full">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            🚀 Kanban Inteligente
          </h2>
          <p className="text-sm text-slate-400 font-medium leading-none">
            Mova e reordene os leads e colunas com total fluidez.
          </p>
        </div>
      </div>

      {loading || columnsLoading ? (
        <div className="text-center py-12 font-bold text-slate-400 text-base animate-pulse">
          Carregando painel do Kanban...
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-8 items-start max-w-full select-none cursor-default scrollbar-thin">
          {columns.map((col, i) => {
            const filteredLeads = leads.filter((l) => l.status === col.key);
            const isHex = col.color.startsWith('#');
            const customStyles = isHex
              ? {
                backgroundColor: col.color + '14',
                borderColor: col.color + '4D',
                color: col.color,
              }
              : {};
            const colClasses = isHex
              ? 'border-2 border-dashed'
              : col.color;

            return (
              <React.Fragment key={col.id}>
                {/* Gap Zone for creating/reordering inline */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDropCol(e, i)}
                  className="group flex-shrink-0 flex items-center justify-center w-8 h-[520px] relative"
                >
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-100 group-hover:bg-brand-green/40 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                  {isAddingColumnAtPosition === i ? (
                    <div className="absolute z-20 w-72 min-w-[288px] bg-white p-4 rounded-xl border border-brand-green shadow-xl flex flex-col gap-3 left-1/2 -translate-x-1/2 top-4 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-800 tracking-tight">
                          Adicionar Coluna
                        </span>
                        <button
                          onClick={() => setIsAddingColumnAtPosition(null)}
                          className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1 rounded-lg transition cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={inlineTitle}
                        onChange={(e) => setInlineTitle(e.target.value)}
                        placeholder="Ex: Qualificados"
                        className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-blue text-xs font-bold"
                      />

                      {/* Color Picker List & Hex Diagram input */}
                      <div className="flex flex-col gap-1.5 select-none">
                        <label className="text-[10px] font-bold text-slate-600">Cor da Coluna</label>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {colorOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setInlineColor(opt.value)}
                              className={`w-6 h-6 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center ${inlineColor === opt.value ? 'border-slate-800 scale-110' : 'border-transparent'
                                }`}
                              style={{ backgroundColor: opt.hex }}
                              title={opt.label}
                            />
                          ))}
                          <div className="flex items-center gap-1 border border-slate-200/60 bg-slate-50 hover:bg-white p-1 rounded-xl transition">
                            <input
                              type="color"
                              value={customHexInline}
                              onChange={(e) => {
                                setCustomHexInline(e.target.value);
                                setInlineColor(e.target.value);
                              }}
                              className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                            />
                            <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">Hex</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCreateColumnAtPosition(i)}
                        className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-2 rounded-xl text-xs shadow-md transition active:scale-[0.98] cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAddingColumnAtPosition(i);
                        setInlineTitle('');
                        setInlineColor(colorOptions[0].value);
                        setCustomHexInline('#4f46e5');
                      }}
                      className="absolute z-10 bg-white hover:bg-brand-green hover:text-white text-slate-400 w-8 h-8 rounded-full border border-slate-200 shadow flex items-center justify-center font-black text-lg opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95"
                    >
                      +
                    </button>
                  )}
                </div>

                {/* Column */}
                <div
                  onDragOver={onDragOverCard}
                  onDrop={(e) => onDropCard(e, col.key)}
                  className={`flex flex-col gap-3 rounded-2xl min-h-[520px] w-72 min-w-[288px] shrink-0 transform transition-all duration-300 hover:shadow-lg bg-white/40 border select-none group relative ${colClasses}`}
                  style={customStyles}
                >
                  {/* Draggable Column Header - Highlighted visually */}
                  <div
                    draggable
                    onDragStart={(e) => onDragStartCol(e, col.id)}
                    className="flex justify-between items-center select-none shrink-0 border-b border-slate-200/60 p-4 rounded-t-2xl relative bg-white/80 hover:bg-white/95 backdrop-blur-sm cursor-grab active:cursor-grabbing transition duration-200 shadow-sm"
                  >
                    {editingColumnId === col.id ? (
                      <form onSubmit={handleUpdateColumnDetails} className="flex flex-col gap-2 w-full animate-fade-in">
                        <input
                          type="text"
                          required
                          value={editColTitle}
                          onChange={(e) => setEditColTitle(e.target.value)}
                          className="px-3 py-1.5 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800 focus:outline-none"
                        />

                        <div className="flex flex-col gap-1 select-none">
                          <label className="text-[10px] font-bold text-slate-600">Mudar Cor</label>
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {colorOptions.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setEditColColor(opt.value)}
                                className={`w-6 h-6 rounded-full cursor-pointer transition-all border-2 ${editColColor === opt.value ? 'border-slate-800 scale-110' : 'border-transparent'
                                  }`}
                                style={{ backgroundColor: opt.hex }}
                                title={opt.label}
                              />
                            ))}
                            <div className="flex items-center gap-1 border border-slate-200 bg-white p-1 rounded-xl transition">
                              <input
                                type="color"
                                value={customHexEdit}
                                onChange={(e) => {
                                  setCustomHexEdit(e.target.value);
                                  setEditColColor(e.target.value);
                                }}
                                className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                              />
                              <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">Hex</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white font-bold py-1.5 rounded-xl text-xs transition active:scale-[0.98] cursor-pointer"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingColumnId(null)}
                            className="bg-white border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex flex-col select-none">
                          <span className="text-sm font-black tracking-tight text-slate-800">
                            {col.title}
                          </span>
                        </div>
                        <div className="flex gap-1.5 items-center select-none">
                          <button
                            onClick={() => {
                              setEditingColumnId(col.id);
                              setEditColTitle(col.title);
                              setEditColColor(col.color);
                              setCustomHexEdit(col.color.startsWith('#') ? col.color : '#4f46e5');
                            }}
                            className="text-[10px] text-slate-400 hover:text-brand-blue bg-white hover:bg-slate-50 border border-slate-200/50 px-1.5 py-1 rounded-lg transition cursor-pointer font-bold"
                          >
                            Editar
                          </button>
                          {columnToDelete === col.id ? (
                            <div className="absolute z-30 inset-0 bg-white/95 backdrop-blur-sm rounded-2xl p-2 flex flex-col justify-center items-center gap-2 animate-fade-in border border-red-200">
                              <p className="text-[10px] font-black text-slate-800 text-center leading-tight">
                                Excluir raia e migrar leads?
                              </p>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleDeleteColumn(col.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-1 rounded-xl text-[10px] shadow transition active:scale-[0.98] cursor-pointer"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={() => setColumnToDelete(null)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-xl text-[10px] transition cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setColumnToDelete(col.id)}
                              className="text-[10px] text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200/50 px-1.5 py-1 rounded-lg transition cursor-pointer"
                            >
                              ✕
                            </button>
                          )}
                          <span className="text-xs font-black bg-white px-2 py-1 rounded-lg border border-slate-200/30 ml-1">
                            {filteredLeads.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Body with Hover Button + Leads List */}
                  <div className="flex flex-col gap-3 h-full px-4 pb-4 overflow-y-auto">
                    {/* Add Lead button ONLY shown on hover over column body - Small and Compact */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => {
                          setSelectedColumnForLead(col.key);
                          setIsCreateLeadModalOpen(true);
                        }}
                        className="w-full text-[11px] font-bold bg-white hover:bg-brand-green/10 text-slate-700 hover:text-brand-green border border-slate-200/80 hover:border-brand-green/30 px-2 py-1.5 rounded-lg transition duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-1 leading-tight"
                      >
                        <span className="text-xs">➕</span> Cadastrar Lead
                      </button>
                    </div>

                    {filteredLeads.length === 0 ? (
                      <div className="text-center py-10 text-xs font-bold text-slate-400/70 italic select-none">
                        Nenhum lead aqui.
                      </div>
                    ) : (
                      filteredLeads.map((lead) => (
                        <div
                          key={lead.id}
                          draggable
                          onDragStart={(e) => onDragStartCard(e, lead)}
                          className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-200/70 transition-all duration-300 active:scale-[0.98] select-none shrink-0 group"
                        >
                          <div
                            onClick={() => {
                              setEditingLead(lead);
                              setEditLeadNome(lead.nome || '');
                              setEditLeadEmail(lead.email || '');
                              setEditLeadTelefone(lead.telefone || '');
                              setEditLeadDataNascimento(lead.data_nascimento || '');
                              setEditLeadSalvarContato(lead.salvar_contato || false);
                              setEditLeadSelectedOrigemId(lead.origem ? lead.origem.id : '');
                              setEditLeadSelectedInteresseId(lead.interesse ? lead.interesse.id : '');
                              setEditLeadCompareceu(lead.compareceu || false);
                              setIsEditLeadModalOpen(true);
                            }}
                            className="cursor-pointer flex flex-col gap-2 select-none"
                            title="Clique para editar este lead"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <h4 className="text-sm font-black text-slate-800 leading-snug break-words max-w-[85%] select-none">
                                {lead.nome}
                              </h4>
                              {lead.faltas > 0 && (
                                <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 leading-none">
                                  {lead.faltas} faltas
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium select-none truncate">
                              {lead.telefone}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {lead.origem && (
                                <span className="self-start bg-slate-50 text-slate-500 border border-slate-200/50 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                  {lead.origem.nome}
                                </span>
                              )}
                              {lead.interesse && (
                                <span className="self-start bg-indigo-50 text-indigo-600 border border-indigo-200/50 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                  {lead.interesse.nome}
                                </span>
                              )}
                              {lead.compareceu && (
                                <span className="self-start bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                  Compareceu
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Movimentação Select */}
                          <div className="border-t border-slate-100/60 pt-2 flex flex-col gap-1 select-none">
                            <label className="text-[9px] font-bold text-slate-400">Mudar status:</label>
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateStatus(lead, e.target.value)}
                              className="w-full text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200/60 rounded-lg px-2 py-1 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-blue/50 transition cursor-pointer"
                            >
                              <option value={lead.status} disabled>Mover para...</option>
                              {columns.map((targetCol) => {
                                if (targetCol.key === lead.status) return null;
                                return (
                                  <option key={targetCol.id} value={targetCol.key}>
                                    {targetCol.title}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Final gap zone right after the last column */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDropCol(e, columns.length)}
            className="group flex-shrink-0 flex items-center justify-center w-8 h-[520px] relative"
          >
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-100 group-hover:bg-brand-green/40 opacity-0 group-hover:opacity-100 transition duration-300"></div>
            {isAddingColumnAtPosition === columns.length ? (
              <div className="absolute z-20 w-72 min-w-[288px] bg-white p-4 rounded-xl border border-brand-green shadow-xl flex flex-col gap-3 left-1/2 -translate-x-1/2 top-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800 tracking-tight">
                    Adicionar Coluna
                  </span>
                  <button
                    onClick={() => setIsAddingColumnAtPosition(null)}
                    className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1 rounded-lg transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  placeholder="Ex: Qualificados"
                  className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-blue text-xs font-bold"
                />

                <div className="flex flex-col gap-1.5 select-none">
                  <label className="text-[10px] font-bold text-slate-600">Cor da Coluna</label>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setInlineColor(opt.value)}
                        className={`w-6 h-6 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center ${inlineColor === opt.value ? 'border-slate-800 scale-110' : 'border-transparent'
                          }`}
                        style={{ backgroundColor: opt.hex }}
                        title={opt.label}
                      />
                    ))}
                    <div className="flex items-center gap-1 border border-slate-200/60 bg-slate-50 hover:bg-white p-1 rounded-xl transition">
                      <input
                        type="color"
                        value={customHexInline}
                        onChange={(e) => {
                          setCustomHexInline(e.target.value);
                          setInlineColor(e.target.value);
                        }}
                        className="w-5 h-5 rounded cursor-pointer border-none bg-transparent"
                      />
                      <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">Hex</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCreateColumnAtPosition(columns.length)}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-2 rounded-xl text-xs shadow-md transition active:scale-[0.98] cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAddingColumnAtPosition(columns.length);
                  setInlineTitle('');
                  setInlineColor(colorOptions[0].value);
                  setCustomHexInline('#4f46e5');
                }}
                className="absolute z-10 bg-white hover:bg-brand-green hover:text-white text-slate-400 w-8 h-8 rounded-full border border-slate-200 shadow flex items-center justify-center font-black text-lg opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95"
              >
                +
              </button>
            )}
          </div>
        </div>
      )}

      {/* Novo Lead Modal */}
      {isCreateLeadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col gap-5 transform transition animate-fade-in select-none">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Cadastrar Novo Lead</h3>
                <p className="text-xs text-slate-400 font-medium leading-none">Adicione informações completas do paciente</p>
              </div>
              <button
                onClick={() => {
                  setIsCreateLeadModalOpen(false);
                  setSelectedColumnForLead(null);
                }}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {leadError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium animate-pulse">
                {leadError}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Nome completo *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Ana Souza"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: ana@exemplo.com"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (11) 99999-0000"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Data de Nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1 select-none">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600">Origem do Lead</label>
                  {!isAddingOrigem ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingOrigem(true)}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      + Nova Origem
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingOrigem(false);
                        setNewOrigemNome('');
                      }}
                      className="text-[10px] font-black text-slate-500 hover:text-slate-700 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {!isAddingOrigem ? (
                  <select
                    value={selectedOrigemId || ''}
                    onChange={(e) => setSelectedOrigemId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  >
                    <option value="">Nenhuma origem definida</option>
                    {origens.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOrigemNome}
                      onChange={(e) => setNewOrigemNome(e.target.value)}
                      placeholder="Ex: Instagram"
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newOrigemNome.trim() || !token || !selectedClinicaId) return;
                        try {
                          const res = await fetch(`${API_URL}/api/v1/origens`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ clinica_id: selectedClinicaId, nome: newOrigemNome }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setOrigens((prev) => [...prev, data]);
                            setSelectedOrigemId(data.id);
                            setNewOrigemNome('');
                            setIsAddingOrigem(false);
                          } else {
                            alert('Erro ao criar origem.');
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-3 py-1.5 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1 select-none">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600">Interesse do Lead</label>
                  {!isAddingInteresse ? (
                    <button
                      type="button"
                      onClick={() => setIsAddingInteresse(true)}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                    >
                      + Novo Interesse
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingInteresse(false);
                        setNewInteresseNome('');
                      }}
                      className="text-[10px] font-black text-slate-500 hover:text-slate-700 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {!isAddingInteresse ? (
                  <select
                    value={selectedInteresseId || ''}
                    onChange={(e) => setSelectedInteresseId(e.target.value ? parseInt(e.target.value, 10) : '')}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                  >
                    <option value="">Nenhum interesse definido</option>
                    {interesses.map((int) => (
                      <option key={int.id} value={int.id}>
                        {int.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInteresseNome}
                      onChange={(e) => setNewInteresseNome(e.target.value)}
                      placeholder="Ex: Botox"
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newInteresseNome.trim() || !token || !selectedClinicaId) return;
                        try {
                          const res = await fetch(`${API_URL}/api/v1/interesses`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ clinica_id: selectedClinicaId, nome: newInteresseNome }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setInteresses((prev) => [...prev, data]);
                            setSelectedInteresseId(data.id);
                            setNewInteresseNome('');
                            setIsAddingInteresse(false);
                          } else {
                            alert('Erro ao criar interesse.');
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="px-3 py-1.5 bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 select-none py-1">
                <input
                  type="checkbox"
                  id="salvar_contato_lead_modal"
                  checked={salvarContato}
                  onChange={(e) => setSalvarContato(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-green border-slate-300 focus:ring-brand-green cursor-pointer"
                />
                <label htmlFor="salvar_contato_lead_modal" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Salvar contato
                </label>
              </div>

              <div className="flex items-center gap-2 select-none py-1">
                <input
                  type="checkbox"
                  id="compareceu_lead_modal"
                  checked={compareceu}
                  onChange={(e) => setCompareceu(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-green border-slate-300 focus:ring-brand-green cursor-pointer"
                />
                <label htmlFor="compareceu_lead_modal" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Compareceu
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer"
                >
                  Adicionar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {isEditLeadModalOpen && editingLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col gap-4 transform transition animate-fade-in select-none">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Editar Lead</h3>
                <p className="text-xs text-slate-400 font-medium leading-none">Atualize as informações do paciente</p>
              </div>
              <button
                onClick={() => {
                  setIsEditLeadModalOpen(false);
                  setEditingLead(null);
                }}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditLead} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Nome completo *</label>
                <input
                  type="text"
                  required
                  value={editLeadNome}
                  onChange={(e) => setEditLeadNome(e.target.value)}
                  placeholder="Ex: Ana Souza"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Email</label>
                <input
                  type="email"
                  value={editLeadEmail}
                  onChange={(e) => setEditLeadEmail(e.target.value)}
                  placeholder="Ex: ana@exemplo.com"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={editLeadTelefone}
                  onChange={(e) => setEditLeadTelefone(e.target.value)}
                  placeholder="Ex: (11) 99999-0000"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">Data de Nascimento</label>
                <input
                  type="date"
                  value={editLeadDataNascimento}
                  onChange={(e) => setEditLeadDataNascimento(e.target.value)}
                  className="px-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                />
              </div>

              <div className="flex flex-col gap-1 select-none">
                <label className="text-xs font-bold text-slate-600">Origem do Lead</label>
                <select
                  value={editLeadSelectedOrigemId || ''}
                  onChange={(e) => setEditLeadSelectedOrigemId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Nenhuma origem definida</option>
                  {origens.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1 select-none">
                <label className="text-xs font-bold text-slate-600">Interesse do Lead</label>
                <select
                  value={editLeadSelectedInteresseId || ''}
                  onChange={(e) => setEditLeadSelectedInteresseId(e.target.value ? parseInt(e.target.value, 10) : '')}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold"
                >
                  <option value="">Nenhum interesse definido</option>
                  {interesses.map((int) => (
                    <option key={int.id} value={int.id}>
                      {int.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4 select-none py-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_salvar_contato_lead_modal"
                    checked={editLeadSalvarContato}
                    onChange={(e) => setEditLeadSalvarContato(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-green border-slate-300 focus:ring-brand-green cursor-pointer"
                  />
                  <label htmlFor="edit_salvar_contato_lead_modal" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                    Salvar contato
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_compareceu_lead_modal"
                    checked={editLeadCompareceu}
                    onChange={(e) => setEditLeadCompareceu(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-green border-slate-300 focus:ring-brand-green cursor-pointer"
                  />
                  <label htmlFor="edit_compareceu_lead_modal" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                    Compareceu
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 rounded-xl shadow-lg transition active:scale-[0.98] cursor-pointer"
                >
                  Salvar Alterações
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm('Tem certeza que deseja excluir este lead?')) return;
                    try {
                      const res = await fetch(`${API_URL}/api/v1/leads/${editingLead.id}`, {
                        method: 'DELETE',
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });
                      if (res.ok) {
                        setIsEditLeadModalOpen(false);
                        setEditingLead(null);
                        fetchLeads(token, selectedClinicaId);
                      } else {
                        alert('Erro ao excluir lead.');
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold px-4 py-3 rounded-xl shadow-sm transition active:scale-[0.98] cursor-pointer"
                >
                  Excluir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Creation Modal */}
      {schedulingConsultaLead && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col gap-5 transform transition animate-fade-in select-none">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Agendar Consulta</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Paciente:{' '}
                  <span className="text-brand-blue font-bold tracking-tight">
                    {schedulingConsultaLead.nome}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSchedulingConsultaLead(null)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateConsultaModal} className="flex flex-col gap-4">
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
                <label className="text-xs font-bold text-slate-600">Observações</label>
                <textarea
                  value={modalConsObs}
                  onChange={(e) => setModalConsObs(e.target.value)}
                  placeholder="Ex: Primeira consulta do paciente"
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue transition font-bold h-24 resize-none"
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
    </div>
  );
}
