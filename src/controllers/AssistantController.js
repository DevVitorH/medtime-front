import { useState } from 'react';
import { api } from '../services/api';

export function useAssistantController() {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ask = async (pergunta) => {
    if (!pergunta.trim()) return;
    setLoading(true); setError('');
    try { setAnswer((await api.post('/api/assistente/perguntar', { pergunta: pergunta.trim() })).resposta); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  return { answer, loading, error, ask };
}
