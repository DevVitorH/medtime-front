import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, T, TOQUE } from '../theme';
import { Btn, Card, Field, Header, s } from './components';
import { useVinculoController } from '../controllers/VinculoController';
import { ConectarComCodigo, GerarCodigo, LinhaPessoa } from './Supervisao';
import Confirmacao from './Confirmacao';

const Row = ({ icon, label, value }) => (
  <Card style={{ flexDirection: 'row', alignItems: 'center', gap: E.g }}>
    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={I.m} color={C.primary} /></View>
    <View style={{ flex: 1 }}>
      <Text style={s.apoio}>{label}</Text>
      <Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: C.ink }}>{value}</Text>
    </View>
  </Card>
);
const Titulo = ({ children }) => (
  <Text accessibilityRole="header" style={[s.h2, { marginTop: E.gg, marginBottom: E.m }]}>{children}</Text>
);

export default function Profile({ user, onSave, onLogout, onOpenDependent }) {
  const v = useVinculoController();
  const { supervisors, dependents } = v.vinculos;
  const [remover, setRemover] = useState(null); // { pessoa, papel: 'supervisor' | 'dependente' }
  const [nome, setNome] = useState(user.name);
  const [idade, setIdade] = useState(user.age);
  const [msg, setMsg] = useState({ texto: '', ok: false });
  const [salvando, setSalvando] = useState(false);
  const incompleto = !user.name || !user.age;
  const nomesSupervisores = supervisors.map((p) => p.name).join(', ');

  const salvar = async () => {
    const n = Number(idade);
    if (!nome.trim()) return setMsg({ texto: 'Informe seu nome.', ok: false });
    if (!Number.isInteger(n) || n < 1 || n > 120) return setMsg({ texto: 'A idade deve ser de 1 a 120.', ok: false });
    setSalvando(true); setMsg({ texto: '', ok: false });
    try { await onSave(nome.trim(), n); setMsg({ texto: 'Dados salvos.', ok: true }); }
    catch (e) { setMsg({ texto: e.message, ok: false }); }
    finally { setSalvando(false); }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Meu perfil" sub="Seus dados, supervisores e contatos de emergência" />
      <ScrollView contentContainerStyle={{ padding: E.g }} keyboardShouldPersistTaps="handled">
        {incompleto && (
          <Card style={{ borderColor: C.primary, borderWidth: 2, backgroundColor: C.primaryBg, flexDirection: 'row', alignItems: 'center', gap: E.m }}>
            <Ionicons name="information-circle-outline" size={I.g} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.h2}>Complete seu perfil</Text>
              <Text style={s.corpo}>Preencha seu nome e sua idade e toque em Salvar.</Text>
            </View>
          </Card>
        )}

        {/* Supervisores reais do usuário */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: E.m, marginBottom: E.p }}>
            <Ionicons name="shield-checkmark-outline" size={I.g} color={C.okDark} />
            <Text accessibilityRole="header" style={[s.h2, { flex: 1 }]}>Supervisor conectado</Text>
          </View>
          {v.loading && <ActivityIndicator size="large" color={C.primary} accessibilityLabel="Carregando" />}
          {!!v.error && (
            <View style={{ gap: E.m }}>
              <Text style={s.erro}>{v.error}</Text>
              <Btn label="Tentar de novo" variant="soft" onPress={v.carregar} />
            </View>
          )}
          {!v.loading && !v.error && supervisors.length === 0 && (
            <Text style={[s.apoio, { fontSize: T.medio }]}>Nenhum supervisor ainda</Text>
          )}
          {supervisors.map((p) => (
            <LinhaPessoa key={p.vinculoId} pessoa={p} onRemover={(pessoa) => setRemover({ pessoa, papel: 'supervisor' })} />
          ))}
        </Card>

        <Titulo>Supervisão</Titulo>
        <GerarCodigo onGerar={v.gerarCodigo} />
        <ConectarComCodigo onConectar={v.conectar} />

        <Titulo>Pessoas que eu acompanho</Titulo>
        <Card>
          {!v.loading && !v.error && dependents.length === 0 && (
            <Text style={[s.apoio, { fontSize: T.medio }]}>Você ainda não acompanha ninguém.</Text>
          )}
          {dependents.map((p) => (
            <LinhaPessoa key={p.vinculoId} pessoa={p} onAbrir={onOpenDependent}
              onRemover={(pessoa) => setRemover({ pessoa, papel: 'dependente' })} />
          ))}
        </Card>

        <Titulo>Dados pessoais</Titulo>
        <Field label="Como gosta de ser chamado?" placeholder="Seu nome" value={nome} onChangeText={setNome} maxLength={100} />
        <Field label="Sua idade" placeholder="Ex: 65" keyboardType="number-pad" inputMode="numeric" maxLength={3}
          value={idade} onChangeText={(t) => setIdade(t.replace(/\D/g, ''))} />
        <Row icon="mail-outline" label="E-mail (não pode ser alterado)" value={user.email} />
        <Btn label={salvando ? 'Salvando...' : 'Salvar'} icon="save-outline" onPress={salvar} disabled={salvando} />
        {!!msg.texto && (
          <Text accessibilityLiveRegion="polite" style={[msg.ok ? s.sucesso : s.erro, { textAlign: 'center', marginTop: E.m }]}>{msg.texto}</Text>
        )}

        <Card style={{ borderColor: C.red, backgroundColor: C.redBg, marginTop: E.gg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: E.p, marginBottom: E.m }}>
            <Ionicons name="warning-outline" size={I.g} color={C.redDark} />
            <Text accessibilityRole="header" style={[s.h2, { color: C.redDark }]}>Botão de pânico</Text>
          </View>
          <Btn label="Ligar para emergência" icon="call" variant="danger" onPress={() => Linking.openURL('tel:192')} />
          <Text style={[s.corpo, { marginTop: E.m, textAlign: 'center' }]}>
            {supervisors.length > 0
              ? `Em caso de emergência, ligue 192. Seus supervisores: ${nomesSupervisores}.`
              : 'Conecte um supervisor para ter alguém de confiança acompanhando você.'}</Text>
        </Card>

        <Pressable onPress={onLogout} accessibilityRole="button" style={{ minHeight: TOQUE, alignItems: 'center', justifyContent: 'center', marginTop: E.p }}>
          <Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: C.primary, textDecorationLine: 'underline' }}>Sair da conta</Text>
        </Pressable>
      </ScrollView>

      {remover && (
        <Confirmacao
          titulo={remover.papel === 'supervisor' ? `Remover ${remover.pessoa.name}?` : `Parar de acompanhar ${remover.pessoa.name}?`}
          texto={remover.papel === 'supervisor'
            ? 'Esta pessoa deixará de ver seus remédios e seu progresso.'
            : 'Você deixará de ver os remédios e o progresso desta pessoa.'}
          rotulo="Sim, remover"
          onConfirmar={async () => { await v.remover(remover.pessoa.vinculoId); setRemover(null); }}
          onCancelar={() => setRemover(null)} />
      )}
    </View>
  );
}
