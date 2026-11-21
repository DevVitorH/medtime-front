import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { Btn, Card, Field, Header } from './components';
import RelogioPicker from './RelogioPicker';
import DiasSemana, { TODOS_OS_DIAS, resumoDias } from './DiasSemana';

const STEPS = ['Nome', 'Dose', 'Horário', 'Dias'];
// Passos com campo de texto (os outros usam o relógio e os dias).
const CAMPOS = [
  { k: 'name', label: '1. Nome do Remédio', ph: 'Ex: Losartana' },
  { k: 'dose', label: '2. Dose', ph: 'Ex: 50mg, 1 comprimido' },
];

export default function AddMed({ onBack, onSave }) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState({ name: '', dose: '', time: '08:00', days: TODOS_OS_DIAS });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const campo = CAMPOS[step];

  const voltar = () => { setMsg(''); setStep(step - 1); };
  const proximo = () => {
    if (!v[campo.k].trim()) return setMsg('Preencha este campo para continuar.');
    setMsg(''); setStep(step + 1);
  };
  const confirmarHorario = (time) => { setV({ ...v, time }); setMsg(''); setStep(3); };
  const salvar = async () => {
    if (v.days.length === 0) return setMsg('Escolha pelo menos um dia.');
    setMsg(''); setSaving(true);
    try { await onSave({ name: v.name.trim(), dose: v.dose.trim(), time: v.time, days: v.days, note: 'Siga a orientação do seu médico' }); }
    catch (e) { setMsg(e.message); setSaving(false); }
  };
  const resumo = `${v.name.trim()}, ${v.dose.trim()}, ${v.time}, ${resumoDias(v.days)}`;
  const AI = ({ icon, title, sub }) => (
    <Pressable onPress={() => setMsg('Este recurso de IA será conectado aqui.')} accessibilityRole="button" accessibilityLabel={title}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16, borderColor: C.primary }}>
        <View style={{ width: 64, height: 64, borderRadius: 16, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={32} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{title}</Text>
          <Text style={{ fontSize: 16, color: C.muted, marginTop: 2 }}>{sub}</Text>
        </View>
      </Card>
    </Pressable>
  );
  return (
    <View style={{ flex: 1 }}>
      <Header title="Novo Remédio" left={
        <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Voltar" style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-back" size={30} color={C.ink} />
        </Pressable>} />
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, textAlign: 'center', marginBottom: 16 }}>Formas de cadastrar:</Text>
        <AI icon="camera" title="Tirar foto da caixa" sub="Nossa IA lê o nome e a dosagem automaticamente" />
        <AI icon="mic" title="Gravar por voz" sub="Fale: 'Tomar 1 comprimido de Paracetamol às 08:00'" />
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.ink, textAlign: 'center', marginVertical: 16 }}>Ou preencha manualmente</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 }}>
          {STEPS.map((l, i) => (
            <React.Fragment key={l}>
              <View style={{ alignItems: 'center', width: 68 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: i <= step ? C.primary : '#fff', borderWidth: 2, borderColor: i <= step ? C.primary : C.border }}>
                  {i < step ? <Ionicons name="checkmark" size={24} color="#fff" /> : <Text style={{ fontSize: 20, fontWeight: '800', color: i === step ? '#fff' : C.muted }}>{i + 1}</Text>}
                </View>
                <Text style={{ fontSize: 16, fontWeight: i === step ? '800' : '600', color: i === step ? C.primary : C.muted, marginTop: 4 }}>{l}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={{ flex: 1, height: 3, marginTop: 20, backgroundColor: i < step ? C.primary : C.line }} />}
            </React.Fragment>
          ))}
        </View>

        {campo && (
          <Field label={campo.label} placeholder={campo.ph} value={v[campo.k]} onChangeText={(t) => setV({ ...v, [campo.k]: t })} />
        )}
        {step === 2 && (
          <>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 8 }}>3. Horário</Text>
            <RelogioPicker valor={v.time} onConfirmar={confirmarHorario} />
          </>
        )}
        {step === 3 && (
          <>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.ink, marginBottom: 12 }}>4. Em quais dias?</Text>
            <DiasSemana valor={v.days} onChange={(days) => { setV({ ...v, days }); setMsg(''); }} />
            {v.days.length > 0 && (
              <Card style={{ marginTop: 20, borderColor: C.primary, borderWidth: 2, backgroundColor: C.primaryBg }}>
                <Text style={{ fontSize: 16, color: C.muted }}>Resumo</Text>
                <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>{resumo}</Text>
              </Card>
            )}
          </>
        )}

        {!!msg && <Text accessibilityLiveRegion="polite" style={{ fontSize: 17, color: C.redDark, marginVertical: 12 }}>{msg}</Text>}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          {step > 0 && <Btn label="VOLTAR" variant="soft" onPress={voltar} style={{ flex: 1 }} />}
          {step < 2 && <Btn label="PRÓXIMO" onPress={proximo} style={{ flex: 2 }} />}
          {step === 3 && <Btn label={saving ? 'SALVANDO...' : 'SALVAR REMÉDIO'} onPress={salvar} disabled={saving} style={{ flex: 2 }} />}
        </View>
      </ScrollView>
    </View>
  );
}
