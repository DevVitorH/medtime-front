import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { Btn, Card, Header } from './components';
import { useResumoController } from '../controllers/ResumoController';
import Confirmacao from './Confirmacao';
import StatusBadge, { bordaDoStatus } from './StatusBadge';
import { statusAgora } from '../models';
import { useMinuto } from '../controllers/useMinuto';

const Stat = ({ n, t, bg, fg }) => (
  <View style={{ flex: 1, backgroundColor: bg, borderRadius: 20, padding: 16, alignItems: 'center' }}>
    <Text style={{ fontSize: 40, fontWeight: '800', color: fg }}>{n}</Text>
    <Text style={{ fontSize: 18, fontWeight: '700', color: C.ink }}>{t}</Text>
  </View>
);

/** Tela do supervisor: resumo de hoje de quem ele acompanha. Somente leitura (sem JÁ TOMEI). */
export default function ResumoDependente({ pessoa, onBack }) {
  const { resumo, loading, error, carregar, parar } = useResumoController(pessoa.id);
  const [confirmar, setConfirmar] = useState(false);
  const agora = useMinuto(); // reavalia Pendente -> Atrasado a cada minuto

  return (
    <View style={{ flex: 1 }}>
      <Header title={pessoa.name} sub="Acompanhamento (somente leitura)" left={
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar" style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={30} color={C.ink} />
        </Pressable>} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading && <ActivityIndicator size="large" color={C.primary} style={{ marginVertical: 16 }} accessibilityLabel="Carregando" />}
        {!!error && (
          <View style={{ padding: 16, borderRadius: 16, backgroundColor: C.redBg, marginBottom: 16, gap: 12 }}>
            <Text style={{ fontSize: 17, color: C.redDark }}>{error}</Text>
            <Btn label="TENTAR DE NOVO" variant="soft" onPress={carregar} />
          </View>
        )}
        {resumo && (
          <>
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
              <Stat n={String(resumo.streak)} t="Dias seguidos" bg={C.primaryBg} fg={C.primary} />
              <Stat n={`${resumo.adherence}%`} t="Adesão" bg={C.okBg} fg={C.okDark} />
            </View>
            <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '800', color: C.ink, marginBottom: 12 }}>Remédios de hoje</Text>
            {resumo.meds.length === 0 && <Text style={{ fontSize: 18, color: C.muted, marginBottom: 16 }}>Nenhum remédio para hoje.</Text>}
            {resumo.meds.map((m) => {
              const status = statusAgora(m, true, agora); // o resumo é sempre de hoje
              return (
                <Card key={m.id} style={{ borderColor: bordaDoStatus(status), borderWidth: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <View style={{ backgroundColor: C.line, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 14 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{m.time}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{m.name}</Text>
                      <Text style={{ fontSize: 17, color: C.muted }}>{m.dose}</Text>
                    </View>
                  </View>
                  <StatusBadge med={m} status={status} modo="supervisor" />
                </Card>
              );
            })}
          </>
        )}
        <Btn label="REMOVER" icon="person-remove-outline" variant="soft" a11y={`Parar de acompanhar ${pessoa.name}`}
          onPress={() => setConfirmar(true)} style={{ marginTop: 8 }} />
      </ScrollView>

      {confirmar && (
        <Confirmacao titulo={`Parar de acompanhar ${pessoa.name}?`}
          texto="Você deixará de ver os remédios e o progresso desta pessoa." rotulo="SIM, REMOVER"
          onConfirmar={async () => { await parar(pessoa.vinculoId); onBack(); }}
          onCancelar={() => setConfirmar(false)} />
      )}
    </View>
  );
}
