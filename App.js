import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { C } from './src/theme';
import { hoje } from './src/config';
import { useAuthController } from './src/controllers/AuthController';
import { useMedController } from './src/controllers/MedController';
import { useAssistantController } from './src/controllers/AssistantController';
import { BottomNav } from './src/views/components';
import Login from './src/views/Login';
import Home from './src/views/Home';
import AddMed, { EditarRemedio } from './src/views/AddMed';
import History from './src/views/History';
import Assistant from './src/views/Assistant';
import Profile from './src/views/Profile';
import ResumoDependente from './src/views/ResumoDependente';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [editando, setEditando] = useState(null); // remédio aberto na tela de edição
  const [acompanhando, setAcompanhando] = useState(null); // pessoa aberta na tela do supervisor
  const auth = useAuthController();
  const m = useMedController(!!auth.user);
  const assistente = useAssistantController(); // a conversa fica aqui para não sumir ao trocar de aba
  const entrar = async (email, senha) => { if (await auth.entrar(email, senha)) setScreen('home'); };
  // Conta nova: vai direto ao Perfil para completar nome e idade.
  const cadastrar = async (email, senha) => { if (await auth.cadastrar(email, senha)) setScreen('profile'); };
  const sair = () => { auth.sair(); assistente.limpar(); setScreen('home'); };
  const add = async (med) => { await m.adicionar(med); setScreen('home'); };
  // Editar mantém o dia escolhido na Home (por isso usa setScreen, e não ir).
  const abrirEdicao = (med) => { setEditando(med); setScreen('edit'); };
  const salvarEdicao = async (med) => { await m.editar(editando.id, med); setScreen('home'); };
  // Ao sair da Home, a faixa de dias volta para hoje (o Histórico mostra o "Resumo de Hoje").
  const ir = (tela) => {
    if (tela !== 'home' && m.dia !== hoje()) m.selecionarDia(hoje());
    setScreen(tela);
  };
  const logged = !!auth.user;
  const showNav = logged && ['home', 'history', 'assistant', 'profile'].includes(screen);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1, backgroundColor: C.card }}>
        <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: C.bg }}>
          {auth.restaurando && <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 80 }} accessibilityLabel="Carregando" />}
          {!auth.restaurando && !logged && (
            <Login onEnter={entrar} onCreate={cadastrar} loading={auth.loading} error={auth.error} onClearError={auth.limparErro} />
          )}
          {logged && screen === 'home' && (
            <Home meds={m.meds} dia={m.dia} onSelectDay={m.selecionarDia} user={auth.user} go={ir}
              onTake={m.tomar} loading={m.loading} error={m.error} onReload={m.carregar}
              onEdit={abrirEdicao} onDelete={m.excluir} aviso={m.aviso} onClearAviso={m.limparAviso} />
          )}
          {logged && screen === 'add' && <AddMed onBack={() => setScreen('home')} onSave={add} />}
          {logged && screen === 'edit' && editando && (
            <EditarRemedio inicial={editando} onBack={() => setScreen('home')} onSave={salvarEdicao} />
          )}
          {logged && screen === 'history' && <History meds={m.meds} />}
          {logged && screen === 'assistant' && <Assistant conversa={assistente} />}
          {logged && screen === 'profile' && (
            <Profile user={auth.user} onSave={auth.salvarPerfil} onLogout={sair}
              onOpenDependent={(p) => { setAcompanhando(p); setScreen('dependente'); }} />
          )}
          {logged && screen === 'dependente' && acompanhando && (
            <ResumoDependente pessoa={acompanhando} onBack={() => setScreen('profile')} />
          )}
          {showNav && <BottomNav current={screen} onChange={ir} />}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
