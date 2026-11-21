import { useCallback, useEffect, useState } from 'react';
import { api, setAoExpirar, setToken } from '../services/api';
import { apagarSessao, lerSessao, salvarSessao } from '../services/sessao';
import { toUsuario } from '../models';

const SESSAO_EXPIRADA = 'Sessão expirada. Entre novamente.';

export function useAuthController() {
  const [user, setUser] = useState(null);
  const [restaurando, setRestaurando] = useState(true); // lendo a sessão salva ao abrir o app
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const limpar = useCallback(async () => {
    setToken(null); setUser(null);
    await apagarSessao();
  }, []);

  // Ao abrir o app: se o token salvo ainda vale, entra direto.
  useEffect(() => {
    setAoExpirar(() => { limpar(); setError(SESSAO_EXPIRADA); });
    (async () => {
      const s = await lerSessao();
      if (s && new Date(s.expiraEm) > new Date()) {
        setToken(s.token);
        try { setUser(toUsuario(await api.get('/api/usuarios/me'))); }
        catch (e) { if (e.status !== 401) setError(e.message); } // 401 já foi tratado em aoExpirar
      } else if (s) {
        await limpar(); setError(SESSAO_EXPIRADA);
      }
      setRestaurando(false);
    })();
  }, [limpar]);

  const iniciarSessao = async (rota, corpo) => {
    setLoading(true); setError('');
    try {
      const r = await api.post(rota, corpo);
      setToken(r.token);
      await salvarSessao(r.token, r.expiraEm);
      setUser(toUsuario(r.usuario));
      return true;
    } catch (e) { setError(e.message); return false; } finally { setLoading(false); }
  };

  const entrar = (email, senha) => iniciarSessao('/api/auth/entrar', { email, senha });
  const cadastrar = (email, senha) => iniciarSessao('/api/auth/cadastrar', { email, senha, aceiteLgpd: true });
  const sair = async () => { await limpar(); setError(''); };
  const limparErro = () => setError('');

  // Lança o erro para a tela de Perfil exibir a mensagem.
  const salvarPerfil = async (nome, idade) => {
    const d = await api.put('/api/usuarios/me', { nome, idade: Number(idade) });
    setUser(toUsuario(d));
  };

  return { user, restaurando, loading, error, entrar, cadastrar, sair, salvarPerfil, limparErro };
}
