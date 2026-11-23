// Servidor falso para demonstração: mesmas rotas e JSON do contrato em docs/API.md.
import { dataISO, deISO, hoje } from '../config';

const TODOS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
const SIGLA_JS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']; // índice = Date.getDay()
let meds = [
  { id: 1, nome: 'Losartana Potássica', dose: '50mg - 1 comprimido', horario: '08:00', orientacao: 'Tomar em jejum com um copo de água', diasSemana: TODOS, dataInicio: '2020-01-01' },
  { id: 2, nome: 'Vitamina B12', dose: '1000mcg - 1 cápsula', horario: '12:30', orientacao: 'Tomar logo após o almoço', diasSemana: ['SEG', 'TER', 'QUA', 'QUI', 'SEX'], dataInicio: '2020-01-01' },
  { id: 3, nome: 'Metformina', dose: '850mg - 1 comprimido', horario: '20:00', orientacao: 'Tomar durante o jantar', diasSemana: TODOS, dataInicio: '2020-01-01' },
];
// "idDoRemedio|yyyy-MM-dd" -> hora da tomada "HH:mm" (como Tomada.tomadoEm na API).
const tomadas = new Map([[`1|${hoje()}`, '08:05']]);
const TOLERANCIA_MIN = 30; // igual a MedicamentoService.TOLERANCIA_MIN
const horaAgora = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const emData = (data, hhmm) => { const d = deISO(data); d.setHours(Number(hhmm.slice(0, 2)), Number(hhmm.slice(3, 5))); return d; };
// Mesma regra de MedicamentoService.calcularStatus.
const calcularStatus = (m, data, tomadoEm, tomou) => {
  const limite = new Date(emData(data, m.horario).getTime() + TOLERANCIA_MIN * 60 * 1000);
  if (tomou) return tomadoEm && emData(data, tomadoEm) > limite ? 'TOMADO_COM_ATRASO' : 'TOMADO';
  return new Date() > limite ? 'ATRASADO' : 'PENDENTE';
};
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
const medRes = (m, data) => {
  const chave = `${m.id}|${data}`;
  const tomou = tomadas.has(chave);
  const tomadoEm = tomadas.get(chave) || null;
  return { ...m, tomado: tomou, status: calcularStatus(m, data, tomadoEm, tomou), tomadoEm };
};
const dataDaRota = (path) => (path.match(/data=(\d{4}-\d{2}-\d{2})/) || [])[1] || hoje();
const falhas = [5, 12]; // dias em que "esqueceu" (em todo mês, para a demonstração)
// Igual a GET /api/historico: só dias antes de hoje; mês passado completo; mês futuro vazio.
const historicoMock = (path) => {
  const data = dataDaRota(path);
  const mes = (path.match(/mes=(\d{4}-\d{2})/) || [])[1] || data.slice(0, 7);
  const [ano, m] = mes.split('-').map(Number);
  const totalDoMes = new Date(ano, m, 0).getDate();
  const diasAntes = mes < data.slice(0, 7) ? totalDoMes : mes === data.slice(0, 7) ? Number(data.slice(8, 10)) - 1 : 0;
  const dias = Array.from({ length: diasAntes }, (_, i) => ({ dia: i + 1, status: falhas.includes(i + 1) ? 'FALHOU' : 'TOMOU' }));
  let seguidos = 0;
  for (let i = dias.length - 1; i >= 0 && dias[i].status === 'TOMOU'; i--) seguidos++;
  const adesao = dias.length ? Math.round((100 * dias.filter((d) => d.status === 'TOMOU').length) / dias.length) : 0;
  return { diasSeguidos: seguidos, adesao, dias };
};
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 300));
// Erro no mesmo formato da API: status + mensagem.
const erro = (status, mensagem) => { const e = new Error(mensagem); e.status = status; throw e; };

// Contas de demonstração (somem ao recarregar). Senha 1234 nas duas.
// A Maria já acompanha o João, para mostrar a tela do supervisor sem servidor.
const conta = (id, nome, idade) => ({ id, senha: '1234', nome, idade, falhas: 0, bloqueadoAte: 0, errosCodigo: 0, primeiraFalhaCodigo: 0, codigoBloqueadoAte: 0 });
const contas = { 'maria@email.com': conta(1, 'Maria', 65), 'joao@email.com': conta(2, 'João', 72) };
const sessoes = {}; // token -> e-mail
const usuarioRes = (email) => {
  const c = contas[email];
  return { id: c.id, nome: c.nome, idade: c.idade, email };
};

// Supervisão: códigos de convite e vínculos (mesmas regras da API).
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem O, 0, I e 1
const BLOQUEIO_CODIGO = 'Muitas tentativas. Tente de novo em alguns minutos.';
const codigos = {}; // código -> { dependente: e-mail, expiraEm: ms, usado: boolean }
let vinculos = [{ id: 1, dependente: 'joao@email.com', supervisor: 'maria@email.com' }];
const emailPorId = (id) => Object.keys(contas).find((e) => contas[e].id === id);
const pessoaRes = (v, outro) => ({ vinculoId: v.id, usuarioId: contas[outro].id, nome: contas[outro].nome });
const codigoErrado = (c, mensagem) => {
  const agora = Date.now();
  if (!c.primeiraFalhaCodigo || agora - c.primeiraFalhaCodigo > 15 * 60 * 1000) { c.primeiraFalhaCodigo = agora; c.errosCodigo = 0; }
  c.errosCodigo += 1;
  if (c.errosCodigo >= 5) { c.codigoBloqueadoAte = agora + 15 * 60 * 1000; c.errosCodigo = 0; c.primeiraFalhaCodigo = 0; erro(429, BLOQUEIO_CODIGO); }
  erro(400, mensagem);
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
    contas[body.email] = { ...conta(Date.now(), null, null), senha: body.senha };
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

  if (path === '/api/vinculos/codigo' && method === 'POST') {
    Object.values(codigos).forEach((c) => { if (c.dependente === email && !c.usado) c.expiraEm = Date.now(); }); // invalida o anterior
    let code;
    do { code = Array.from({ length: 6 }, () => LETRAS[Math.floor(Math.random() * LETRAS.length)]).join(''); } while (codigos[code]);
    codigos[code] = { dependente: email, expiraEm: Date.now() + 30 * 60 * 1000, usado: false };
    return wait({ codigo: code, expiraEm: new Date(codigos[code].expiraEm).toISOString() });
  }
  if (path === '/api/vinculos/conectar' && method === 'POST') {
    const eu = contas[email];
    if (eu.codigoBloqueadoAte > Date.now()) erro(429, BLOQUEIO_CODIGO);
    const code = (body.codigo || '').replace(/\s/g, '').toUpperCase();
    const c = codigos[code];
    if (!c) codigoErrado(eu, 'Código inválido. Confira as letras e os números.');
    if (c.usado) codigoErrado(eu, 'Este código já foi usado. Peça um novo.');
    if (c.expiraEm <= Date.now()) codigoErrado(eu, 'Este código expirou. Peça um novo.');
    if (c.dependente === email) erro(400, 'Você não pode ser supervisor de si mesmo.');
    if (vinculos.some((v) => v.dependente === c.dependente && v.supervisor === email)) erro(409, 'Vocês já estão conectados.');
    c.usado = true;
    const v = { id: Date.now(), dependente: c.dependente, supervisor: email };
    vinculos = [...vinculos, v];
    eu.errosCodigo = 0; eu.primeiraFalhaCodigo = 0; eu.codigoBloqueadoAte = 0;
    return wait(pessoaRes(v, c.dependente));
  }
  if (path === '/api/vinculos' && method === 'GET') {
    return wait({
      supervisores: vinculos.filter((v) => v.dependente === email).map((v) => pessoaRes(v, v.supervisor)),
      dependentes: vinculos.filter((v) => v.supervisor === email).map((v) => pessoaRes(v, v.dependente)),
    });
  }
  const vin = path.match(/^\/api\/vinculos\/(\d+)$/);
  if (vin && method === 'DELETE') {
    const v = vinculos.find((x) => x.id === Number(vin[1]) && (x.dependente === email || x.supervisor === email));
    if (!v) erro(404, 'Vínculo não encontrado.');
    vinculos = vinculos.filter((x) => x !== v);
    return wait(null);
  }
  const dep = path.match(/^\/api\/dependentes\/(\d+)\/(resumo|historico)/);
  if (dep) {
    const depEmail = emailPorId(Number(dep[1]));
    if (!depEmail || !vinculos.some((v) => v.dependente === depEmail && v.supervisor === email)) erro(403, 'Você não acompanha esta pessoa.');
    // No modo demonstração os remédios e o histórico são os mesmos para todas as contas.
    if (dep[2] === 'historico') return wait(historicoMock(path));
    const data = dataDaRota(path);
    const lista = meds.filter((m) => agendadoEm(m, data)).sort((a, b) => a.horario.localeCompare(b.horario));
    return wait({ nome: contas[depEmail].nome, data, medicamentos: lista.map((m) => medRes(m, data)), diasSeguidos: 8, adesao: 90 });
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
    const temTomadas = [...tomadas.keys()].some((k) => k.startsWith(`${m.id}|`));
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
    // A hora é do "servidor", nunca vem do cliente; tomar de novo mantém a primeira hora.
    if (!tomadas.has(`${m.id}|${data}`)) tomadas.set(`${m.id}|${data}`, horaAgora());
    return wait(medRes(m, data));
  }
  if (path.startsWith('/api/historico')) return wait(historicoMock(path));
  if (path === '/api/assistente/perguntar') {
    return wait({ resposta: `Modo demonstração. Você perguntou: ${body.pergunta}. Confirme sempre com seu médico ou farmacêutico.` });
  }
  throw new Error(`mock: rota não encontrada ${method} ${path}`);
}
