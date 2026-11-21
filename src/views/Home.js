import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { C } from '../theme';
import { dataISO, deISO, hoje } from '../config';
import { Btn, Card, MESES, SEMANA, SEMANA_NOME } from './components';
import OpcoesRemedio from './OpcoesRemedio';
import StatusBadge, { bordaDoStatus, falaStatus } from './StatusBadge';
import { statusAgora } from '../models';
import { useMinuto } from '../controllers/useMinuto';

// Faixa de 7 dias: 3 antes, hoje e 3 depois.
const faixaDeDias = (agora) => [-3, -2, -1, 0, 1, 2, 3].map((dif) => {
  const d = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() + dif);
  return { data: dataISO(d), semana: SEMANA[d.getDay()], nome: SEMANA_NOME[d.getDay()], dia: d.getDate(), mes: d.getMonth() };
});

// Situação sem botão (dias que não são hoje): Tomado, Não tomado ou Agendado.
const Situacao = ({ icone, texto, cor, fundo }) => (
  <View style={{ flex: 1, minHeight: 56, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: fundo }}>
    <Ionicons name={icone} size={24} color={cor} /><Text style={{ fontSize: 18, fontWeight: '800', color: cor }}>{texto}</Text>
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

  // Borda do cartão: hoje e dias passados com tomada seguem o status; o resto fica com a borda normal.
  const bordaDoCartao = (m) => {
    const st = statusDe(m);
    if (m.done || (eHoje && st === 'ATRASADO')) return { borderColor: bordaDoStatus(st), borderWidth: 2 };
    return null;
  };

  const acaoOuSituacao = (m) => {
    if (eHoje) {
      return m.done
        ? <StatusBadge med={m} status={statusDe(m)} style={{ flex: 1 }} />
        : <Btn label="JÁ TOMEI" onPress={() => onTake(m.id)} style={{ flex: 1 }} />;
    }
    if (passado) {
      return m.done
        ? <StatusBadge med={m} status={statusDe(m)} style={{ flex: 1 }} />
        : <Situacao icone="close-circle" texto="Não tomado" cor={C.redDark} fundo={C.redBg} />;
    }
    return <Situacao icone="time-outline" texto="Agendado" cor={C.primary} fundo={C.primaryBg} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: C.ink }}>{user.name ? `Olá, ${user.name.split(' ')[0]}!` : 'Olá!'}</Text>
              <Text style={{ fontSize: 17, color: C.muted, marginTop: 4 }}>{resumoTopo}</Text>
            </View>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
              {user.name
                ? <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>{user.name[0].toUpperCase()}</Text>
                : <Ionicons name="person" size={26} color="#fff" />}
            </View>
          </View>
          {eHoje || (passado && meds.length > 0) ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.ink }}>Progresso do Dia</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.primary }}>{pct}%</Text>
              </View>
              <View style={{ height: 10, borderRadius: 5, backgroundColor: C.line, marginTop: 6 }}>
                <View style={{ width: `${pct}%`, height: 10, borderRadius: 5, backgroundColor: C.primary }} />
              </View>
            </>
          ) : null}
        </View>

        <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, margin: 20, marginBottom: 12 }}>{MESES[sel.getMonth()]} {sel.getFullYear()}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 4 }}>
          {faixaDeDias(new Date()).map((d) => {
            const on = d.data === dia, ehHoje = d.data === hojeISO;
            return (
              <Pressable key={d.data} onPress={() => onSelectDay(d.data)} accessibilityRole="button"
                accessibilityState={{ selected: on }} accessibilityLabel={`${d.nome}, ${d.dia} de ${MESES[d.mes]}${ehHoje ? ', hoje' : ''}`}
                style={{ alignItems: 'center', justifyContent: 'center', width: 68, minHeight: 96, borderRadius: 18, backgroundColor: on ? C.primary : '#fff', borderWidth: 2, borderColor: on || ehHoje ? C.primary : C.line }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: on ? '#fff' : C.muted }}>{d.semana}</Text>
                <Text style={{ fontSize: 26, fontWeight: '800', color: on ? '#fff' : C.ink }}>{d.dia}</Text>
                {ehHoje && <Text style={{ fontSize: 16, fontWeight: '800', color: on ? '#fff' : C.primary }}>HOJE</Text>}
              </Pressable>
            );
          })}
        </ScrollView>

        {!!aviso && (
          <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginTop: 16, padding: 12, paddingLeft: 16, borderRadius: 16, backgroundColor: C.okBg, borderWidth: 2, borderColor: C.ok }}>
            <Ionicons name="checkmark-circle" size={28} color={C.okDark} />
            <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: C.okDark }}>{aviso}</Text>
            <Pressable onPress={onClearAviso} accessibilityRole="button" accessibilityLabel="Fechar aviso"
              style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={28} color={C.okDark} />
            </Pressable>
          </View>
        )}
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, margin: 20, marginBottom: 12 }}>
          {eHoje ? 'Remédios de hoje' : `Remédios de ${rotuloDia}`}</Text>
        {loading && <ActivityIndicator size="large" color={C.primary} style={{ marginBottom: 16 }} />}
        {!!error && (
          <View style={{ marginHorizontal: 20, marginBottom: 16, padding: 16, borderRadius: 16, backgroundColor: C.redBg }}>
            <Text style={{ fontSize: 17, color: C.redDark, marginBottom: 12 }}>{error}</Text>
            <Btn label="TENTAR DE NOVO" variant="soft" onPress={onReload} />
          </View>
        )}
        {!loading && !error && meds.length === 0 && (
          <Text style={{ fontSize: 18, color: C.muted, marginHorizontal: 20 }}>Nenhum remédio neste dia.</Text>
        )}
        <View style={{ paddingHorizontal: 20 }}>
          {meds.map((m) => (
            // Tocar no card abre as opções. accessible={false}: o leitor de tela continua
            // vendo os botões de dentro (JÁ TOMEI, OUVIR e Opções) separadamente.
            <Pressable key={m.id} onPress={() => abrirOpcoes(m)} accessible={false}>
            <Card style={bordaDoCartao(m)}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <View style={{ backgroundColor: m.done ? C.okBg : C.primaryBg, borderRadius: 14, paddingHorizontal: 12, justifyContent: 'center', alignSelf: 'flex-start', minHeight: 56 }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: m.done ? C.okDark : C.primary }}>{m.time}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{m.name}</Text>
                  <Text style={{ fontSize: 17, color: C.muted, marginTop: 2 }}>{m.dose}</Text>
                </View>
                <Pressable onPress={() => abrirOpcoes(m)} accessibilityRole="button" accessibilityLabel="Opções do remédio"
                  style={{ width: 56, height: 56, marginTop: -8, marginRight: -8, alignItems: 'center', justifyContent: 'center', borderRadius: 28 }}>
                  <Ionicons name="ellipsis-vertical" size={28} color={C.ink} />
                </Pressable>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}>
                <Ionicons name="information-circle-outline" size={22} color={C.muted} />
                <Text style={{ flex: 1, fontSize: 16, color: C.muted }}>{m.note}</Text>
              </View>
              {/* Atrasado: o selo fica em cima e o JÁ TOMEI continua ativo embaixo. */}
              {eHoje && !m.done && statusDe(m) === 'ATRASADO' && (
                <StatusBadge med={m} status="ATRASADO" style={{ marginBottom: 12 }} />
              )}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {acaoOuSituacao(m)}
                <Btn label="OUVIR" icon="volume-high" variant="soft" onPress={() => speak(m)} style={{ flex: 1 }} />
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
      <Pressable onPress={() => go('add')} accessibilityRole="button" accessibilityLabel="Novo Remédio"
        style={{ position: 'absolute', right: 20, bottom: 16, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 28, paddingHorizontal: 24, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}>
        <Ionicons name="add" size={28} color="#fff" /><Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>Novo Remédio</Text>
      </Pressable>
    </View>
  );
}
