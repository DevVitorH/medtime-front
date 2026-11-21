import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C } from '../theme';
import { Btn } from './components';

// Relógio feito só com View/Pressable/Text: funciona na Web e no Expo Go.
const TAM = 290;   // diâmetro do mostrador
const BOTAO = 52;  // área de toque de cada número (mínimo 48)
const RAIO = TAM / 2 - BOTAO / 2 - 6;
const HORAS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTOS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const pad = (n) => String(n).padStart(2, '0');

// Posição do item i (0 a 11) no círculo: o 1º no topo, seguindo no sentido do relógio.
const posicao = (i) => {
  const angulo = (i / 12) * 2 * Math.PI;
  return { left: TAM / 2 + RAIO * Math.sin(angulo) - BOTAO / 2, top: TAM / 2 - RAIO * Math.cos(angulo) - BOTAO / 2 };
};

// Manhã: 1 a 12 = 01h a 12h (12 = meio-dia). Tarde/Noite: 1 a 11 = 13h a 23h e 12 = 00h (meia-noite).
const para24h = (h12, tarde) => (tarde ? (h12 === 12 ? 0 : h12 + 12) : h12);
const falarHora = (h24) => (h24 === 0 ? 'meia-noite' : h24 === 12 ? 'meio-dia' : h24 === 1 ? '1 hora' : `${h24} horas`);

const Mostrador = ({ itens, selecionado, rotulo, texto, aoTocar }) => (
  <View style={{ width: TAM, height: TAM, borderRadius: TAM / 2, backgroundColor: C.primaryBg, borderWidth: 2, borderColor: C.border, alignSelf: 'center', marginVertical: 16 }}>
    {itens.map((n, i) => {
      const on = n === selecionado;
      return (
        <Pressable key={n} onPress={() => aoTocar(n)} accessibilityRole="button" accessibilityLabel={rotulo(n)} accessibilityState={{ selected: on }}
          style={{ position: 'absolute', ...posicao(i), width: BOTAO, height: BOTAO, borderRadius: BOTAO / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.primary : '#fff', borderWidth: 2, borderColor: on ? C.primary : C.line }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: on ? '#fff' : C.ink }}>{texto(n)}</Text>
        </Pressable>
      );
    })}
    <View style={{ position: 'absolute', left: TAM / 2 - 6, top: TAM / 2 - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: C.primary }} />
  </View>
);

/** valor e onConfirmar usam "HH:mm" em 24h, igual à API. */
export default function RelogioPicker({ valor = '08:00', onConfirmar }) {
  const [h, setH] = useState(Number(valor.slice(0, 2)));
  const [m, setM] = useState(Number(valor.slice(3, 5)));
  const [etapa, setEtapa] = useState('horas');
  const tarde = h === 0 || h >= 13;
  const h12 = h % 12 === 0 ? 12 : h % 12;

  const Parte = ({ texto, ativa, aoTocar, rotulo }) => (
    <Pressable onPress={aoTocar} accessibilityRole="button" accessibilityLabel={rotulo}
      style={{ minHeight: 56, paddingHorizontal: 8, borderBottomWidth: 4, borderBottomColor: ativa ? C.primary : 'transparent' }}>
      <Text style={{ fontSize: 56, fontWeight: '800', color: ativa ? C.primary : C.ink }}>{texto}</Text>
    </Pressable>
  );

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
        accessibilityLabel={`Horário escolhido: ${falarHora(h)} e ${m} minutos`}>
        <Parte texto={pad(h)} ativa={etapa === 'horas'} aoTocar={() => setEtapa('horas')} rotulo="Mudar a hora" />
        <Text style={{ fontSize: 56, fontWeight: '800', color: C.ink }}>:</Text>
        <Parte texto={pad(m)} ativa={etapa === 'minutos'} aoTocar={() => setEtapa('minutos')} rotulo="Mudar os minutos" />
      </View>
      <Text style={{ fontSize: 18, color: C.muted, textAlign: 'center', marginTop: 8 }}>
        {etapa === 'horas' ? 'Escolha o período e toque na hora' : 'Toque nos minutos'}</Text>

      {etapa === 'horas' ? (
        <>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <Btn label="Manhã" icon={!tarde ? 'checkmark' : 'sunny'} variant={!tarde ? 'primary' : 'soft'}
              onPress={() => setH(para24h(h12, false))} style={{ flex: 1 }} />
            <Btn label="Tarde/Noite" icon={tarde ? 'checkmark' : 'moon'} variant={tarde ? 'primary' : 'soft'}
              onPress={() => setH(para24h(h12, true))} style={{ flex: 1 }} />
          </View>
          <Mostrador itens={HORAS} selecionado={h12} texto={String}
            rotulo={(n) => falarHora(para24h(n, tarde))}
            aoTocar={(n) => { setH(para24h(n, tarde)); setEtapa('minutos'); }} />
        </>
      ) : (
        <>
          <Mostrador itens={MINUTOS} selecionado={m} texto={pad} rotulo={(n) => `${n} minutos`} aoTocar={setM} />
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <Btn label="-1" a11y="Diminuir 1 minuto" variant="soft" onPress={() => setM((m + 59) % 60)} style={{ flex: 1 }} />
            <Btn label="+1" a11y="Aumentar 1 minuto" variant="soft" onPress={() => setM((m + 1) % 60)} style={{ flex: 1 }} />
          </View>
        </>
      )}
      <Btn label="CONFIRMAR HORÁRIO" icon="checkmark-circle" onPress={() => onConfirmar(`${pad(h)}:${pad(m)}`)} />
    </View>
  );
}
