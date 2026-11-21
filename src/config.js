import { Platform } from 'react-native';
// Emulador Android acessa o PC em 10.0.2.2. Em celular físico, use o IP do PC (EXPO_PUBLIC_API_URL no .env).
const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${host}:8080`;
// true = dados de demonstração (sem servidor). Para usar o Spring Boot: EXPO_PUBLIC_USE_MOCK=false
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
// Datas no formato da API (yyyy-MM-dd), no fuso do aparelho.
export const dataISO = (d) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};
export const hoje = () => dataISO(new Date());
// "2026-11-21" -> Date local (sem o problema de fuso do new Date("2026-11-21")).
export const deISO = (s) => new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
