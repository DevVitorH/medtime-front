import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { Btn, Card, Field, Header } from './components';

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

export default function Profile({ user, onSave, onLogout }) {
  const sup = user.supervisor;
  const [nome, setNome] = useState(user.name);
  const [idade, setIdade] = useState(user.age);
  const [msg, setMsg] = useState({ texto: '', ok: false });
  const [salvando, setSalvando] = useState(false);
  const incompleto = !user.name || !user.age;

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
      <Header title="Meu Perfil" sub="Gerencie seus dados e contatos de emergência" />
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

        <Card style={{ borderColor: C.primary, borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.okDark, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="link" size={28} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>Supervisor Conectado</Text>
            <Text style={{ fontSize: 18, color: C.muted }}>{sup ? `${sup.nome} (${sup.parentesco})` : 'Nenhum supervisor ainda'}</Text>
          </View>
          <View style={{ backgroundColor: C.okBg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.okDark }}>{sup && sup.online ? 'ONLINE' : 'OFFLINE'}</Text></View>
        </Card>

        <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, marginVertical: 12 }}>Dados Pessoais</Text>
        <Field label="Como gosta de ser chamado?" placeholder="Seu nome" value={nome} onChangeText={setNome} maxLength={100} />
        <Field label="Sua idade" placeholder="Ex: 65" keyboardType="number-pad" inputMode="numeric" maxLength={3}
          value={idade} onChangeText={(v) => setIdade(v.replace(/\D/g, ''))} />
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
          <Text style={{ fontSize: 16, color: C.muted, marginTop: 12, textAlign: 'center' }}>
            {`Sua localização será enviada automaticamente para ${sup ? sup.nome : 'seu supervisor'}.`}</Text>
        </Card>

        <Pressable onPress={onLogout} accessibilityRole="button" style={{ minHeight: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.primary, textDecorationLine: 'underline' }}>Sair da Conta</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
