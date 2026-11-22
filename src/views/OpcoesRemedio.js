import React, { useState } from 'react';
import { Modal, View, Text } from 'react-native';
import { C, E, R, SOMBRA, T } from '../theme';
import { Btn, s } from './components';

// Janela de opções de um remédio: Editar / Excluir / Fechar, e a confirmação da exclusão.
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
      <View style={{ flex: 1, backgroundColor: C.overlay, justifyContent: 'center', padding: E.g }}>
        <View accessibilityViewIsModal style={{ width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: C.card, borderRadius: R, padding: E.gg, gap: E.m, ...SOMBRA }}>
          {etapa === 'opcoes' ? (
            <>
              <Text style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.ink }}>{med.name}</Text>
              <Text style={[s.apoio, { fontSize: T.medio, marginBottom: E.p / 2 }]}>{med.time} · {med.dose}</Text>
              <Btn label="Editar" icon="create-outline" onPress={() => onEdit(med)} />
              <Btn label="Excluir" icon="trash-outline" variant="danger" onPress={() => setEtapa('confirmar')} />
              <Btn label="Fechar" variant="soft" onPress={onClose} />
            </>
          ) : (
            <>
              <Text accessibilityRole="header" style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.ink }}>
                Excluir {med.name}?</Text>
              <Text style={[s.corpo, { fontSize: T.medio, marginBottom: E.p / 2 }]}>Ele deixará de aparecer a partir de hoje.</Text>
              {!!erro && <Text accessibilityLiveRegion="polite" style={s.erro}>{erro}</Text>}
              <Btn label={excluindo ? 'Excluindo...' : erro ? 'Tentar de novo' : 'Sim, excluir'} icon="trash"
                variant="danger" onPress={excluir} disabled={excluindo} />
              <Btn label="Cancelar" variant="soft" onPress={() => { setErro(''); setEtapa('opcoes'); }} disabled={excluindo} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
