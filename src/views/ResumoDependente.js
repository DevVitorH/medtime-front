import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { C, E, R, T } from '../theme';
import { BotaoIcone, Btn, Card, Header, s } from './components';
import { useResumoController } from '../controllers/ResumoController';
import Confirmacao from './Confirmacao';
import StatusBadge, { bordaDoStatus } from './StatusBadge';
import { Stat } from './History';
import { statusAgora } from '../models';
import { useMinuto } from '../controllers/useMinuto';

/** Tela do supervisor: resumo de hoje de quem ele acompanha. Somente leitura (sem "Já tomei"). */
export default function ResumoDependente({ pessoa, onBack }) {
  const { resumo, loading, error, carregar, parar } = useResumoController(pessoa.id);
  const [confirmar, setConfirmar] = useState(false);
  const agora = useMinuto(); // reavalia Pendente -> Atrasado a cada minuto

  return (
    <View style={{ flex: 1 }}>
      <Header title={pessoa.name} sub="Acompanhamento (somente leitura)"
        left={<BotaoIcone icon="arrow-back" label="Voltar" onPress={onBack} />} />
      <ScrollView contentContainerStyle={{ padding: E.g }}>
        {loading && <ActivityIndicator size="large" color={C.primary} style={{ marginVertical: E.g }} accessibilityLabel="Carregando" />}
        {!!error && (
          <View style={{ padding: E.g, borderRadius: R, backgroundColor: C.redBg, marginBottom: E.g, gap: E.m }}>
            <Text style={s.erro}>{error}</Text>
            <Btn label="Tentar de novo" variant="soft" onPress={carregar} />
          </View>
        )}
        {resumo && (
          <>
            <View style={{ flexDirection: 'row', gap: E.m, marginBottom: E.gg }}>
              <Stat n={String(resumo.streak)} t="Dias seguidos" fg={C.primary} />
              <Stat n={`${resumo.adherence}%`} t="Adesão" fg={C.okDark} />
            </View>
            <Text accessibilityRole="header" style={[s.h2, { marginBottom: E.m }]}>Remédios de hoje</Text>
            {resumo.meds.length === 0 && <Text style={[s.apoio, { fontSize: T.medio, marginBottom: E.g }]}>Nenhum remédio para hoje.</Text>}
            {resumo.meds.map((m) => {
              const status = statusAgora(m, true, agora); // o resumo é sempre de hoje
              const borda = status === 'PENDENTE' ? null : { borderColor: bordaDoStatus(status), borderWidth: 2 };
              return (
                <Card key={m.id} style={borda}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: E.m, marginBottom: E.m }}>
                    <View style={{ backgroundColor: C.primaryBg, borderRadius: R, paddingHorizontal: E.m, paddingVertical: E.m }}>
                      <Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: C.primary }}>{m.time}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.ink }}>{m.name}</Text>
                      <Text style={s.apoio}>{m.dose}</Text>
                    </View>
                  </View>
                  <StatusBadge med={m} status={status} modo="supervisor" />
                </Card>
              );
            })}
          </>
        )}
        <Btn label="Remover" icon="person-remove-outline" variant="soft" a11y={`Parar de acompanhar ${pessoa.name}`}
          onPress={() => setConfirmar(true)} style={{ marginTop: E.p }} />
      </ScrollView>

      {confirmar && (
        <Confirmacao titulo={`Parar de acompanhar ${pessoa.name}?`}
          texto="Você deixará de ver os remédios e o progresso desta pessoa." rotulo="Sim, remover"
          onConfirmar={async () => { await parar(pessoa.vinculoId); onBack(); }}
          onCancelar={() => setConfirmar(false)} />
      )}
    </View>
  );
}
