import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useHistoryController } from '../controllers/HistoryController';
import { Card, Header, MESES } from './components';

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
      <Header title="Seu Progresso" sub="Veja quando você tomou seus remédios" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading && <Text style={{ fontSize: 17, color: C.muted, marginBottom: 12 }}>Carregando...</Text>}
        {!!error && <Text style={{ fontSize: 17, color: C.redDark, marginBottom: 12 }}>{error}</Text>}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="chevron-back" size={28} color={C.muted} />
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, marginHorizontal: 24 }}>{MESES[agora.getMonth()]} {agora.getFullYear()}</Text>
            <Ionicons name="chevron-forward" size={28} color={C.muted} />
          </View>
          <View style={{ flexDirection: 'row' }}>
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <Text key={i} style={{ width: '14.28%', textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.muted }}>{d}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((n, i) => {
              const st = hist.status[n], miss = st === 'FALHOU', today = n === TODAY;
              return (
                <View key={i} style={{ width: '14.28%', height: 52, alignItems: 'center', justifyContent: 'center' }}>
                  {n && (
                    <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: today ? 2.5 : 0, borderColor: C.primary }}>
                      <Text style={{ fontSize: 17, fontWeight: today ? '800' : '600', color: C.ink }}>{n}</Text>
                      {st && <View style={{ position: 'absolute', bottom: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: miss ? C.red : C.ok }} />}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
            <Legend color={C.ok} t="Tomou tudo" /><Legend color={C.red} t="Esqueceu" />
          </View>
        </Card>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Stat n={String(hist.streak)} t="Dias seguidos" bg={C.primaryBg} fg={C.primary} />
          <Stat n={`${hist.adherence}%`} t="Adesão" bg={C.okBg} fg={C.okDark} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginVertical: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink }}>Resumo de Hoje</Text>
          <Text style={{ fontSize: 17, color: C.muted }}>{TODAY} de {MESES[agora.getMonth()]}</Text>
        </View>
        {meds.map((m) => (
          <Card key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ backgroundColor: m.done ? C.okBg : C.line, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 14 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: m.done ? C.okDark : C.muted }}>{m.time}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{m.name}</Text>
              <Text style={{ fontSize: 17, color: C.muted }}>{m.dose}</Text>
            </View>
            <Ionicons name={m.done ? 'checkmark-circle' : 'time-outline'} size={36} color={m.done ? C.ok : C.hint} accessibilityLabel={m.done ? 'Tomado' : 'Pendente'} />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const Legend = ({ color, t }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: color }} />
    <Text style={{ fontSize: 16, color: C.muted }}>{t}</Text>
  </View>
);
const Stat = ({ n, t, bg, fg }) => (
  <View style={{ flex: 1, backgroundColor: bg, borderRadius: 20, padding: 16, alignItems: 'center' }}>
    <Text style={{ fontSize: 40, fontWeight: '800', color: fg }}>{n}</Text>
    <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink }}>{t}</Text>
  </View>
);
