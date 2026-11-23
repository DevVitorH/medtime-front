import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, T } from '../theme';
import { hoje } from '../config';
import { BotaoIcone, Btn, Card, MESES, s } from './components';

// Células do calendário do mês: espaços vazios até o 1º dia cair no dia da semana certo.
const celulasDoMes = (ano, mes) => {
  const vazios = new Date(ano, mes, 1).getDay(); // 0 = domingo
  const totalDias = new Date(ano, mes + 1, 0).getDate(); // último dia do mês
  const cells = [...Array(vazios).fill(null), ...Array.from({ length: totalDias }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return cells;
};

// Cada status tem cor E símbolo (não depende só da cor).
const MARCA = {
  TOMOU: { icon: 'checkmark-circle', cor: C.ok, falar: 'tomou tudo' },
  FALHOU: { icon: 'close-circle', cor: C.red, falar: 'esqueceu remédio' },
};

/**
 * Calendário do mês usado no Histórico (do próprio usuário) e no Acompanhamento (supervisor).
 * Recebe o retorno de useHistoryController.
 */
export default function CalendarioHistorico({ historico }) {
  const { mes, hist, loading, error, carregar, anterior, proximo, podeAvancar } = historico;
  const ano = Number(mes.slice(0, 4)), m = Number(mes.slice(5, 7)) - 1;
  const hojeISO = hoje();
  const diaDeHoje = hojeISO.slice(0, 7) === mes ? Number(hojeISO.slice(8, 10)) : null;
  const nomeMes = `${MESES[m]} ${ano}`;

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: E.m }}>
        <BotaoIcone icon="chevron-back" label="Mês anterior" cor={C.primary} onPress={anterior} disabled={loading} />
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={s.h2}>{nomeMes}</Text>
        <BotaoIcone icon="chevron-forward" label="Próximo mês" cor={podeAvancar ? C.primary : C.hint}
          onPress={proximo} disabled={loading || !podeAvancar} />
      </View>

      {loading && <ActivityIndicator size="large" color={C.primary} style={{ marginBottom: E.m }} accessibilityLabel="Carregando" />}
      {!loading && !!error && (
        <View style={{ padding: E.g, borderRadius: R, backgroundColor: C.redBg, marginBottom: E.m, gap: E.m }}>
          <Text style={s.erro}>{error}</Text>
          <Btn label="Tentar de novo" variant="soft" onPress={carregar} />
        </View>
      )}

      <View style={{ flexDirection: 'row' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <Text key={i} style={{ width: '14.28%', textAlign: 'center', fontSize: T.corpo, fontWeight: T.semibold, color: C.muted }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {celulasDoMes(ano, m).map((n, i) => {
          const marca = n && MARCA[hist.status[n]];
          const ehHoje = n === diaDeHoje;
          const rotulo = n && `dia ${n}${marca ? `, ${marca.falar}` : ''}${ehHoje ? ', hoje' : ''}`;
          return (
            <View key={i} style={{ width: '14.28%', height: 48, alignItems: 'center', justifyContent: 'center' }}
              accessible={!!n} accessibilityLabel={rotulo || undefined}>
              {n && (
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: ehHoje ? 2 : 0, borderColor: C.primary }}>
                  <Text style={{ fontSize: T.corpo, fontWeight: ehHoje ? T.semibold : T.regular, color: C.ink }}>{n}</Text>
                  {marca && (
                    <View style={{ position: 'absolute', bottom: -E.p / 2, right: -E.p / 4, backgroundColor: C.card, borderRadius: E.p }}>
                      <Ionicons name={marca.icon} size={E.g} color={marca.cor} />
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: E.gg, marginTop: E.p }}>
        <Legenda marca={MARCA.TOMOU} t="Tomou tudo" /><Legenda marca={MARCA.FALHOU} t="Esqueceu" />
      </View>
    </Card>
  );
}

const Legenda = ({ marca, t }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: E.p }}>
    <Ionicons name={marca.icon} size={I.p} color={marca.cor} />
    <Text style={s.apoio}>{t}</Text>
  </View>
);
