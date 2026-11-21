import React, { useState } from 'react';
import { Modal, View, Text } from 'react-native';
import { C } from '../theme';
import { Btn } from './components';

/**
 * Janela simples de confirmação (Alert.alert não funciona na Web).
 * onConfirmar é async: se lançar erro, a mensagem aparece aqui com TENTAR DE NOVO.
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
      <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: 20 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 12 }}>
          <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '800', color: C.ink }}>{titulo}</Text>
          <Text style={{ fontSize: 18, color: C.ink, marginBottom: 4 }}>{texto}</Text>
          {!!erro && <Text accessibilityLiveRegion="polite" style={{ fontSize: 17, color: C.redDark }}>{erro}</Text>}
          <Btn label={enviando ? 'AGUARDE...' : erro ? 'TENTAR DE NOVO' : rotulo} variant="danger" onPress={confirmar} disabled={enviando} />
          <Btn label="CANCELAR" variant="soft" onPress={onCancelar} disabled={enviando} />
        </View>
      </View>
    </Modal>
  );
}
