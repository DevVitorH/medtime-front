import { useState } from 'react';
import { api } from '../services/api';
import { toResposta } from '../models';

const hora = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
let proximoId = 1;
const mensagem = (from, text, extra = {}) => ({ id: proximoId++, from, text, time: hora(), ...extra });
const boasVindas = () => mensagem('assistente',
  'Olá! Sou o assistente do MedTime. Pergunte sobre seus remédios de hoje, horários ou como tomar.', { welcome: true });

/**
 * Conversa com o assistente. Fica no App (e não na tela) para não sumir ao trocar de aba.
 * Só fica na memória (nada em disco) e só a pergunta atual vai para a API.
 */
export function useAssistantController() {
  const [mensagens, setMensagens] = useState(() => [boasVindas()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ultima, setUltima] = useState(''); // última pergunta, para "Tentar de novo"

  const perguntar = async (pergunta) => {
    setLoading(true); setError(''); setUltima(pergunta);
    try {
      const r = toResposta(await api.post('/api/assistente/perguntar', { pergunta }));
      setMensagens((l) => [...l, mensagem('assistente', r.text, { notice: r.notice })]);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const enviar = (texto) => {
    const pergunta = texto.trim();
    if (!pergunta || loading) return;
    setMensagens((l) => [...l, mensagem('usuario', pergunta)]);
    perguntar(pergunta);
  };
  // Reenvia a última pergunta (a bolha dela já está na conversa).
  const tentarDeNovo = () => { if (ultima && !loading) perguntar(ultima); };
  // Ao sair da conta, a conversa é apagada.
  const limpar = () => { setMensagens([boasVindas()]); setError(''); setUltima(''); };

  return { mensagens, loading, error, enviar, tentarDeNovo, limpar };
}
