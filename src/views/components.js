import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

// Nomes usados nas telas que mostram datas (Home e Histórico).
export const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
export const SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
export const SEMANA_NOME = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

const V = {
  primary: { bg: C.primary, bd: C.primary, fg: '#fff' },
  soft: { bg: '#fff', bd: C.primary, fg: C.primary },
  danger: { bg: C.red, bd: C.red, fg: '#fff' },
};

// a11y: rótulo falado pelo leitor de tela quando o texto do botão é curto demais (ex.: "+1").
export const Btn = ({ label, onPress, icon, variant = 'primary', style, disabled, a11y }) => {
  const v = V[variant];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y || label} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [s.btn, { backgroundColor: v.bg, borderColor: v.bd, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 }, style]}>
      {icon && <Ionicons name={icon} size={24} color={v.fg} />}
      <Text style={[s.btnT, { color: v.fg }]}>{label}</Text>
    </Pressable>
  );
};

export const Field = ({ label, ...p }) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput {...p} accessibilityLabel={label} placeholderTextColor={C.hint} style={s.input} />
  </View>
);

export const Header = ({ title, sub, left, right }) => (
  <View style={s.header}>
    {left}
    <View style={{ flex: 1 }}>
      <Text style={s.title}>{title}</Text>
      {!!sub && <Text style={s.sub}>{sub}</Text>}
    </View>
    {right}
  </View>
);

export const Card = ({ children, style }) => <View style={[s.card, style]}>{children}</View>;

const TABS = [
  ['home', 'Início', 'home'], ['history', 'Histórico', 'time'],
  ['assistant', 'Assistente', 'mic'], ['profile', 'Perfil', 'person'],
];
export const BottomNav = ({ current, onChange }) => (
  <View style={s.nav}>
    {TABS.map(([key, label, icon]) => {
      const on = current === key;
      return (
        <Pressable key={key} onPress={() => onChange(key)} accessibilityRole="tab" accessibilityLabel={label}
          accessibilityState={{ selected: on }} style={s.tab}>
          <Ionicons name={on ? icon : icon + '-outline'} size={28} color={on ? C.primary : C.muted} />
          <Text style={[s.tabT, { color: on ? C.primary : C.muted, fontWeight: on ? '800' : '600' }]}>{label}</Text>
        </Pressable>
      );
    })}
  </View>
);

export const s = StyleSheet.create({
  btn: { minHeight: 56, borderRadius: 16, borderWidth: 2, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnT: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 8 },
  input: { minHeight: 56, borderWidth: 2, borderColor: C.border, borderRadius: 14, backgroundColor: '#fff', paddingHorizontal: 16, fontSize: 18, color: C.ink },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: C.line },
  title: { fontSize: 28, fontWeight: '800', color: C.ink },
  sub: { fontSize: 17, color: C.muted, marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: C.line, padding: 16, marginBottom: 16 },
  nav: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8, paddingBottom: 8 },
  tab: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabT: { fontSize: 15 },
});
