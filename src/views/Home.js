import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { C, E, I, R, SOMBRA, T, TOQUE } from '../theme';
import { dataISO, deISO, hoje } from '../config';
import { BotaoIcone, Btn, Card, MESES, SEMANA, SEMANA_NOME, s } from './components';
import OpcoesRemedio from './OpcoesRemedio';
import StatusBadge, { bordaDoStatus, falaStatus } from './StatusBadge';
import { statusAgora } from '../models';
import { useMinuto } from '../controllers/useMinuto';

// Faixa de 7 dias: 3 antes, hoje e 3 depois.
const faixaDeDias = (agora) => [-3, -2, -1, 0, 1, 2, 3].map((dif) => {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + dif);
  return { data: dataISO(d), semana: SEMANA[d.getDay()], nome: SEMANA_NOME[d.getDay()], dia: d.getDate(), mes: d.getMonth() };
});

// Situação sem botão (dias que não são hoje): Não tomado ou Agendado.
const Situacao = ({ icone, texto, cor, fundo }) => (
  <View style={{ flex: 1, minHeight: TOQUE, flexDirection: 'row', gap: E.p, alignItems: 'center', justifyContent: 'center', borderRadius: R, backgroundColor: fundo }}>
    <Ionicons name={icone} size={I.m} color={cor} /><Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: cor }}>{texto}</Text>
  </View>
);

export default function Home({ meds, dia, onSelectDay, user, go, onTake, loading, error, onReload,
  onEdit, onDelete, aviso, onClearAviso }) {
  const [opcoes, setOpcoes] = useState(null); // remédio com a janela de opções aberta
  const abrirOpcoes = (m) => { onClearAviso(); setOpcoes(m); };
  const hojeISO = hoje();
  const eHoje = dia === hojeISO;
  const passado = dia < hojeISO; // datas yyyy-MM-dd podem ser comparadas como texto
  const sel = deISO(dia);
  const rotuloDia = `${SEMANA_NOME[sel.getDay()]}, ${sel.getDate()}`;
  const done = meds.filter((m) => m.done).length;
  const pct = meds.length ? Math.round((done / meds.length) * 100) : 0;
  const resumoTopo = eHoje ? `Você já tomou ${done} de ${meds.length} remédios de hoje`
    : passado ? `Você tomou ${done} de ${meds.length} remédios em ${rotuloDia}`
      : `${meds.length} ${meds.length === 1 ? 'remédio agendado' : 'remédios agendados'} para ${rotuloDia}`;
  // Reavalia a cada minuto: um remédio PENDENTE vira ATRASADO quando passa do horário + 30 min.
  const agora = useMinuto();
  const statusDe = (m) => statusAgora(m, eHoje, agora);
  const speak = (m) => Speech.speak(`${m.name}. ${m.dose}. ${m.note}. ${falaStatus(m, statusDe(m))}.`, { language: 'pt-BR' });

  // Borda do cartão: cinza por padrão; cor só para estado (tomado, com atraso, atrasado).
  const bordaDoCartao = (m) => {
    const st = statusDe(m);
    if (m.done || (eHoje && st === 'ATRASADO')) return { borderColor: bordaDoStatus(st), borderWidth: 2 };
    return null;
  };

  const acaoOuSituacao = (m) => {
    // Selo de tomado com mais espaço que o "Ouvir": "Tomado às 18:03 (atrasado)" cabe sem quebrar demais.
    if (eHoje) {
      return m.done
        ? <StatusBadge med={m} status={statusDe(m)} style={{ flex: 2 }} />
        : <Btn label="Já tomei" icon="checkmark" onPress={() => onTake(m.id)} style={{ flex: 1 }} />;
    }
    if (passado) {
      return m.done
        ? <StatusBadge med={m} status={statusDe(m)} style={{ flex: 2 }} />
        : <Situacao icone="close-circle-outline" texto="Não tomado" cor={C.redDark} fundo={C.redBg} />;
    }
    return <Situacao icone="time-outline" texto="Agendado" cor={C.primary} fundo={C.primaryBg} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <View style={{ backgroundColor: C.card, padding: E.g, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: E.m }}>
            <View style={{ flex: 1 }}>
              <Text accessibilityRole="header" style={{ fontSize: T.grande, fontWeight: T.semibold, color: C.ink }}>
                {user.name ? `Olá, ${user.name.split(' ')[0]}!` : 'Olá!'}</Text>
              <Text style={[s.apoio, { marginTop: 2 }]}>{resumoTopo}</Text>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
              {user.name
                ? <Text style={{ color: C.primary, fontSize: T.titulo, fontWeight: T.semibold }}>{user.name[0].toUpperCase()}</Text>
                : <Ionicons name="person-outline" size={I.m} color={C.primary} />}
            </View>
          </View>
          {eHoje || (passado && meds.length > 0) ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: E.g }}>
                <Text style={{ fontSize: T.corpo, fontWeight: T.semibold, color: C.ink }}>Progresso do dia</Text>
                <Text style={{ fontSize: T.corpo, fontWeight: T.semibold, color: C.primary }}>{pct}%</Text>
              </View>
              <View style={{ height: E.p, borderRadius: E.p / 2, backgroundColor: C.line, marginTop: E.p }}>
                <View style={{ width: `${pct}%`, height: E.p, borderRadius: E.p / 2, backgroundColor: C.primary }} />
              </View>
            </>
          ) : null}
        </View>

        <Text style={[s.h2, { marginHorizontal: E.g, marginTop: E.gg, marginBottom: E.m }]}>{MESES[sel.getMonth()]} {sel.getFullYear()}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: E.p, paddingHorizontal: E.g, paddingBottom: E.p }}>
          {faixaDeDias(new Date()).map((d) => {
            const on = d.data === dia, ehHoje = d.data === hojeISO;
            return (
              <Pressable key={d.data} onPress={() => onSelectDay(d.data)} accessibilityRole="button"
                accessibilityState={{ selected: on }} accessibilityLabel={`${d.nome}, ${d.dia} de ${MESES[d.mes]}${ehHoje ? ', hoje' : ''}`}
                style={{ alignItems: 'center', justifyContent: 'center', width: 64, minHeight: 88, borderRadius: R, backgroundColor: on ? C.primary : C.card, borderWidth: on || ehHoje ? 2 : 1, borderColor: on || ehHoje ? C.primary : C.line }}>
                <Text style={{ fontSize: T.corpo, color: on ? C.onPrimary : C.muted }}>{d.semana}</Text>
                <Text style={{ fontSize: T.grande, fontWeight: T.semibold, color: on ? C.onPrimary : C.ink }}>{d.dia}</Text>
                {ehHoje && <Text style={{ fontSize: T.corpo, fontWeight: T.semibold, color: on ? C.onPrimary : C.primary }}>Hoje</Text>}
              </Pressable>
            );
          })}
        </ScrollView>

        {!!aviso && (
          <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: E.p, marginHorizontal: E.g, marginTop: E.g, paddingLeft: E.g, borderRadius: R, backgroundColor: C.okBg, borderWidth: 1, borderColor: C.ok }}>
            <Ionicons name="checkmark-circle" size={I.m} color={C.okDark} />
            <Text style={{ flex: 1, fontSize: T.corpo, fontWeight: T.semibold, color: C.okDark }}>{aviso}</Text>
            <BotaoIcone icon="close" label="Fechar aviso" cor={C.okDark} onPress={onClearAviso} />
          </View>
        )}
        <Text accessibilityRole="header" style={[s.h2, { marginHorizontal: E.g, marginTop: E.gg, marginBottom: E.m }]}>
          {eHoje ? 'Remédios de hoje' : `Remédios de ${rotuloDia}`}</Text>
        {loading && <ActivityIndicator size="large" color={C.primary} style={{ marginBottom: E.g }} accessibilityLabel="Carregando" />}
        {!!error && (
          <View style={{ marginHorizontal: E.g, marginBottom: E.g, padding: E.g, borderRadius: R, backgroundColor: C.redBg, gap: E.m }}>
            <Text style={s.erro}>{error}</Text>
            <Btn label="Tentar de novo" variant="soft" onPress={onReload} />
          </View>
        )}
        {!loading && !error && meds.length === 0 && (
          <Text style={[s.apoio, { fontSize: T.medio, marginHorizontal: E.g }]}>Nenhum remédio neste dia.</Text>
        )}
        <View style={{ paddingHorizontal: E.g }}>
          {meds.map((m) => (
            // Tocar no card abre as opções. accessible={false}: o leitor de tela continua
            // vendo os botões de dentro (Já tomei, Ouvir e Opções) separadamente.
            <Pressable key={m.id} onPress={() => abrirOpcoes(m)} accessible={false}>
            <Card style={bordaDoCartao(m)}>
              <View style={{ flexDirection: 'row', gap: E.m }}>
                <View style={{ backgroundColor: C.primaryBg, borderRadius: R, paddingHorizontal: E.m, justifyContent: 'center', alignSelf: 'flex-start', minHeight: TOQUE }}>
                  <Text style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.primary }}>{m.time}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.ink }}>{m.name}</Text>
                  <Text style={[s.apoio, { marginTop: 2 }]}>{m.dose}</Text>
                </View>
                <View style={{ marginTop: -E.p, marginRight: -E.p }}>
                  <BotaoIcone icon="ellipsis-vertical" label="Opções do remédio" onPress={() => abrirOpcoes(m)} />
                </View>
              </View>
              {!!m.note && (
                <View style={{ flexDirection: 'row', gap: E.p, marginTop: E.m }}>
                  <Ionicons name="information-circle-outline" size={I.p} color={C.muted} />
                  <Text style={[s.apoio, { flex: 1 }]}>{m.note}</Text>
                </View>
              )}
              {/* Atrasado: o selo fica em cima e o "Já tomei" continua ativo embaixo. */}
              {eHoje && !m.done && statusDe(m) === 'ATRASADO' && (
                <StatusBadge med={m} status="ATRASADO" style={{ marginTop: E.m }} />
              )}
              <View style={{ flexDirection: 'row', gap: E.m, marginTop: E.m }}>
                {acaoOuSituacao(m)}
                <Btn label="Ouvir" icon="volume-high-outline" variant="soft" a11y={`Ouvir ${m.name}`} onPress={() => speak(m)} style={{ flex: 1 }} />
              </View>
            </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {opcoes && (
        <OpcoesRemedio med={opcoes} onClose={() => setOpcoes(null)}
          onEdit={(m) => { setOpcoes(null); onEdit(m); }} onDelete={onDelete} />
      )}
      <Pressable onPress={() => go('add')} accessibilityRole="button" accessibilityLabel="Novo remédio"
        style={({ pressed }) => ({ position: 'absolute', right: E.g, bottom: E.g, minHeight: TOQUE, flexDirection: 'row', alignItems: 'center', gap: E.p, backgroundColor: pressed ? C.primaryPressed : C.primary, borderRadius: R, paddingHorizontal: E.gg, ...SOMBRA })}>
        <Ionicons name="add" size={I.g} color={C.onPrimary} /><Text style={{ color: C.onPrimary, fontSize: T.medio, fontWeight: T.semibold }}>Novo remédio</Text>
      </Pressable>
    </View>
  );
}
