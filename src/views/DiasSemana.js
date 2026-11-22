import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, T } from '../theme';
import { Btn } from './components';

// [sigla da API, texto do botão, nome falado]
export const DIAS = [
  ['DOM', 'Dom', 'domingo'], ['SEG', 'Seg', 'segunda'], ['TER', 'Ter', 'terça'], ['QUA', 'Qua', 'quarta'],
  ['QUI', 'Qui', 'quinta'], ['SEX', 'Sex', 'sexta'], ['SAB', 'Sáb', 'sábado'],
];
export const TODOS_OS_DIAS = DIAS.map((d) => d[0]);
const UTEIS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX'];
const ORDEM = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
const mesmos = (a, b) => a.length === b.length && b.every((d) => a.includes(d));

/** Texto curto para o resumo: "Todos os dias", "Seg a Sex" ou "Seg, Qua, Sex". */
export const resumoDias = (sel) => {
  if (sel.length === 7) return 'Todos os dias';
  if (mesmos(sel, UTEIS)) return 'Seg a Sex';
  return ORDEM.filter((s) => sel.includes(s)).map((s) => DIAS.find((d) => d[0] === s)[1]).join(', ');
};

export default function DiasSemana({ valor, onChange }) {
  const alternar = (s) => onChange(valor.includes(s) ? valor.filter((x) => x !== s) : [...valor, s]);
  return (
    <View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: E.p, marginBottom: E.m }}>
        {DIAS.map(([sigla, texto, nome]) => {
          const on = valor.includes(sigla);
          return (
            <Pressable key={sigla} onPress={() => alternar(sigla)} accessibilityRole="checkbox" accessibilityLabel={nome}
              accessibilityState={{ checked: on }}
              style={{ width: '22%', minHeight: 72, borderRadius: R, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: on ? C.primary : C.card, borderColor: on ? C.primary : C.border }}>
              <Ionicons name={on ? 'checkmark-circle' : 'ellipse-outline'} size={I.m} color={on ? C.onPrimary : C.muted} />
              <Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: on ? C.onPrimary : C.ink }}>{texto}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: E.m }}>
        <Btn label="Todos os dias" variant={mesmos(valor, TODOS_OS_DIAS) ? 'primary' : 'soft'}
          onPress={() => onChange(TODOS_OS_DIAS)} style={{ flex: 1, paddingHorizontal: E.p }} />
        <Btn label="Segunda a sexta" variant={mesmos(valor, UTEIS) ? 'primary' : 'soft'}
          onPress={() => onChange(UTEIS)} style={{ flex: 1, paddingHorizontal: E.p }} />
      </View>
    </View>
  );
}
