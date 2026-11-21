// Servidor falso para demonstração: mesmas rotas e JSON do contrato em docs/API.md.
import { dataISO, deISO, hoje } from '../config';

const TODOS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
const SIGLA_JS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']; // índice = Date.getDay()
let meds = [
  { id: 1, nome: 'Losartana Potássica', dose: '50mg - 1 comprimido', horario: '08:00', orientacao: 'Tomar em jejum com um copo de água', diasSemana: TODOS, dataInicio: '2020-01-01' },
  { id: 2, nome: 'Vitamina B12', dose: '1000mcg - 1 cápsula', horario: '12:30', orientacao: 'Tomar logo após o almoço', diasSemana: ['SEG', 'TER', 'QUA', 'QUI', 'SEX'], dataInicio: '2020-01-01' },
  { id: 3, nome: 'Metformina', dose: '850mg - 1 comprimido', horario: '20:00', orientacao: 'Tomar durante o jantar', diasSemana: TODOS, dataInicio: '2020-01-01' },
];
const tomadas = new Set([`1|${hoje()}`]); // "idDoRemedio|yyyy-MM-dd"
// Mesma regra da API (Medicamento.agendadoEm): dia marcado, data a partir do início e até o fim (se houver).
const agendadoEm = (m, data) => m.diasSemana.includes(SIGLA_JS[deISO(data).getDay()])
  && m.dataInicio <= data && (!m.dataFim || data <= m.dataFim);
// Como a API: remédio existente e ainda não encerrado; senão 404.
const buscar = (id) => {
  const m = meds.find((x) => x.id === id && (!x.dataFim || x.dataFim >= hoje()));
  if (!m) erro(404, 'Remédio não encontrado.');
  return m;
};
const ontem = () => { const d = deISO(hoje()); d.setDate(d.getDate() - 1); return dataISO(d); };
const medRes = (m, data) => ({ ...m, tomado: tomadas.has(`${m.id}|${data}`) });
const dataDaRota = (path) => (path.match(/data=(\d{4}-\d{2}-\d{2})/) || [])[1] || hoje();
const falhas = [5, 12];
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 300));
// Erro no mesmo formato da API: status + mensagem.
const erro = (status, mensagem) => { const e = new Error(mensagem); e.status = status; throw e; };

// Contas de demonstração (somem ao recarregar). Conta pronta: maria@email.com / senha 1234.
const contas = { 'maria@email.com': { id: 1, senha: '1234', nome: 'Maria', idade: 65, falhas: 0, bloqueadoAte: 0 } };
const sessoes = {}; // token -> e-mail
const SUPERVISOR = { nome: 'Ana Silva', parentesco: 'Filha', online: true };
const usuarioRes = (email) => {
  const c = contas[email];
  return { id: c.id, nome: c.nome, idade: c.idade, email, supervisor: SUPERVISOR };
};
const novaSessao = (email) => {
  const token = `mock-${Date.now()}`;
  sessoes[token] = email;
  return { token, expiraEm: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), usuario: usuarioRes(email) };
};

export async function mock(method, path, body, token) {
  if (path === '/api/auth/cadastrar') {
    if (!body.aceiteLgpd) erro(400, 'É preciso autorizar o uso de dados (LGPD).');
    if (contas[body.email]) erro(409, 'Este e-mail já tem conta. Use Entrar.');
    contas[body.email] = { id: Date.now(), senha: body.senha, nome: null, idade: null, falhas: 0, bloqueadoAte: 0 };
    return wait(novaSessao(body.email));
  }
  if (path === '/api/auth/entrar') {
    const c = contas[body.email];
    if (!c) erro(401, 'E-mail ou senha incorretos.');
    if (c.bloqueadoAte > Date.now()) erro(429, 'Muitas tentativas. Tente de novo em alguns minutos.');
    if (c.senha !== body.senha) {
      c.falhas += 1;
      if (c.falhas >= 5) { c.falhas = 0; c.bloqueadoAte = Date.now() + 15 * 60 * 1000; erro(429, 'Muitas tentativas. Tente de novo em alguns minutos.'); }
      erro(401, 'E-mail ou senha incorretos.');
    }
    c.falhas = 0; c.bloqueadoAte = 0;
    return wait(novaSessao(body.email));
  }

  // Daqui para baixo as rotas exigem login, como na API.
  const email = sessoes[token];
  if (!email) erro(401, 'Sessão expirada. Entre novamente.');
  if (path === '/api/usuarios/me' && method === 'GET') return wait(usuarioRes(email));
  if (path === '/api/usuarios/me' && method === 'PUT') {
    if (!body.nome || !body.nome.trim()) erro(400, 'Informe seu nome.');
    if (!(body.idade >= 1 && body.idade <= 120)) erro(400, 'A idade deve ser de 1 a 120.');
    contas[email].nome = body.nome.trim(); contas[email].idade = body.idade;
    return wait(usuarioRes(email));
  }
  if (path === '/api/medicamentos' && method === 'POST') {
    if (!body.diasSemana || body.diasSemana.length === 0) erro(400, 'Escolha pelo menos um dia.');
    const m = { ...body, id: Date.now(), dataInicio: hoje() };
    meds = [...meds, m];
    return wait(medRes(m, hoje()));
  }
  if (path.startsWith('/api/medicamentos') && method === 'GET') {
    const data = dataDaRota(path);
    const lista = meds.filter((m) => agendadoEm(m, data)).sort((a, b) => a.horario.localeCompare(b.horario));
    return wait(lista.map((m) => medRes(m, data)));
  }
  const um = path.match(/^\/api\/medicamentos\/(\d+)$/);
  if (um && method === 'PUT') {
    const m = buscar(Number(um[1]));
    if (!body.diasSemana || body.diasSemana.length === 0) erro(400, 'Escolha pelo menos um dia.');
    Object.assign(m, { nome: body.nome, dose: body.dose, horario: body.horario, orientacao: body.orientacao, diasSemana: body.diasSemana });
    return wait(medRes(m, hoje()));
  }
  if (um && method === 'DELETE') {
    const m = buscar(Number(um[1]));
    const temTomadas = [...tomadas].some((k) => k.startsWith(`${m.id}|`));
    if (temTomadas) m.dataFim = ontem();          // encerra: some de hoje em diante
    else meds = meds.filter((x) => x.id !== m.id); // nunca tomado: apaga de vez
    return wait(null);
  }
  const t = path.match(/^\/api\/medicamentos\/(\d+)\/tomar(\?.*)?$/);
  if (t) {
    const data = dataDaRota(path);
    if (data !== hoje()) erro(400, 'Só é possível marcar o remédio de hoje.');
    const m = buscar(Number(t[1]));
    if (!agendadoEm(m, data)) erro(400, 'Este remédio não está agendado para hoje.');
    tomadas.add(`${m.id}|${data}`);
    return wait(medRes(m, data));
  }
  if (path.startsWith('/api/historico')) {
    // Igual à API: só os dias do mês antes de hoje (?data=yyyy-MM-dd).
    const data = (path.match(/data=(\d{4}-\d{2}-\d{2})/) || [])[1];
    const diasAntes = data ? Number(data.slice(8, 10)) - 1 : 24;
    const dias = Array.from({ length: diasAntes }, (_, i) => ({ dia: i + 1, status: falhas.includes(i + 1) ? 'FALHOU' : 'TOMOU' }));
    let seguidos = 0;
    for (let i = dias.length - 1; i >= 0 && dias[i].status === 'TOMOU'; i--) seguidos++;
    const adesao = dias.length ? Math.round((100 * dias.filter((d) => d.status === 'TOMOU').length) / dias.length) : 0;
    return wait({ diasSeguidos: seguidos, adesao, dias });
  }
  if (path === '/api/assistente/perguntar') {
    return wait({ resposta: `Modo demonstração. Você perguntou: ${body.pergunta}. Confirme sempre com seu médico ou farmacêutico.` });
  }
  throw new Error(`mock: rota não encontrada ${method} ${path}`);
}
