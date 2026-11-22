import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { C, E, I, R, SOMBRA, T, TOQUE } from '../theme';
import { BotaoIcone, Btn, Header, Marca, s } from './components';

const SUGESTOES = ['Posso tomar com água?', 'Antes ou depois de comer?'];
const ouvir = (texto) => { Speech.stop(); Speech.speak(texto, { language: 'pt-BR' }); };

// Bolha do assistente: à esquerda, branca com borda neutra e a marca como avatar.
const BolhaAssistente = ({ children }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: E.p, marginBottom: E.m, maxWidth: '85%' }}>
    <Marca tamanho={32} />
    <View style={{ flexShrink: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R, padding: E.m, ...SOMBRA }}>
      {children}
    </View>
  </View>
);

const Mensagem = ({ m }) => {
  if (m.from === 'usuario') {
    return (
      <View style={{ alignSelf: 'flex-end', maxWidth: '85%', backgroundColor: C.primary, borderRadius: R, padding: E.m, marginBottom: E.m }}
        accessible accessibilityLabel={`Você perguntou: ${m.text}`}>
        <Text style={{ fontSize: T.medio, lineHeight: 26, color: C.onPrimary }}>{m.text}</Text>
        <Text style={{ fontSize: T.corpo, color: C.primaryBg, alignSelf: 'flex-end', marginTop: E.p / 2 }}>{m.time}</Text>
      </View>
    );
  }
  return (
    <BolhaAssistente>
      <Text style={{ fontSize: T.medio, lineHeight: 26, color: C.ink }}>{m.text}</Text>
      {!m.welcome && (
        // O aviso nunca some: discreto, mas legível.
        <Text style={{ fontSize: T.corpo, color: C.muted, marginTop: E.p, borderTopWidth: 1, borderTopColor: C.line, paddingTop: E.p }}>
          {m.notice}</Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: E.p / 2 }}>
        <Pressable onPress={() => ouvir(m.text)} accessibilityRole="button" accessibilityLabel="Ouvir esta resposta"
          style={({ pressed }) => ({ minHeight: TOQUE, flexDirection: 'row', alignItems: 'center', gap: E.p, paddingHorizontal: E.p, marginLeft: -E.p, borderRadius: R, backgroundColor: pressed ? C.primaryBg : 'transparent' })}>
          <Ionicons name="volume-high-outline" size={I.m} color={C.primary} />
          <Text style={{ fontSize: T.corpo, fontWeight: T.semibold, color: C.primary }}>Ouvir</Text>
        </Pressable>
        <Text style={{ fontSize: T.corpo, color: C.hint }}>{m.time}</Text>
      </View>
    </BolhaAssistente>
  );
};

/** Chat com o assistente. A conversa vem do controller (fica guardada ao trocar de aba). */
export default function Assistant({ conversa }) {
  const { mensagens, loading, error, enviar, tentarDeNovo } = conversa;
  const [q, setQ] = useState('');
  const [avisoVoz, setAvisoVoz] = useState(false);
  const lista = useRef(null);

  const mandar = (texto) => { if (!texto.trim() || loading) return; enviar(texto); setQ(''); setAvisoVoz(false); };
  const rodape = (
    <>
      {loading && (
        <BolhaAssistente>
          <Text accessibilityLiveRegion="polite" style={[s.apoio, { fontSize: T.medio }]}>Digitando...</Text>
        </BolhaAssistente>
      )}
      {!loading && !!error && (
        <BolhaAssistente>
          <View style={{ flexDirection: 'row', gap: E.p, alignItems: 'flex-start' }}>
            <Ionicons name="alert-circle-outline" size={I.m} color={C.redDark} />
            <Text accessibilityLiveRegion="polite" style={[s.erro, { flex: 1, fontSize: T.medio }]}>{error}</Text>
          </View>
          <Btn label="Tentar de novo" icon="refresh" variant="soft" onPress={tentarDeNovo} style={{ marginTop: E.m }} />
        </BolhaAssistente>
      )}
    </>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Assistente MedTime" sub="Tire dúvidas sobre seus remédios" left={<Marca />} />
      <FlatList ref={lista} data={mensagens} keyExtractor={(m) => String(m.id)} renderItem={({ item }) => <Mensagem m={item} />}
        contentContainerStyle={{ padding: E.g }} ListFooterComponent={rodape} keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })} />

      <View style={{ backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.line, padding: E.m, gap: E.m }}>
        {/* Sugestões: quebram em várias linhas em vez de cortar o texto. */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: E.p }}>
          {SUGESTOES.map((t) => (
            <Pressable key={t} onPress={() => mandar(t)} disabled={loading} accessibilityRole="button" accessibilityLabel={`Perguntar: ${t}`}
              style={({ pressed }) => ({ minHeight: TOQUE, justifyContent: 'center', paddingHorizontal: E.m, borderRadius: R, borderWidth: 1, borderColor: C.primary, backgroundColor: pressed ? C.primaryBg : C.card, opacity: loading ? 0.5 : 1 })}>
              <Text style={{ fontSize: T.corpo, fontWeight: T.semibold, color: C.primary }}>{t}</Text>
            </Pressable>
          ))}
        </View>
        {avisoVoz && (
          <Text accessibilityLiveRegion="polite" style={s.apoio}>Entrada por voz em breve. Por enquanto, digite sua dúvida.</Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: E.p }}>
          <TextInput value={q} onChangeText={setQ} placeholder="Digite sua dúvida" placeholderTextColor={C.hint}
            accessibilityLabel="Sua dúvida" maxLength={500} multiline onSubmitEditing={() => mandar(q)} submitBehavior="blurAndSubmit"
            style={[s.input, { flex: 1, paddingVertical: E.m }]} />
          <BotaoIcone icon="mic-outline" label="Falar (em breve)" cor={C.primary} onPress={() => setAvisoVoz(true)} />
          <BotaoIcone icon="send" label="Enviar pergunta" cor={C.onPrimary} fundo={C.primary}
            onPress={() => mandar(q)} disabled={loading || !q.trim()} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
