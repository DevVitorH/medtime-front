import React, { useState } from 'react';
import { Modal, View, Text } from 'react-native';
import { C } from '../theme';
import { Btn } from './components';

// Janela de opções de um remédio: EDITAR / EXCLUIR / FECHAR, e a confirmação da exclusão.
// Usa Modal (funciona na Web e no Expo Go); Alert.alert não funciona na Web.
export default function OpcoesRemedio({ med, onClose, onEdit, onDelete }) {
  const [etapa, setEtapa] = useState('opcoes'); // 'opcoes' ou 'confirmar'
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  const excluir = async () => {
    setExcluindo(true); setErro('');
    try { await onDelete(med.id); onClose(); }
    catch (e) { setErro(e.message); setExcluindo(false); }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: 20 }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 12 }}>
          {etapa === 'opcoes' ? (
            <>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink }}>{med.name}</Text>
              <Text style={{ fontSize: 18, color: C.muted, marginBottom: 4 }}>{med.time} · {med.dose}</Text>
              <Btn label="EDITAR" icon="create-outline" onPress={() => onEdit(med)} />
              <Btn label="EXCLUIR" icon="trash-outline" variant="danger" onPress={() => setEtapa('confirmar')} />
              <Btn label="FECHAR" variant="soft" onPress={onClose} />
            </>
          ) : (
            <>
              <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '800', color: C.ink }}>
                Excluir {med.name}?</Text>
              <Text style={{ fontSize: 18, color: C.ink, marginBottom: 4 }}>Ele deixará de aparecer a partir de hoje.</Text>
              {!!erro && <Text accessibilityLiveRegion="polite" style={{ fontSize: 17, color: C.redDark }}>{erro}</Text>}
              <Btn label={excluindo ? 'EXCLUINDO...' : erro ? 'TENTAR DE NOVO' : 'SIM, EXCLUIR'} icon="trash"
                variant="danger" onPress={excluir} disabled={excluindo} />
              <Btn label="CANCELAR" variant="soft" onPress={() => { setErro(''); setEtapa('opcoes'); }} disabled={excluindo} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
