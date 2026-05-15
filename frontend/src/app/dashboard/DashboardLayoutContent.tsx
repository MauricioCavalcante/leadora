'use client';

import React, { useState } from 'react';
import { useDashboard } from './context';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const {
    username,
    role,
    clinicas,
    selectedClinicaId,
    setSelectedClinicaId,
    isSidebarExpanded,
    setIsSidebarExpanded,
    logout,
  } = useDashboard();

  const handleClinicaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value ? parseInt(e.target.value, 10) : null;
    setSelectedClinicaId(cid);
    if (cid) {
      localStorage.setItem('selectedClinicaId', cid.toString());
      window.location.reload();
    }
  };

  const navItems = [
    { id: 'DASHBOARD', title: 'Dashboard', path: '/dashboard', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 14a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1v-5zm10 4a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1h-4a1 1 0 01-1-1v-1z" />
      </svg>
    )},
    { id: 'ADMINISTRATIVO', title: 'Administrativo', path: '/administrativo', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    )},
    { id: 'KANBAN', title: 'Kanban', path: '/kanban', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: 'CONSULTAS', title: 'Consultas', path: '/consultas', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )},
    { id: 'FUPS', title: 'FUPs', path: '/fups', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { id: 'FUPS_POS', title: 'FUP Pós', path: '/fups-pos', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
      </svg>
    )},
    { id: 'LEADS_FALTAS', title: 'Leads', path: '/leads', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { id: 'CONTATOS', title: 'Contatos', path: '/contatos', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { id: 'ORIENTACOES', title: 'Orientações', path: '/orientacoes', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )},
    { id: 'TAREFAS', title: 'Tarefas', path: '/tarefas', icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )},
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans select-none overflow-hidden relative">
      {/* Mobile background overlay */}
      {isSidebarExpanded && (
        <div
          onClick={() => setIsSidebarExpanded(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full z-50 bg-slate-900 text-white flex flex-col justify-between p-3 transition-all duration-300 border-r border-slate-800 shrink-0 select-none ${
          isSidebarExpanded
            ? 'w-64 translate-x-0'
            : 'w-16 -translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-5 shrink-0">
          {/* Sidebar Top: Logo / Name and toggle button */}
          <div className={`flex items-center ${isSidebarExpanded ? 'justify-between' : 'justify-center'} px-1 h-12 shrink-0`}>
            {isSidebarExpanded && (
              <div className="flex items-center gap-2 select-none shrink-0">
                <span className="text-xl font-black text-white tracking-wider flex items-center gap-1.5 leading-none select-none shrink-0">
                  Leadora
                  <span className="text-brand-green font-black select-none shrink-0 animate-pulse">.</span>
                </span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
              className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition cursor-pointer select-none shrink-0"
            >
              {isMenuHovered ? (
                <svg className="w-4 h-4 shrink-0 animate-fade-in" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d={isSidebarExpanded ? "M11 19l-7-7 7-7" : "M13 5l7 7-7 7"} />
                </svg>
              )}
            </button>
          </div>

          {/* Core Navigation Items */}
          <nav className="flex flex-col gap-1 shrink-0">
            {navItems.map((tab) => {
              const active = pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    router.push(tab.path);
                    if (window.innerWidth < 768) {
                      setIsSidebarExpanded(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold transition text-left cursor-pointer group relative shrink-0 select-none ${
                    active ? 'bg-white/15 text-white' : 'hover:bg-white/5 text-white/70 hover:text-white'
                  }`}
                >
                  <span className={`${active ? 'text-brand-green' : 'text-white'} shrink-0`}>{tab.icon}</span>
                  {isSidebarExpanded && <span className="text-sm truncate shrink-0">{tab.title}</span>}

                  {!isSidebarExpanded && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 backdrop-blur-sm border border-slate-700 whitespace-nowrap z-50 pointer-events-none select-none">
                      {tab.title}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Section */}
        <div className="border-t border-white/10 pt-3 mt-4 shrink-0">
          <div className={`flex items-center ${isSidebarExpanded ? 'gap-3 mb-3' : 'justify-center mb-3'} shrink-0`}>
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-brand-blue font-black shadow-md shrink-0">
              {username ? username[0].toUpperCase() : 'U'}
            </div>
            {isSidebarExpanded && (
              <div className="truncate select-none shrink-0">
                <p className="text-sm font-bold truncate leading-tight shrink-0">{username}</p>
                <p className="text-[10px] text-white/60 capitalize leading-tight shrink-0">{role?.toLowerCase()}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isSidebarExpanded && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <main className="flex-1 p-4 md:p-8 overflow-auto flex flex-col gap-6 md:gap-8 select-none">
        {/* Header with clinic switching */}
        <header className="flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="md:hidden text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2.5 rounded-xl transition cursor-pointer select-none shrink-0"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">Leadora</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-normal">
                Ambiente de secretária multi-clínica inteligente.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto md:ml-0">
            <label className="text-xs font-bold text-slate-500 hidden sm:inline">Workspace / Clínica:</label>
            <select
              value={selectedClinicaId || ''}
              onChange={handleClinicaChange}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold text-brand-blue text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue transition cursor-pointer"
            >
              {clinicas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
