import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, SOMBRA, T, TOQUE } from '../theme';

// Nomes usados nas telas que mostram datas (Home e Histórico).
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
export const SEMANA_NOME = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

// Cores de cada tipo de botão: fundo, fundo pressionado, borda e texto.
const V = {
  primary: { bg: C.primary, press: C.primaryPressed, bd: C.primary, fg: C.onPrimary },
  soft: { bg: C.card, press: C.primaryBg, bd: C.primary, fg: C.primary },
  danger: { bg: C.redDark, press: C.redPressed, bd: C.redDark, fg: C.onPrimary },
};

// a11y: rótulo falado pelo leitor de tela quando o texto do botão é curto demais (ex.: "+1").
export const Btn = ({ label, onPress, icon, variant = 'primary', style, disabled, a11y }) => {
  const v = V[variant];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y || label} accessibilityState={{ disabled: !!disabled }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: pressed ? v.press : v.bg, borderColor: v.bd, opacity: disabled ? 0.5 : 1 }, style]}>
      {icon && <Ionicons name={icon} size={I.m} color={v.fg} />}
      <Text style={[s.btnT, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
};

export const Field = ({ label, ...p }) => (
  <View style={{ marginBottom: E.gg }}>
    <Text style={s.label}>{label}</Text>
    <TextInput {...p} accessibilityLabel={label} placeholderTextColor={C.hint} style={s.input} />
  </View>
);

export const Header = ({ title, sub, left, right }) => (
  <View style={s.header}>
    {left}
    <View style={{ flex: 1 }}>
      <Text accessibilityRole="header" style={s.title}>{title}</Text>
      {!!sub && <Text style={s.sub}>{sub}</Text>}
    </View>
    {right}
  </View>
);

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

/** Marca do MedTime: a inicial "M" num círculo azul (usada no assistente). */
export const Marca = ({ tamanho = 48 }) => (
  <View accessible={false} style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: C.onPrimary, fontSize: tamanho >= 40 ? T.grande : T.corpo, fontWeight: T.semibold }}>M</Text>
  </View>
);

/** Botão só de ícone (voltar, opções, enviar). Sempre 56x56 e com rótulo para o leitor de tela. */
export const BotaoIcone = ({ icon, onPress, label, cor = C.ink, fundo, disabled }) => (
  <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} disabled={disabled}
    style={({ pressed }) => [s.botaoIcone, fundo && { backgroundColor: pressed ? C.primaryPressed : fundo }, !fundo && pressed && { backgroundColor: C.primaryBg }, disabled && { opacity: 0.5 }]}>
    <Ionicons name={icon} size={I.g} color={cor} />
  </Pressable>
);

const TABS = [
  ['home', 'Início', 'home'], ['history', 'Histórico', 'calendar'],
  ['assistant', 'Assistente', 'chatbubbles'], ['profile', 'Perfil', 'person'],
];
export const BottomNav = ({ current, onChange }) => (
  <View style={s.nav}>
    {TABS.map(([key, label, icon]) => {
      const on = current === key;
      return (
        <Pressable key={key} onPress={() => onChange(key)} accessibilityRole="tab" accessibilityLabel={label}
          accessibilityState={{ selected: on }} style={s.tab}>
          <Ionicons name={on ? icon : icon + '-outline'} size={I.m} color={on ? C.primary : C.muted} />
          <Text style={[s.tabT, { color: on ? C.primary : C.muted, fontWeight: on ? T.semibold : T.regular }]}>{label}</Text>
        </Pressable>
      );
    })}
  </View>
);

export const s = StyleSheet.create({
  btn: { minHeight: TOQUE, borderRadius: R, borderWidth: 2, paddingHorizontal: E.g, paddingVertical: E.p, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: E.p },
  btnT: { fontSize: T.medio, fontWeight: T.semibold, textAlign: 'center', flexShrink: 1 },
  botaoIcone: { width: TOQUE, height: TOQUE, borderRadius: TOQUE / 2, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: T.medio, fontWeight: T.semibold, color: C.ink, marginBottom: E.p },
  input: { minHeight: TOQUE, borderWidth: 2, borderColor: C.border, borderRadius: R, backgroundColor: C.card, paddingHorizontal: E.g, fontSize: T.medio, color: C.ink },
  header: { flexDirection: 'row', alignItems: 'center', gap: E.m, paddingHorizontal: E.g, paddingVertical: E.m, minHeight: 72, backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.line },
  title: { fontSize: T.grande, fontWeight: T.semibold, color: C.ink },
  sub: { fontSize: T.corpo, color: C.muted, marginTop: 2 },
  card: { backgroundColor: C.card, borderRadius: R, borderWidth: 1, borderColor: C.line, padding: E.g, marginBottom: E.m, ...SOMBRA },
  nav: { flexDirection: 'row', backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.line, paddingVertical: E.p },
  tab: { flex: 1, minHeight: TOQUE, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabT: { fontSize: T.corpo },
  // Textos usados nas telas.
  h2: { fontSize: T.titulo, fontWeight: T.semibold, color: C.ink },
  corpo: { fontSize: T.corpo, color: C.ink, lineHeight: 24 },
  apoio: { fontSize: T.corpo, color: C.muted },
  erro: { fontSize: T.corpo, color: C.redDark },
  sucesso: { fontSize: T.corpo, color: C.okDark },
});
