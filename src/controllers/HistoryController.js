import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { hoje } from '../config';
import { toHistorico } from '../models';

export function useHistoryController() {
  const [hist, setHist] = useState({ streak: 0, adherence: 0, status: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let on = true;
    (async () => {
      const data = hoje();
      try { const d = await api.get(`/api/historico?mes=${data.slice(0, 7)}&data=${data}`); if (on) setHist(toHistorico(d)); }
      catch (e) { if (on) setError(e.message); } finally { if (on) setLoading(false); }
    })();
    return () => { on = false; };
  }, []);
  return { hist, loading, error };
}
