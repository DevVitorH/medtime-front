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
  const [aviso, setAviso] = useState(''); // mensagem de sucesso (ex.: "Remédio excluído.")

  // A API devolve só os remédios agendados para o dia pedido.
  const carregar = useCallback(async () => {
    setLoading(true); setError('');
    try { setMeds((await api.get(`/api/medicamentos?data=${dia}`)).map(toMedicamento).sort(byTime)); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [dia]);

  useEffect(() => { if (enabled) carregar(); else setMeds([]); }, [enabled, carregar]);

  const selecionarDia = (d) => { setAviso(''); setDia(d); };
  const limparAviso = () => setAviso('');

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
  // editar e excluir também lançam o erro: a tela mostra a mensagem e o botão de tentar de novo.
  const editar = async (id, m) => {
    await api.put(`/api/medicamentos/${id}`, fromMedicamento(m));
    setAviso('Alterações salvas.');
    await carregar();
  };
  const excluir = async (id) => {
    await api.del(`/api/medicamentos/${id}`);
    setAviso('Remédio excluído.');
    await carregar();
  };
  return { dia, meds, loading, error, aviso, carregar, selecionarDia, limparAviso, tomar, adicionar, editar, excluir };
}
