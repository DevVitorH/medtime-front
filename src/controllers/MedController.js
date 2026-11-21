import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { hoje } from '../config';
import { fromMedicamento, toMedicamento } from '../models';

const byTime = (a, b) => a.time.localeCompare(b.time);

export function useMedController(enabled) {
  const [dia, setDia] = useState(hoje()); // dia escolhido na faixa da Home (yyyy-MM-dd)
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // A API devolve só os remédios agendados para o dia pedido.
  const carregar = useCallback(async () => {
    setLoading(true); setError('');
    try { setMeds((await api.get(`/api/medicamentos?data=${dia}`)).map(toMedicamento).sort(byTime)); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [dia]);

  useEffect(() => { if (enabled) carregar(); else setMeds([]); }, [enabled, carregar]);

  const selecionarDia = (d) => setDia(d);

  // Só é possível marcar o remédio de hoje.
  const tomar = async (id) => {
    if (dia !== hoje()) return;
    try {
      const d = await api.post(`/api/medicamentos/${id}/tomar?data=${dia}`);
      setMeds((l) => l.map((m) => (m.id === id ? toMedicamento(d) : m)));
    } catch (e) { setError(e.message); }
  };
  // Lança o erro para a tela de cadastro exibir a mensagem. Depois recarrega:
  // o remédio novo pode não estar agendado para o dia escolhido.
  const adicionar = async (m) => {
    await api.post('/api/medicamentos', fromMedicamento(m));
    await carregar();
  };
  return { dia, meds, loading, error, carregar, selecionarDia, tomar, adicionar };
}
