import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { C } from './src/theme';
import { hoje } from './src/config';
import { useAuthController } from './src/controllers/AuthController';
import { useMedController } from './src/controllers/MedController';
import { BottomNav } from './src/views/components';
import Login from './src/views/Login';
import Home from './src/views/Home';
import AddMed from './src/views/AddMed';
import History from './src/views/History';
import Assistant from './src/views/Assistant';
import Profile from './src/views/Profile';

export default function App() {
  const [screen, setScreen] = useState('home');
  const auth = useAuthController();
  const m = useMedController(!!auth.user);
  const entrar = async (email, senha) => { if (await auth.entrar(email, senha)) setScreen('home'); };
  // Conta nova: vai direto ao Perfil para completar nome e idade.
  const cadastrar = async (email, senha) => { if (await auth.cadastrar(email, senha)) setScreen('profile'); };
  const sair = () => { auth.sair(); setScreen('home'); };
  const add = async (med) => { await m.adicionar(med); setScreen('home'); };
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: C.bg }}>
          {auth.restaurando && <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 80 }} accessibilityLabel="Carregando" />}
          {!auth.restaurando && !logged && (
            <Login onEnter={entrar} onCreate={cadastrar} loading={auth.loading} error={auth.error} onClearError={auth.limparErro} />
          )}
          {logged && screen === 'home' && (
            <Home meds={m.meds} dia={m.dia} onSelectDay={m.selecionarDia} user={auth.user} go={ir}
              onTake={m.tomar} loading={m.loading} error={m.error} onReload={m.carregar} />
          )}
          {logged && screen === 'add' && <AddMed onBack={() => setScreen('home')} onSave={add} />}
          {logged && screen === 'history' && <History meds={m.meds} />}
          {logged && screen === 'assistant' && <Assistant />}
          {logged && screen === 'profile' && <Profile user={auth.user} onSave={auth.salvarPerfil} onLogout={sair} />}
          {showNav && <BottomNav current={screen} onChange={ir} />}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
