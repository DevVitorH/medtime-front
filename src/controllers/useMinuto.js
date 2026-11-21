import { useEffect, useState } from 'react';

/** Devolve a hora atual e atualiza a cada minuto (o timer é limpo ao sair da tela). */
export function useMinuto() {
  const [agora, setAgora] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setAgora(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  return agora;
}
