import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';
import { toCodigo, toPessoa, toVinculos } from '../models';

// Supervisão no Perfil: meus supervisores, quem eu acompanho, gerar código e conectar.
export function useVinculoController() {
  const [vinculos, setVinculos] = useState({ supervisors: [], dependents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregar = useCallback(async () => {
    setLoading(true); setError('');
    try { setVinculos(toVinculos(await api.get('/api/vinculos'))); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  // Os três abaixo lançam o erro para a tela mostrar a mensagem certa (inválido, expirado, já usado...).
  const gerarCodigo = async () => toCodigo(await api.post('/api/vinculos/codigo'));
  const conectar = async (codigo) => {
    const pessoa = toPessoa(await api.post('/api/vinculos/conectar', { codigo }));
    await carregar();
    return pessoa;
  };
  const remover = async (vinculoId) => {
    await api.del(`/api/vinculos/${vinculoId}`);
    await carregar();
  };

  return { vinculos, loading, error, carregar, gerarCodigo, conectar, remover };
}
