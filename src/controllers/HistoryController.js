import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { hoje } from '../config';
import { toHistorico } from '../models';

// Soma (ou subtrai) meses de um "yyyy-MM".
const somarMes = (mes, n) => {
  const d = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1 + n, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Calendário mensal (dias que tomou tudo ou esqueceu, dias seguidos e adesão).
 * Sem dependenteId: o histórico do usuário logado. Com dependenteId: o de quem ele acompanha (só com vínculo).
 */
export function useHistoryController(dependenteId) {
  const mesAtual = hoje().slice(0, 7);
  const [mes, setMes] = useState(mesAtual);
  const [hist, setHist] = useState({ streak: 0, adherence: 0, status: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true); setError('');
    setHist({ streak: 0, adherence: 0, status: {} }); // não mostra os dias do mês anterior enquanto carrega
    const base = dependenteId ? `/api/dependentes/${dependenteId}/historico` : '/api/historico';
    try { setHist(toHistorico(await api.get(`${base}?mes=${mes}&data=${hoje()}`))); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [dependenteId, mes]);
  useEffect(() => { carregar(); }, [carregar]);

  const podeAvancar = mes < mesAtual; // mês futuro ainda não tem dias para mostrar
  const anterior = () => setMes((m) => somarMes(m, -1));
  const proximo = () => { if (podeAvancar) setMes((m) => somarMes(m, 1)); };

  return { mes, hist, loading, error, carregar, anterior, proximo, podeAvancar };
}
