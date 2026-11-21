import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { hoje } from '../config';
import { toResumo } from '../models';

// Visão do supervisor: resumo de hoje de uma pessoa acompanhada (somente leitura).
export function useResumoController(dependenteId) {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true); setError('');
    try { setResumo(toResumo(await api.get(`/api/dependentes/${dependenteId}/resumo?data=${hoje()}`))); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [dependenteId]);
  useEffect(() => { carregar(); }, [carregar]);

  // Parar de acompanhar (lança o erro para a janela de confirmação mostrar).
  const parar = (vinculoId) => api.del(`/api/vinculos/${vinculoId}`);

  return { resumo, loading, error, carregar, parar };
}
