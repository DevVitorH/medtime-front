import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, T } from '../theme';
import { useHistoryController } from '../controllers/HistoryController';
import { Card, Header, MESES, s } from './components';
import CalendarioHistorico from './CalendarioHistorico';

export default function History({ meds }) {
  const historico = useHistoryController(); // histórico do próprio usuário
  const { hist } = historico;
  const agora = new Date();
  const TODAY = agora.getDate();
  return (
    <View style={{ flex: 1 }}>
      <Header title="Seu progresso" sub="Veja quando você tomou seus remédios" />
      <ScrollView contentContainerStyle={{ padding: E.g }}>
        <CalendarioHistorico historico={historico} />

        {/* Os números são do mês mostrado no calendário. */}
        <View style={{ flexDirection: 'row', gap: E.m }}>
          <Stat n={String(hist.streak)} t="Dias seguidos" fg={C.primary} />
          <Stat n={`${hist.adherence}%`} t="Adesão" fg={C.okDark} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: E.gg, marginBottom: E.m }}>
          <Text accessibilityRole="header" style={s.h2}>Resumo de hoje</Text>
          <Text style={s.apoio}>{TODAY} de {MESES[agora.getMonth()]}</Text>
        </View>
        {meds.map((m) => (
          <Card key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: E.m }}>
            <View style={{ backgroundColor: m.done ? C.okBg : C.bg, borderRadius: R, paddingHorizontal: E.m, paddingVertical: E.m }}>
              <Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: m.done ? C.okDark : C.muted }}>{m.time}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.ink }}>{m.name}</Text>
              <Text style={s.apoio}>{m.dose}</Text>
            </View>
            <Ionicons name={m.done ? 'checkmark-circle' : 'time-outline'} size={I.g} color={m.done ? C.okDark : C.hint} accessibilityLabel={m.done ? 'Tomado' : 'Pendente'} />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

// Número de destaque num cartão neutro (a cor fica só no número).
export const Stat = ({ n, t, fg }) => (
  <Card style={{ flex: 1, alignItems: 'center', marginBottom: 0 }}>
    <Text style={{ fontSize: T.numero, fontWeight: T.semibold, color: fg }}>{n}</Text>
    <Text style={{ fontSize: T.corpo, color: C.muted }}>{t}</Text>
  </Card>
);
