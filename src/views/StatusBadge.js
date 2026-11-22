import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, T, TOQUE } from '../theme';
import { limiteDoHorario } from '../models';

// Cores de cada status. O status também aparece em texto e ícone (nunca só cor).
const ESTILO = {
  PENDENTE: { icone: 'time-outline', cor: C.primary, fundo: C.primaryBg, borda: C.line },
  ATRASADO: { icone: 'alarm-outline', cor: C.redDark, fundo: C.redBg, borda: C.red },
  TOMADO: { icone: 'checkmark-circle', cor: C.okDark, fundo: C.okBg, borda: C.ok },
  TOMADO_COM_ATRASO: { icone: 'checkmark-circle', cor: C.amberDark, fundo: C.amberBg, borda: C.amber },
};

/** Cor da borda do cartão do remédio para cada status. */
export const bordaDoStatus = (status) => (ESTILO[status] || ESTILO.PENDENTE).borda;

/** Texto do selo. "home" = tela do próprio usuário; "supervisor" = tela de quem acompanha. */
const texto = (m, status, modo) => {
  const hora = m.takenAt ? ` às ${m.takenAt}` : '';
  if (modo === 'home') {
    return {
      PENDENTE: 'Pendente',
      ATRASADO: 'Atrasado',
      TOMADO: 'Tomado',
      TOMADO_COM_ATRASO: `Tomado${hora} (atrasado)`,
    }[status];
  }
  return {
    PENDENTE: 'Pendente',
    ATRASADO: `Atrasado desde ${limiteDoHorario(m.time)}`,
    TOMADO: `Tomado${hora}`,
    TOMADO_COM_ATRASO: `Tomado${hora} · com atraso`,
  }[status];
};

/** Frase para o leitor de tela e para o botão Ouvir. Ex.: "Remédio das 11:00, tomado às 12:30 com atraso". */
export const falaStatus = (m, status) => {
  const hora = m.takenAt ? ` às ${m.takenAt}` : '';
  const situacao = {
    PENDENTE: 'pendente',
    ATRASADO: `atrasado desde ${limiteDoHorario(m.time)}`,
    TOMADO: `tomado${hora}`,
    TOMADO_COM_ATRASO: `tomado${hora} com atraso`,
  }[status] || 'pendente';
  return `Remédio das ${m.time}, ${situacao}`;
};

/** Selo de status usado na Home e na tela do supervisor. */
export default function StatusBadge({ med, status, modo = 'home', style }) {
  const e = ESTILO[status] || ESTILO.PENDENTE;
  return (
    <View accessible accessibilityLabel={falaStatus(med, status)}
      style={[{ minHeight: TOQUE, flexDirection: 'row', gap: E.p, alignItems: 'center', justifyContent: 'center', paddingHorizontal: E.m, paddingVertical: E.p, borderRadius: R, backgroundColor: e.fundo, borderWidth: 1, borderColor: e.borda }, style]}>
      <Ionicons name={e.icone} size={I.m} color={e.cor} />
      <Text style={{ flexShrink: 1, fontSize: T.medio, fontWeight: T.semibold, color: e.cor, textAlign: 'center' }}>{texto(med, status, modo)}</Text>
    </View>
  );
}
