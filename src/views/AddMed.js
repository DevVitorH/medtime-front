import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, E, I, R, T } from '../theme';
import { BotaoIcone, Btn, Card, Field, Header, s } from './components';
import RelogioPicker from './RelogioPicker';
import DiasSemana, { TODOS_OS_DIAS, resumoDias } from './DiasSemana';

const STEPS = ['Nome', 'Dose', 'Horário', 'Dias'];
// Passos com campo de texto (os outros usam o relógio e os dias).
const CAMPOS = [
  { k: 'name', label: '1. Nome do remédio', ph: 'Ex: Losartana' },
  { k: 'dose', label: '2. Dose', ph: 'Ex: 50mg, 1 comprimido' },
];

// Mesmas regras no cadastro e na edição. Devolve a mensagem de erro ou ''.
const validar = (v) => (!v.name.trim() ? 'Preencha o nome do remédio.'
  : !v.dose.trim() ? 'Preencha a dose.'
    : v.days.length === 0 ? 'Escolha pelo menos um dia.' : '');
const textoResumo = (v) => `${v.name.trim()}, ${v.dose.trim()}, ${v.time}, ${resumoDias(v.days)}`;

const BotaoVoltar = ({ onPress }) => <BotaoIcone icon="arrow-back" label="Voltar" onPress={onPress} />;
const Resumo = ({ texto }) => (
  <Card style={{ marginTop: E.gg, backgroundColor: C.primaryBg, borderColor: C.primaryBg }}>
    <Text style={s.apoio}>Resumo</Text>
    <Text style={{ fontSize: T.titulo, fontWeight: T.semibold, color: C.ink }}>{texto}</Text>
  </Card>
);
const Mensagem = ({ texto }) => (
  !!texto && <Text accessibilityLiveRegion="polite" style={[s.erro, { marginTop: E.m }]}>{texto}</Text>
);

/** Edição: todos os campos numa tela só, já preenchidos. */
export function EditarRemedio({ inicial, onBack, onSave }) {
  const [v, setV] = useState({ name: inicial.name, dose: inicial.dose, time: inicial.time,
    days: inicial.days.length ? inicial.days : TODOS_OS_DIAS });
  const [mudandoHora, setMudandoHora] = useState(false);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const salvar = async () => {
    if (mudandoHora) return setMsg('Toque em "Confirmar horário" antes de salvar.');
    const erro = validar(v);
    if (erro) return setMsg(erro);
    setMsg(''); setSaving(true);
    try { await onSave({ name: v.name.trim(), dose: v.dose.trim(), time: v.time, days: v.days, note: inicial.note }); }
    catch (e) { setMsg(e.message); setSaving(false); } // o botão continua lá para tentar de novo
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Editar remédio" left={<BotaoVoltar onPress={onBack} />} />
      <ScrollView contentContainerStyle={{ padding: E.g }} keyboardShouldPersistTaps="handled">
        <Field label="Nome do remédio" placeholder="Ex: Losartana" value={v.name} onChangeText={(name) => setV({ ...v, name })} />
        <Field label="Dose" placeholder="Ex: 50mg, 1 comprimido" value={v.dose} onChangeText={(dose) => setV({ ...v, dose })} />

        <Text style={s.label}>Horário</Text>
        {mudandoHora ? (
          <RelogioPicker valor={v.time} onConfirmar={(time) => { setV({ ...v, time }); setMudandoHora(false); setMsg(''); }} />
        ) : (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: E.g }}>
            <Text style={{ fontSize: T.numero, fontWeight: T.semibold, color: C.primary }} accessibilityLabel={`Horário ${v.time}`}>{v.time}</Text>
            <Btn label="Mudar horário" icon="time-outline" variant="soft" onPress={() => setMudandoHora(true)} style={{ flex: 1 }} />
          </Card>
        )}

        <Text style={[s.label, { marginTop: E.gg }]}>Dias da semana</Text>
        <DiasSemana valor={v.days} onChange={(days) => { setV({ ...v, days }); setMsg(''); }} />
        <Text style={[s.apoio, { marginTop: E.m }]}>Mudar os dias também muda o histórico dos dias anteriores.</Text>
        {v.days.length > 0 && <Resumo texto={textoResumo(v)} />}

        <Mensagem texto={msg} />
        <View style={{ flexDirection: 'row', gap: E.m, marginTop: E.g }}>
          <Btn label="Cancelar" variant="soft" onPress={onBack} style={{ flex: 1 }} disabled={saving} />
          <Btn label={saving ? 'Salvando...' : 'Salvar alterações'} onPress={salvar} disabled={saving} style={{ flex: 2 }} />
        </View>
      </ScrollView>
    </View>
  );
}

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
    const erro = validar(v);
    if (erro) return setMsg(erro);
    setMsg(''); setSaving(true);
    try { await onSave({ name: v.name.trim(), dose: v.dose.trim(), time: v.time, days: v.days, note: 'Siga a orientação do seu médico' }); }
    catch (e) { setMsg(e.message); setSaving(false); }
  };
  const AI = ({ icon, title, sub }) => (
    <Pressable onPress={() => setMsg('Este recurso de IA será conectado aqui.')} accessibilityRole="button" accessibilityLabel={title}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: E.g }}>
        <View style={{ width: 56, height: 56, borderRadius: R, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={I.g} color={C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.h2}>{title}</Text>
          <Text style={[s.apoio, { marginTop: 2 }]}>{sub}</Text>
        </View>
      </Card>
    </Pressable>
  );
  return (
    <View style={{ flex: 1 }}>
      <Header title="Novo remédio" left={<BotaoVoltar onPress={onBack} />} />
      <ScrollView contentContainerStyle={{ padding: E.g }} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={[s.h2, { marginBottom: E.m }]}>Formas de cadastrar</Text>
        <AI icon="camera-outline" title="Tirar foto da caixa" sub="Nossa IA lê o nome e a dosagem automaticamente" />
        <AI icon="mic-outline" title="Gravar por voz" sub="Fale: 'Tomar 1 comprimido de Paracetamol às 08:00'" />
        <Text accessibilityRole="header" style={[s.h2, { marginTop: E.gg, marginBottom: E.g }]}>Ou preencha manualmente</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: E.gg }}>
          {STEPS.map((l, i) => (
            <React.Fragment key={l}>
              <View style={{ alignItems: 'center', width: 68 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: i <= step ? C.primary : C.card, borderWidth: 2, borderColor: i <= step ? C.primary : C.border }}>
                  {i < step ? <Ionicons name="checkmark" size={I.p} color={C.onPrimary} /> : <Text style={{ fontSize: T.medio, fontWeight: T.semibold, color: i === step ? C.onPrimary : C.muted }}>{i + 1}</Text>}
                </View>
                <Text style={{ fontSize: T.corpo, fontWeight: i === step ? T.semibold : T.regular, color: i === step ? C.primary : C.muted, marginTop: E.p / 2 }}>{l}</Text>
              </View>
              {i < STEPS.length - 1 && <View style={{ flex: 1, height: 2, marginTop: 19, backgroundColor: i < step ? C.primary : C.line }} />}
            </React.Fragment>
          ))}
        </View>

        {campo && (
          <Field label={campo.label} placeholder={campo.ph} value={v[campo.k]} onChangeText={(t) => setV({ ...v, [campo.k]: t })} />
        )}
        {step === 2 && (
          <>
            <Text style={s.label}>3. Horário</Text>
            <RelogioPicker valor={v.time} onConfirmar={confirmarHorario} />
          </>
        )}
        {step === 3 && (
          <>
            <Text style={[s.label, { marginBottom: E.m }]}>4. Em quais dias?</Text>
            <DiasSemana valor={v.days} onChange={(days) => { setV({ ...v, days }); setMsg(''); }} />
            {v.days.length > 0 && <Resumo texto={textoResumo(v)} />}
          </>
        )}

        <Mensagem texto={msg} />
        <View style={{ flexDirection: 'row', gap: E.m, marginTop: E.g }}>
          {step > 0 && <Btn label="Voltar" variant="soft" onPress={voltar} style={{ flex: 1 }} />}
          {step < 2 && <Btn label="Próximo" onPress={proximo} style={{ flex: 2 }} />}
          {step === 3 && <Btn label={saving ? 'Salvando...' : 'Salvar remédio'} onPress={salvar} disabled={saving} style={{ flex: 2 }} />}
        </View>
      </ScrollView>
    </View>
  );
}
