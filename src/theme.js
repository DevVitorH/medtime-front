// Identidade visual do MedTime: TODAS as cores, tamanhos, espaços e formas ficam aqui.
// As telas usam só estes nomes (nada de cor ou tamanho solto). Fonte: a do sistema.

/** Cores. Contraste conferido: branco sobre primary = 7,48:1; branco sobre redDark = 6,47:1. */
export const C = {
  bg: '#F8F9FA', card: '#FFFFFF', onPrimary: '#FFFFFF',
  primary: '#0A4AC6', primaryPressed: '#083A9A', primaryBg: '#E8F0FD',
  ink: '#0F172A', muted: '#475569', hint: '#64748B',
  border: '#94A3B8', // borda de campos de texto (visível)
  line: '#E2E8F0',   // borda neutra de cartões e divisórias
  ok: '#10B981', okDark: '#047857', okBg: '#D1FAE5',
  red: '#EF4444', redDark: '#B91C1C', redPressed: '#991B1B', redBg: '#FEE2E2',
  // Âmbar para "tomado com atraso": texto bem escuro para contraste forte.
  amber: '#F59E0B', amberDark: '#78350F', amberBg: '#FEF3C7',
  overlay: 'rgba(15, 23, 42, 0.6)',
};

/** Tamanhos de texto (mínimo 16) e pesos: regular para textos, semibold para botões e títulos. */
export const T = {
  corpo: 16, medio: 18, titulo: 20, grande: 24, // títulos >= 20
  numero: 36,   // números de destaque (adesão, dias seguidos, horário)
  codigo: 44,   // código de supervisão e relógio
  regular: '400', semibold: '600',
};

/** Escala única de espaçamento. */
export const E = { p: 8, m: 12, g: 16, gg: 24 };

/** Raio único (cartões, botões, campos). Círculos usam metade do próprio tamanho. */
export const R = 12;

/** Tamanhos de ícone (um só conjunto: Ionicons). */
export const I = { p: 20, m: 24, g: 28 };

/** Altura mínima de qualquer área de toque. */
export const TOQUE = 56;

/** Sombra leve (funciona na Web e no celular). */
export const SOMBRA = { boxShadow: '0px 1px 3px rgba(15, 23, 42, 0.08)' };
