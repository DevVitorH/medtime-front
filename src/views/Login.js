import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { USE_MOCK } from '../config';
import { Btn, Field } from './components';

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
    <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
      <View style={{ alignItems: 'center', marginBottom: 28 }}>
        <View style={{ width: 96, height: 96, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="medkit" size={56} color="#fff" />
        </View>
        <Text style={{ fontSize: 36, fontWeight: '800', color: C.primary, marginTop: 12 }}>ViverBem</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.ink, marginTop: 4 }}>
          {cadastro ? 'Criar sua conta' : 'Seja bem-vindo(a)!'}</Text>
        <Text style={{ fontSize: 18, color: C.muted, marginTop: 4, textAlign: 'center' }}>
          {cadastro ? 'Escolha uma senha só de números' : 'Entre com seu e-mail e sua senha'}</Text>
        {USE_MOCK && <Text style={{ fontSize: 16, color: C.redDark, marginTop: 6 }}>Modo demonstração (sem servidor)</Text>}
      </View>

      <Field label="Seu e-mail" placeholder="exemplo@email.com" keyboardType="email-address" autoCapitalize="none"
        autoComplete="email" value={email} onChangeText={setEmail} />
      <Field label={cadastro ? 'Crie uma senha (4 a 6 números)' : 'Sua senha (só números)'} placeholder="Ex: 1234"
        keyboardType="number-pad" inputMode="numeric" maxLength={6} secureTextEntry={!mostrar}
        autoComplete={cadastro ? 'new-password' : 'current-password'} value={senha} onChangeText={digitarSenha} />
      <Btn label={mostrar ? 'ESCONDER SENHA' : 'MOSTRAR SENHA'} icon={mostrar ? 'eye-off' : 'eye'} variant="soft"
        onPress={() => setMostrar(!mostrar)} style={{ marginTop: -8, marginBottom: 24 }} />

      {cadastro && (
        <Pressable onPress={() => setLgpd(!lgpd)} accessibilityRole="checkbox" accessibilityState={{ checked: lgpd }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: lgpd ? C.primary : C.border, borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <View style={{ width: 32, height: 32, borderRadius: 8, borderWidth: 2.5, borderColor: C.primary, backgroundColor: lgpd ? C.primary : '#fff', alignItems: 'center', justifyContent: 'center' }}>
            {lgpd && <Ionicons name="checkmark" size={24} color="#fff" />}
          </View>
          <Text style={{ flex: 1, fontSize: 17, color: C.ink, lineHeight: 24 }}>Autorizo o uso de dados para a gestão de meus medicamentos (LGPD)</Text>
        </Pressable>
      )}

      <Btn label={loading ? 'AGUARDE...' : cadastro ? 'CRIAR CONTA' : 'ENTRAR'} onPress={enviar}
        disabled={loading || (cadastro && !lgpd)} />
      {!!(msg || error) && (
        <Text accessibilityLiveRegion="polite" style={{ fontSize: 17, color: C.redDark, textAlign: 'center', marginTop: 12 }}>{msg || error}</Text>
      )}
      {cadastro && !lgpd && <Text style={{ fontSize: 16, color: C.muted, textAlign: 'center', marginTop: 12 }}>Marque a autorização acima para continuar.</Text>}

      <Pressable onPress={trocarModo} accessibilityRole="button" style={{ minHeight: 56, alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: C.primary, textDecorationLine: 'underline' }}>
          {cadastro ? 'Já tenho conta. Entrar' : 'Criar conta'}</Text>
      </Pressable>
    </ScrollView>
  );
}
