import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, T } from '../theme';
import { useHistoryController } from '../controllers/HistoryController';
import { Card, Header, MESES, s } from './components';

// Células do calendário do mês: espaços vazios até o 1º dia cair no dia da semana certo.
const celulasDoMes = (agora) => {
  const ano = agora.getFullYear(), mes = agora.getMonth();
  const vazios = new Date(ano, mes, 1).getDay(); // 0 = domingo
  const totalDias = new Date(ano, mes + 1, 0).getDate(); // último dia do mês
  const cells = [...Array(vazios).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return cells;
};

export default function History({ meds }) {
  const { hist, loading, error } = useHistoryController();
  const agora = new Date();
  const TODAY = agora.getDate();
  const cells = celulasDoMes(agora);
  return (
    <View style={{ flex: 1 }}>
      <Header title="Seu progresso" sub="Veja quando você tomou seus remédios" />
      <ScrollView contentContainerStyle={{ padding: E.g }}>
        {loading && <ActivityIndicator size="large" color={C.primary} style={{ marginBottom: E.m }} accessibilityLabel="Carregando" />}
        {!!error && <Text style={[s.erro, { marginBottom: E.m }]}>{error}</Text>}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: E.m }}>
            <Ionicons name="chevron-back" size={I.m} color={C.hint} />
            <Text style={[s.h2, { marginHorizontal: E.gg }]}>{MESES[agora.getMonth()]} {agora.getFullYear()}</Text>
            <Ionicons name="chevron-forward" size={I.m} color={C.hint} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <Text key={i} style={{ width: '14.28%', textAlign: 'center', fontSize: T.corpo, fontWeight: T.semibold, color: C.muted }}>{d}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((n, i) => {
              const st = hist.status[n], miss = st === 'FALHOU', today = n === TODAY;
              return (
                <View key={i} style={{ width: '14.28%', height: 48, alignItems: 'center', justifyContent: 'center' }}>
                  {n && (
                    <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: today ? 2 : 0, borderColor: C.primary }}>
                      <Text style={{ fontSize: T.corpo, fontWeight: today ? T.semibold : T.regular, color: C.ink }}>{n}</Text>
                      {st && <View style={{ position: 'absolute', bottom: 1, width: E.p, height: E.p, borderRadius: E.p / 2, backgroundColor: miss ? C.red : C.ok }} />}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: E.gg, marginTop: E.p }}>
            <Legend color={C.ok} t="Tomou tudo" /><Legend color={C.red} t="Esqueceu" />
          </View>
        </Card>

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

const Legend = ({ color, t }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: E.p }}>
    <View style={{ width: E.m, height: E.m, borderRadius: E.m / 2, backgroundColor: color }} />
    <Text style={s.apoio}>{t}</Text>
  </View>
);
// Número de destaque num cartão neutro (a cor fica só no número).
export const Stat = ({ n, t, fg }) => (
  <Card style={{ flex: 1, alignItems: 'center', marginBottom: 0 }}>
    <Text style={{ fontSize: T.numero, fontWeight: T.semibold, color: fg }}>{n}</Text>
    <Text style={{ fontSize: T.corpo, color: C.muted }}>{t}</Text>
  </Card>
);
