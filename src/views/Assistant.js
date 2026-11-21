import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { C } from '../theme';
import { Btn, Header } from './components';
import { useAssistantController } from '../controllers/AssistantController';

const HELLO = 'Olá! Sou seu assistente. Pode me perguntar sobre seus remédios, horários ou dicas de saúde.';

export default function Assistant() {
  const [listening, setListening] = useState(false);
  const [q, setQ] = useState('');
  const { answer, loading, error, ask } = useAssistantController();
  const [playing, setPlaying] = useState(false);
  const play = () => {
    if (!answer) return;
    if (playing) { Speech.stop(); return setPlaying(false); }
    setPlaying(true);
    Speech.speak(answer, { language: 'pt-BR', onDone: () => setPlaying(false), onStopped: () => setPlaying(false) });
  };
  const Chip = ({ icon, t }) => (
    <Pressable onPress={() => { setQ(t); ask(t); }} accessibilityRole="button" accessibilityLabel={t}
      style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 2, borderColor: C.primary, borderRadius: 28, paddingHorizontal: 18, backgroundColor: '#fff', marginRight: 12 }}>
      <Ionicons name={icon} size={22} color={C.primary} /><Text style={{ fontSize: 17, fontWeight: '700', color: C.ink }}>{t}</Text>
    </Pressable>
  );
  return (
    <View style={{ flex: 1 }}>
      <Header title="Assistente ViverBem" left={
        <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="robot" size={32} color="#fff" /></View>}
        sub="● Sempre disponível para ajudar" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: C.line, padding: 18 }}>
          <Text style={{ fontSize: 20, lineHeight: 30, color: C.ink }}>{HELLO}</Text>
          <Pressable onPress={() => Speech.speak(HELLO, { language: 'pt-BR' })} accessibilityRole="button" accessibilityLabel="Ouvir mensagem"
            style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
            <Ionicons name="volume-high" size={24} color={C.primary} /><Text style={{ fontSize: 16, fontWeight: '700', color: C.primary }}>Ouvir</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
          <Chip icon="water" t="Posso tomar com água?" /><Chip icon="restaurant" t="Antes ou depois de comer?" />
        </ScrollView>
        <TextInput value={q} onChangeText={setQ} placeholder="Digite sua dúvida aqui" placeholderTextColor={C.hint} accessibilityLabel="Sua dúvida"
          style={{ minHeight: 56, borderWidth: 2, borderColor: C.border, borderRadius: 14, backgroundColor: '#fff', paddingHorizontal: 16, fontSize: 18, color: C.ink, marginBottom: 12 }} />
        <Btn label={loading ? 'PENSANDO...' : 'PERGUNTAR'} icon="send" onPress={() => ask(q)} disabled={loading || !q.trim()} />
        {!!error && <Text style={{ fontSize: 17, color: C.redDark, marginTop: 12 }}>{error}</Text>}
        {!!answer && (
          <View style={{ backgroundColor: C.primaryBg, borderRadius: 20, padding: 18, marginTop: 12 }}>
            <Text style={{ fontSize: 20, lineHeight: 30, color: C.ink }}>{answer}</Text>
          </View>
        )}
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.ink, textAlign: 'center', marginBottom: 20 }}>
            {listening ? 'Estou ouvindo você...' : 'Aperte o microfone e fale sua dúvida'}</Text>
          <Pressable onPress={() => setListening(!listening)} accessibilityRole="button" accessibilityLabel="Falar"
            style={{ width: 180, height: 180, borderRadius: 90, backgroundColor: listening ? C.primaryBg : '#EAF1FF', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: listening ? C.red : C.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={listening ? 'stop' : 'mic'} size={56} color="#fff" />
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{listening ? 'PARAR' : 'FALAR'}</Text>
            </View>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: C.line, padding: 14 }}>
          <Pressable onPress={play} accessibilityRole="button" accessibilityLabel={playing ? 'Pausar resposta' : 'Ouvir resposta'}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={playing ? 'pause' : 'play'} size={28} color="#fff" />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.ink }}>Resposta do Assistente</Text>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: C.line, marginTop: 8 }}>
              <View style={{ width: playing ? '60%' : '0%', height: 8, borderRadius: 4, backgroundColor: C.primary }} /></View>
          </View>
          <Text style={{ fontSize: 17, color: C.muted }}>0:12</Text>
        </View>
      </ScrollView>
    </View>
  );
}
