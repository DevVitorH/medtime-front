// MODEL: converte o JSON do back-end (português) para o formato usado pelas telas.
// Ordem dos dias que a API usa.
const ORDEM_DIAS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
// status vem calculado da API: PENDENTE | ATRASADO | TOMADO | TOMADO_COM_ATRASO.
// Se vier ausente (API antiga), deriva de "tomado" para a tela não quebrar.
export const toMedicamento = (d) => ({
  id: d.id, name: d.nome, time: d.horario, dose: d.dose, note: d.orientacao || '', done: !!d.tomado,
  days: d.diasSemana || [], startDate: d.dataInicio || null,
  status: d.status || (d.tomado ? 'TOMADO' : 'PENDENTE'), takenAt: d.tomadoEm || null,
});

// Mesma tolerância da API (MedicamentoService.TOLERANCIA_MIN).
export const TOLERANCIA_MIN = 30;
const minutos = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
/**
 * A regra fica na API. Aqui só a virada PENDENTE -> ATRASADO quando o horário passa com a tela aberta,
 * sem chamar a API de novo. Vale só para o dia de hoje (a API já manda o resto certo).
 */
export const statusAgora = (m, eHoje, agora = new Date()) => {
  if (m.status !== 'PENDENTE' || !eHoje) return m.status;
  const agoraMin = agora.getHours() * 60 + agora.getMinutes();
  return agoraMin > minutos(m.time) + TOLERANCIA_MIN ? 'ATRASADO' : 'PENDENTE';
};
/** "11:00" + 30 min -> "11:30" (para "Atrasado desde 11:30"). */
export const limiteDoHorario = (hhmm) => {
  const t = (minutos(hhmm) + TOLERANCIA_MIN) % (24 * 60);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
export const fromMedicamento = (m) => ({
  nome: m.name, horario: m.time, dose: m.dose, orientacao: m.note,
  diasSemana: ORDEM_DIAS.filter((s) => m.days.includes(s)),
});
// nome e idade podem vir nulos logo depois do cadastro: viram '' para as telas.
export const toUsuario = (d) => ({
  id: d.id, name: d.nome || '', age: d.idade == null ? '' : String(d.idade), email: d.email,
});

// Supervisão: pessoa do outro lado do vínculo (a API manda só o nome).
const SEM_NOME = 'Pessoa sem nome no perfil';
export const toPessoa = (d) => ({ vinculoId: d.vinculoId, id: d.usuarioId, name: d.nome || SEM_NOME });
export const toVinculos = (d) => ({
  supervisors: (d.supervisores || []).map(toPessoa),
  dependents: (d.dependentes || []).map(toPessoa),
});
export const toCodigo = (d) => ({ code: d.codigo, expiresAt: d.expiraEm });
export const toResumo = (d) => ({
  name: d.nome || SEM_NOME, meds: (d.medicamentos || []).map(toMedicamento),
  streak: d.diasSeguidos, adherence: d.adesao,
});
// Assistente: a API termina a resposta com o aviso fixo. Separamos para a tela mostrar o aviso
// em destaque discreto (e o "Ouvir" ler só a resposta). Se o aviso não vier, a tela mostra mesmo assim.
export const AVISO_IA = 'Informação de apoio. Confirme com seu médico ou farmacêutico.';
export const toResposta = (d) => {
  const texto = (d.resposta || '').trim();
  return { text: texto.endsWith(AVISO_IA) ? texto.slice(0, -AVISO_IA.length).trim() : texto, notice: AVISO_IA };
};

export const toHistorico = (d) => ({
  streak: d.diasSeguidos, adherence: d.adesao,
  status: Object.fromEntries((d.dias || []).map((x) => [x.dia, x.status])),
});
