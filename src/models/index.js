// MODEL: converte o JSON do back-end (português) para o formato usado pelas telas.
// Ordem dos dias que a API usa.
const ORDEM_DIAS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
export const toMedicamento = (d) => ({
  id: d.id, name: d.nome, time: d.horario, dose: d.dose, note: d.orientacao || '', done: !!d.tomado,
  days: d.diasSemana || [], startDate: d.dataInicio || null,
});
export const fromMedicamento = (m) => ({
  nome: m.name, horario: m.time, dose: m.dose, orientacao: m.note,
  diasSemana: ORDEM_DIAS.filter((s) => m.days.includes(s)),
});
// nome e idade podem vir nulos logo depois do cadastro: viram '' para as telas.
export const toUsuario = (d) => ({
  id: d.id, name: d.nome || '', age: d.idade == null ? '' : String(d.idade),
  email: d.email, supervisor: d.supervisor || null,
});
export const toHistorico = (d) => ({
  streak: d.diasSeguidos, adherence: d.adesao,
  status: Object.fromEntries((d.dias || []).map((x) => [x.dia, x.status])),
});
