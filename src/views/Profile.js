import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { Btn, Card, Field, Header } from './components';
import { useVinculoController } from '../controllers/VinculoController';
import { ConectarComCodigo, GerarCodigo, LinhaPessoa } from './Supervisao';
import Confirmacao from './Confirmacao';

const Row = ({ icon, label, value }) => (
  <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
    <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name={icon} size={26} color={C.primary} /></View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 16, color: C.muted }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{value}</Text>
    </View>
  </Card>
);
const Titulo = ({ children }) => (
  <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '800', color: C.ink, marginTop: 8, marginBottom: 12 }}>{children}</Text>
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
      <Header title="Meu Perfil" sub="Seus dados, supervisores e contatos de emergência" />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {incompleto && (
          <Card style={{ borderColor: C.primary, borderWidth: 2, backgroundColor: C.primaryBg, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name="information-circle" size={32} color={C.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>Complete seu perfil</Text>
              <Text style={{ fontSize: 17, color: C.ink }}>Preencha seu nome e sua idade e toque em SALVAR.</Text>
            </View>
          </Card>
        )}

        {/* Supervisores reais do usuário */}
        <Card style={{ borderColor: C.primary, borderWidth: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: C.okDark, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="shield-checkmark" size={26} color="#fff" /></View>
            <Text style={{ flex: 1, fontSize: 20, fontWeight: '800', color: C.ink }}>Supervisor Conectado</Text>
          </View>
          {v.loading && <ActivityIndicator size="large" color={C.primary} accessibilityLabel="Carregando" />}
          {!!v.error && (
            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 17, color: C.redDark }}>{v.error}</Text>
              <Btn label="TENTAR DE NOVO" variant="soft" onPress={v.carregar} />
            </View>
          )}
          {!v.loading && !v.error && supervisors.length === 0 && (
            <Text style={{ fontSize: 18, color: C.muted }}>Nenhum supervisor ainda</Text>
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
            <Text style={{ fontSize: 18, color: C.muted }}>Você ainda não acompanha ninguém.</Text>
          )}
          {dependents.map((p) => (
            <LinhaPessoa key={p.vinculoId} pessoa={p} onAbrir={onOpenDependent}
              onRemover={(pessoa) => setRemover({ pessoa, papel: 'dependente' })} />
          ))}
        </Card>

        <Titulo>Dados Pessoais</Titulo>
        <Field label="Como gosta de ser chamado?" placeholder="Seu nome" value={nome} onChangeText={setNome} maxLength={100} />
        <Field label="Sua idade" placeholder="Ex: 65" keyboardType="number-pad" inputMode="numeric" maxLength={3}
          value={idade} onChangeText={(t) => setIdade(t.replace(/\D/g, ''))} />
        <Row icon="mail" label="E-mail (não pode ser alterado)" value={user.email} />
        <Btn label={salvando ? 'SALVANDO...' : 'SALVAR'} icon="save" onPress={salvar} disabled={salvando} />
        {!!msg.texto && (
          <Text accessibilityLiveRegion="polite" style={{ fontSize: 17, color: msg.ok ? C.okDark : C.redDark, textAlign: 'center', marginTop: 12 }}>{msg.texto}</Text>
        )}

        <Card style={{ borderColor: '#FCA5A5', backgroundColor: '#FFF5F5', marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Ionicons name="warning" size={32} color={C.red} />
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.redDark }}>Botão de Pânico</Text>
          </View>
          <Btn label="LIGAR PARA EMERGÊNCIA" icon="call" variant="danger" onPress={() => Linking.openURL('tel:192')} style={{ minHeight: 64 }} />
          <Text style={{ fontSize: 16, color: C.ink, marginTop: 12, textAlign: 'center' }}>
            {supervisors.length > 0
              ? `Em caso de emergência, ligue 192. Seus supervisores: ${nomesSupervisores}.`
              : 'Conecte um supervisor para ter alguém de confiança acompanhando você.'}</Text>
        </Card>

        <Pressable onPress={onLogout} accessibilityRole="button" style={{ minHeight: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.primary, textDecorationLine: 'underline' }}>Sair da Conta</Text>
        </Pressable>
      </ScrollView>

      {remover && (
        <Confirmacao
          titulo={remover.papel === 'supervisor' ? `Remover ${remover.pessoa.name}?` : `Parar de acompanhar ${remover.pessoa.name}?`}
          texto={remover.papel === 'supervisor'
            ? 'Esta pessoa deixará de ver seus remédios e seu progresso.'
            : 'Você deixará de ver os remédios e o progresso desta pessoa.'}
          rotulo="SIM, REMOVER"
          onConfirmar={async () => { await v.remover(remover.pessoa.vinculoId); setRemover(null); }}
          onCancelar={() => setRemover(null)} />
      )}
    </View>
  );
}
