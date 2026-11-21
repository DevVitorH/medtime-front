import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { C } from '../theme';
import { Btn, Card } from './components';

// Blocos de supervisão usados no Perfil.

/** "GERAR CÓDIGO PARA SUPERVISOR": quem será acompanhado mostra o código para a outra pessoa. */
export function GerarCodigo({ onGerar }) {
  const [codigo, setCodigo] = useState(null); // { code, expiresAt }
  const [agora, setAgora] = useState(Date.now());
  const [msg, setMsg] = useState({ texto: '', ok: false });
  const [gerando, setGerando] = useState(false);

  // Atualiza o tempo restante a cada segundo enquanto houver código na tela.
  useEffect(() => {
    if (!codigo) return undefined;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [codigo]);

  const restante = codigo ? Math.max(0, Math.floor((new Date(codigo.expiresAt) - agora) / 1000)) : 0;
  const mmss = `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, '0')}`;

  const gerar = async () => {
    setGerando(true); setMsg({ texto: '', ok: false });
    try { setCodigo(await onGerar()); setAgora(Date.now()); }
    catch (e) { setMsg({ texto: e.message, ok: false }); }
    finally { setGerando(false); }
  };
  const copiar = async () => {
    try { await Clipboard.setStringAsync(codigo.code); setMsg({ texto: 'Código copiado.', ok: true }); }
    catch { setMsg({ texto: 'Não foi possível copiar. Leia o código para a pessoa.', ok: false }); }
  };

  return (
    <Card>
      <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>Ser acompanhado</Text>
      <Text style={{ fontSize: 17, color: C.ink, marginVertical: 8 }}>
        Quem usar este código poderá ver seus remédios e seu progresso.</Text>
      {codigo && (
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <Text accessibilityLabel={`Código: ${codigo.code.split('').join(', ')}`}
            style={{ fontSize: 48, fontWeight: '800', letterSpacing: 8, color: restante > 0 ? C.primary : C.muted }}>{codigo.code}</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: restante > 0 ? C.ink : C.redDark }}>
            {restante > 0 ? `Vale por mais ${mmss}` : 'Código expirado. Gere um novo.'}</Text>
        </View>
      )}
      {codigo && restante > 0 && <Btn label="COPIAR" icon="copy-outline" variant="soft" onPress={copiar} style={{ marginBottom: 12 }} />}
      <Btn label={gerando ? 'GERANDO...' : codigo ? 'GERAR NOVO CÓDIGO' : 'GERAR CÓDIGO PARA SUPERVISOR'}
        icon="key-outline" onPress={gerar} disabled={gerando} />
      {!!msg.texto && (
        <Text accessibilityLiveRegion="polite" style={{ fontSize: 17, color: msg.ok ? C.okDark : C.redDark, textAlign: 'center', marginTop: 12 }}>{msg.texto}</Text>
      )}
    </Card>
  );
}

/** "CONECTAR COM CÓDIGO": quem vai acompanhar digita o código da outra pessoa. */
export function ConectarComCodigo({ onConectar }) {
  const [aberto, setAberto] = useState(false);
  const [codigo, setCodigo] = useState('');
  const [msg, setMsg] = useState({ texto: '', ok: false });
  const [enviando, setEnviando] = useState(false);

  // Maiúsculas automáticas, sem espaços nem símbolos, no máximo 6 caracteres.
  const digitar = (v) => setCodigo(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
  const conectar = async () => {
    if (codigo.length !== 6) return setMsg({ texto: 'O código tem 6 letras e números.', ok: false });
    setEnviando(true); setMsg({ texto: '', ok: false });
    try {
      const pessoa = await onConectar(codigo);
      setCodigo('');
      setMsg({ texto: `Conectado! Agora você acompanha ${pessoa.name}.`, ok: true });
    } catch (e) { setMsg({ texto: e.message, ok: false }); }
    finally { setEnviando(false); }
  };

  return (
    <Card>
      <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink }}>Acompanhar alguém</Text>
      <Text style={{ fontSize: 17, color: C.ink, marginVertical: 8 }}>Peça o código para a pessoa e digite aqui.</Text>
      {!aberto ? (
        <Btn label="CONECTAR COM CÓDIGO" icon="link" variant="soft" onPress={() => setAberto(true)} />
      ) : (
        <>
          <TextInput value={codigo} onChangeText={digitar} autoCapitalize="characters" autoCorrect={false}
            autoComplete="off" maxLength={6} placeholder="ABC234" placeholderTextColor={C.hint}
            accessibilityLabel="Código de 6 letras e números"
            style={{ minHeight: 72, borderWidth: 2, borderColor: C.border, borderRadius: 14, backgroundColor: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: 8, textAlign: 'center', color: C.ink, marginBottom: 12 }} />
          <Btn label={enviando ? 'CONECTANDO...' : 'CONECTAR'} icon="link" onPress={conectar} disabled={enviando} />
        </>
      )}
      {!!msg.texto && (
        <Text accessibilityLiveRegion="polite" style={{ fontSize: 17, color: msg.ok ? C.okDark : C.redDark, textAlign: 'center', marginTop: 12 }}>{msg.texto}</Text>
      )}
    </Card>
  );
}

/** Uma pessoa numa lista (supervisor ou dependente). Se onAbrir existir, tocar no nome abre o resumo. */
export function LinhaPessoa({ pessoa, onAbrir, onRemover }) {
  const nome = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minHeight: 56 }}>
      <Ionicons name="person-circle" size={40} color={C.primary} />
      <Text style={{ flex: 1, fontSize: 19, fontWeight: '800', color: C.ink }}>{pessoa.name}</Text>
      {onAbrir && <Ionicons name="chevron-forward" size={28} color={C.muted} />}
    </View>
  );
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: C.line, paddingVertical: 8, gap: 8 }}>
      {onAbrir ? (
        <Pressable onPress={() => onAbrir(pessoa)} accessibilityRole="button" accessibilityLabel={`Ver resumo de ${pessoa.name}`}>
          {nome}
        </Pressable>
      ) : nome}
      <Btn label="REMOVER" icon="person-remove-outline" variant="soft" a11y={`Remover ${pessoa.name}`} onPress={() => onRemover(pessoa)} />
    </View>
  );
}
