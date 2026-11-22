import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, T, TOQUE } from '../theme';
import { USE_MOCK } from '../config';
import { Btn, Field, s } from './components';

const EMAIL_OK = /^\S+@\S+\.\S+$/;
const SENHA_OK = /^\d{4,6}$/;

// Duas formas da mesma tela: "entrar" (e-mail + senha) e "cadastrar" (+ aceite da LGPD).
export default function Login({ onEnter, onCreate, loading, error, onClearError }) {
  const [modo, setModo] = useState('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [lgpd, setLgpd] = useState(false);
  const [msg, setMsg] = useState('');
  const cadastro = modo === 'cadastrar';

  const trocarModo = () => {
    setModo(cadastro ? 'entrar' : 'cadastrar');
    setMsg(''); onClearError();
  };
  // Aceita só números e no máximo 6 dígitos.
  const digitarSenha = (v) => setSenha(v.replace(/\D/g, '').slice(0, 6));

  const enviar = () => {
    if (!EMAIL_OK.test(email.trim())) return setMsg('Digite um e-mail válido, por exemplo maria@email.com.');
    if (!SENHA_OK.test(senha)) return setMsg('A senha deve ter de 4 a 6 números.');
    if (cadastro && !lgpd) return setMsg('Marque a autorização de uso de dados para criar a conta.');
    setMsg('');
    const e = email.trim().toLowerCase();
    if (cadastro) onCreate(e, senha); else onEnter(e, senha);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: E.gg }} keyboardShouldPersistTaps="handled">
      <View style={{ alignItems: 'center', marginBottom: E.gg }}>
        <View style={{ width: 72, height: 72, borderRadius: R, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="medkit" size={40} color={C.onPrimary} />
        </View>
        <Text style={{ fontSize: T.grande, fontWeight: T.semibold, color: C.primary, marginTop: E.m }}>MedTime</Text>
        <Text accessibilityRole="header" style={{ fontSize: T.grande, fontWeight: T.semibold, color: C.ink, marginTop: E.p }}>
          {cadastro ? 'Criar sua conta' : 'Seja bem-vindo(a)!'}</Text>
        <Text style={[s.apoio, { fontSize: T.medio, marginTop: E.p, textAlign: 'center' }]}>
          {cadastro ? 'Escolha uma senha só de números' : 'Entre com seu e-mail e sua senha'}</Text>
        {USE_MOCK && <Text style={[s.erro, { marginTop: E.p }]}>Modo demonstração (sem servidor)</Text>}
      </View>

      <Field label="Seu e-mail" placeholder="exemplo@email.com" keyboardType="email-address" autoCapitalize="none"
        autoComplete="email" value={email} onChangeText={setEmail} />
      <Field label={cadastro ? 'Crie uma senha (4 a 6 números)' : 'Sua senha (só números)'} placeholder="Ex: 1234"
        keyboardType="number-pad" inputMode="numeric" maxLength={6} secureTextEntry={!mostrar}
        autoComplete={cadastro ? 'new-password' : 'current-password'} value={senha} onChangeText={digitarSenha} />
      <Btn label={mostrar ? 'Esconder senha' : 'Mostrar senha'} icon={mostrar ? 'eye-off-outline' : 'eye-outline'} variant="soft"
        onPress={() => setMostrar(!mostrar)} style={{ marginTop: -E.p, marginBottom: E.gg }} />

      {cadastro && (
        <Pressable onPress={() => setLgpd(!lgpd)} accessibilityRole="checkbox" accessibilityState={{ checked: lgpd }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: E.m, backgroundColor: C.card, borderWidth: 2, borderColor: lgpd ? C.primary : C.border, borderRadius: R, padding: E.g, marginBottom: E.gg, minHeight: TOQUE }}>
          <View style={{ width: 32, height: 32, borderRadius: E.p, borderWidth: 2, borderColor: C.primary, backgroundColor: lgpd ? C.primary : C.card, alignItems: 'center', justifyContent: 'center' }}>
            {lgpd && <Ionicons name="checkmark" size={I.m} color={C.onPrimary} />}
          </View>
          <Text style={[s.corpo, { flex: 1 }]}>Autorizo o uso de dados para a gestão de meus medicamentos (LGPD)</Text>
        </Pressable>
      )}

      <Btn label={loading ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'} onPress={enviar}
        disabled={loading || (cadastro && !lgpd)} />
      {!!(msg || error) && (
        <Text accessibilityLiveRegion="polite" style={[s.erro, { textAlign: 'center', marginTop: E.m }]}>{msg || error}</Text>
      )}
      {cadastro && !lgpd && <Text style={[s.apoio, { textAlign: 'center', marginTop: E.m }]}>Marque a autorização acima para continuar.</Text>}

      <Pressable onPress={trocarModo} accessibilityRole="button" style={{ minHeight: TOQUE, alignItems: 'center', justifyContent: 'center', marginTop: E.m }}>
        <Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: C.primary, textDecorationLine: 'underline' }}>
          {cadastro ? 'Já tenho conta. Entrar' : 'Criar conta'}</Text>
      </Pressable>
    </ScrollView>
  );
}
