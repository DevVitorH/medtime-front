import React, { useState } from 'react';
import { Modal, View, Text } from 'react-native';
import { C, E, R, SOMBRA, T } from '../theme';
import { Btn, s } from './components';

/**
 * Janela simples de confirmação (Alert.alert não funciona na Web).
 * onConfirmar é async: se lançar erro, a mensagem aparece aqui com "Tentar de novo".
 */
export default function Confirmacao({ titulo, texto, rotulo, onConfirmar, onCancelar }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const confirmar = async () => {
    setEnviando(true); setErro('');
    try { await onConfirmar(); }
    catch (e) { setErro(e.message); setEnviando(false); }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={{ flex: 1, backgroundColor: C.overlay, justifyContent: 'center', padding: E.g }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: C.card, borderRadius: R, padding: E.gg, gap: E.m, ...SOMBRA }}>
          <Text accessibilityRole="header" style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.ink }}>{titulo}</Text>
          <Text style={[s.corpo, { fontSize: T.medio, marginBottom: E.p / 2 }]}>{texto}</Text>
          {!!erro && <Text accessibilityLiveRegion="polite" style={s.erro}>{erro}</Text>}
          <Btn label={enviando ? 'Aguarde...' : erro ? 'Tentar de novo' : rotulo} variant="danger" onPress={confirmar} disabled={enviando} />
          <Btn label="Cancelar" variant="soft" onPress={onCancelar} disabled={enviando} />
        </View>
      </View>
    </Modal>
  );
}
