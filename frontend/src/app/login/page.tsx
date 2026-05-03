'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/dashboard');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error('Usuário ou senha inválidos.');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      localStorage.setItem('clinica_slug', data.clinica_slug || '');
      localStorage.setItem('clinica_id', data.clinica_id || '');

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-blue mb-1">
            Leadora
          </h1>
          <p className="text-slate-500 font-medium">
            Converse. Converta. Cresça.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-slate-700">Usuário</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-slate-800 transition"
              placeholder="Digite seu usuário"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-bold text-slate-700">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent text-slate-800 transition"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-brand-blue text-white py-2 rounded-xl font-bold hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-brand-blue transition shadow-md shadow-brand-blue/10 active:scale-[0.98]"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-2 text-center text-xs text-slate-400">
          Leadora Multi-tenancy Management Platform &copy; 2026
        </div>
      </div>
    </div>
  );
}
