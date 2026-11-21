// Guarda a sessão (token da API + data de expiração) no aparelho.
// Web: localStorage. Celular: expo-secure-store (armazenamento protegido do sistema).
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const CHAVE = 'viverbem.sessao';
const web = Platform.OS === 'web';

export async function salvarSessao(token, expiraEm) {
  const valor = JSON.stringify({ token, expiraEm });
  try {
    if (web) localStorage.setItem(CHAVE, valor);
    else await SecureStore.setItemAsync(CHAVE, valor);
  } catch { /* sem armazenamento: a sessão vale só enquanto o app estiver aberto */ }
}

/** Devolve { token, expiraEm } ou null. */
export async function lerSessao() {
  try {
    const valor = web ? localStorage.getItem(CHAVE) : await SecureStore.getItemAsync(CHAVE);
    return valor ? JSON.parse(valor) : null;
  } catch { return null; }
}

export async function apagarSessao() {
  try {
    if (web) localStorage.removeItem(CHAVE);
    else await SecureStore.deleteItemAsync(CHAVE);
  } catch { /* nada a apagar */ }
}
