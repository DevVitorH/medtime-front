# Contrato da API (Spring Boot) – MedTime

Base: `http://<host>:8080`. JSON em UTF-8. Após o login, o front envia `Authorization: Bearer <token>`.
Erros: status 4xx/5xx com corpo `{ "mensagem": "texto para o usuário" }`.

Datas: o app envia a data de hoje do aparelho em `?data=yyyy-MM-dd`. Se não vier, a API usa a data do servidor.

## Autenticação (e-mail + senha numérica)
- Senha: só números, de 4 a 6 dígitos. O banco guarda só o hash BCrypt.
- Token de sessão válido por **24 horas** (`expiraEm`, ISO 8601 em UTC). Um novo login invalida o token anterior.
- Token ausente, inválido ou vencido em qualquer rota fora de `/api/auth/*`: **401** `{"mensagem":"Sessão expirada. Entre novamente."}`.
- Login errado (e-mail inexistente ou senha errada): **401** `{"mensagem":"E-mail ou senha incorretos."}`.
- 5 senhas erradas seguidas: bloqueio de 15 minutos, **429** `{"mensagem":"Muitas tentativas. Tente de novo em alguns minutos."}`.

`AuthRes` = `{token, expiraEm:"2026-11-22T14:00:00Z", usuario}`
`usuario` = `{id, nome, idade, email}` (nome e idade podem ser `null` logo após o cadastro)

| Método e rota | Corpo enviado | Resposta |
|---|---|---|
| `POST /api/auth/cadastrar` | `{email, senha:"1234", aceiteLgpd:true}` | 201 e `AuthRes`. E-mail repetido: 409 `"Este e-mail já tem conta. Use Entrar."` |
| `POST /api/auth/entrar` | `{email, senha}` | `AuthRes` (ou 401 / 429, veja acima) |
| `GET /api/usuarios/me` | – | `usuario` (usado ao reabrir o app com o token salvo) |
| `PUT /api/usuarios/me` | `{nome, idade}` (nome obrigatório, idade de 1 a 120) | `usuario` atualizado |
| `GET /api/medicamentos?data=2026-11-21` | – | `[medicamento]` só dos agendados para essa data, em ordem de horário (`tomado` = tomou nessa data) |
| `POST /api/medicamentos` | `{nome, dose, horario:"HH:mm", orientacao, diasSemana:["SEG","QUA"]}` | status 201 e o `medicamento` criado (`tomado:false`, `dataInicio` = hoje) |
| `PUT /api/medicamentos/{id}` | o mesmo corpo do POST | o `medicamento` atualizado (`tomado` = de hoje). `dataInicio` não muda |
| `DELETE /api/medicamentos/{id}` | – | 204 sem corpo (veja "Exclusão" abaixo) |
| `POST /api/medicamentos/{id}/tomar?data=2026-11-21` | – | o `medicamento` com `tomado:true`. Só aceita a data de hoje |
| `GET /api/historico?mes=2026-11&data=2026-11-21` | – | `{diasSeguidos, adesao, dias:[{dia:1, status:"TOMOU"\|"FALHOU"}]}` (só dias antes de `data`) |

## Remédios e agenda
`medicamento` = `{id, nome, dose, horario:"09:00", orientacao, tomado, diasSemana:["SEG","TER","QUA","QUI","SEX"], dataInicio:"2026-11-21", status:"PENDENTE", tomadoEm:null}`
- `status` é **calculado no servidor** (fuso America/Fortaleza) para a data pedida, com tolerância de
  **30 minutos** (`MedicamentoService.TOLERANCIA_MIN`). Limite = `horario + 30 min`:
  - `PENDENTE`: não tomou e agora ainda não passou do limite (dia futuro é sempre PENDENTE);
  - `ATRASADO`: não tomou e agora já passou do limite (dia passado sem tomada também vem ATRASADO;
    a Home mostra "Não tomado" nos dias passados);
  - `TOMADO`: tomou até o limite (tomada antiga sem hora gravada também conta como TOMADO);
  - `TOMADO_COM_ATRASO`: tomou depois do limite (ex.: horário 11:00, tomou 12:30).
- `tomadoEm`: hora da tomada naquela data, `"HH:mm"`, ou `null`. É gravada pelo servidor no `tomar`
  (o cliente nunca envia). `tomado` continua existindo (`true` nos dois status TOMADO).
- O status não é guardado no banco (é derivado de `tomada`). Histórico: TOMADO_COM_ATRASO conta como tomado.
- O app só refaz a virada PENDENTE → ATRASADO na tela de hoje a cada minuto, sem chamar a API de novo.
- `diasSemana`: siglas `SEG TER QUA QUI SEX SAB DOM`, obrigatório com pelo menos 1 (400 `"Escolha pelo menos um dia."`).
  A resposta vem sempre na ordem SEG → DOM.
- Um remédio está **agendado** numa data quando o dia da semana está marcado, `dataInicio <= data` e
  (`dataFim` nula ou `data <= dataFim`). `dataFim` ainda não aparece no JSON (será usada ao excluir).
- `tomar` com data diferente de hoje: 400 `"Só é possível marcar o remédio de hoje."`.
  Remédio que não está agendado para hoje: 400 `"Este remédio não está agendado para hoje."`.
- Histórico: um dia é `TOMOU` quando todos os remédios agendados *naquele dia* foram tomados.
  Dias sem remédio agendado não aparecem em `dias` e não quebram a sequência.
- "Hoje" no servidor é calculado no fuso **America/Fortaleza** (UTC-3, mesmo horário de Sergipe).

## Edição e exclusão
- PUT, DELETE e tomar só funcionam para remédio **do usuário logado e ainda não encerrado**;
  senão 404 `"Remédio não encontrado."` (não revela remédio de outra pessoa).
- **Exclusão que preserva o histórico:** remédio nunca tomado é apagado de vez;
  remédio com tomadas é encerrado com `dataFim = ontem` (fuso America/Fortaleza): some de hoje em diante,
  mas os dias passados continuam no histórico.
- **Limitação da edição (MVP):** mudar o horário vale daqui para a frente e não afeta o histórico.
  Mudar os **dias da semana recalcula também os dias passados** do histórico (ex.: incluir o sábado faz
  sábados anteriores contarem como esperados). O app avisa isso na tela de edição.
| `POST /api/assistente/perguntar` | `{pergunta}` | `{resposta}` (o Spring chama o Google Gemini; a chave fica só no servidor). A resposta termina sempre com "Informação de apoio. Confirme com seu médico ou farmacêutico." Falhas: 503 (sem chave ou limite de uso) e 502 (erro de rede ou resposta vazia), sempre com `{mensagem}` |

## Supervisão (um usuário acompanha outro)
O **dependente** (quem será acompanhado) gera um código; o **supervisor** digita o código e o vínculo é criado.
Gerar o código é o consentimento (LGPD): "Quem usar este código poderá ver seus remédios e seu progresso."

`pessoa` = `{vinculoId, usuarioId, nome}` (só o nome; `nome` pode ser `null` se a pessoa não completou o perfil)

| Método e rota | Corpo enviado | Resposta |
|---|---|---|
| `POST /api/vinculos/codigo` | – | 201 `{codigo:"K7M2QX", expiraEm}`. Gerar um novo invalida o anterior ainda não usado |
| `POST /api/vinculos/conectar` | `{codigo}` (aceita minúsculas e espaços) | `pessoa` (o dependente). Quem chamou vira supervisor dele |
| `GET /api/vinculos` | – | `{supervisores:[pessoa], dependentes:[pessoa]}` |
| `DELETE /api/vinculos/{id}` | – | 204. Qualquer um dos dois lados pode remover; senão 404 `"Vínculo não encontrado."` |
| `GET /api/dependentes/{id}/resumo?data=2026-11-21` | – | `{nome, data, medicamentos:[medicamento], diasSeguidos, adesao}` |
| `GET /api/dependentes/{id}/historico?mes=2026-11&data=2026-11-23` | – | Igual a `GET /api/historico`: `{diasSeguidos, adesao, dias:[{dia, status}]}` do dependente, no mês pedido. Somente leitura |

- Código: 6 caracteres de `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sem O, 0, I e 1), gerado com `SecureRandom`,
  **uso único**, válido por **30 minutos**. O código nunca é registrado em log.
- Erros do `conectar` (400): `"Código inválido. Confira as letras e os números."`, `"Este código expirou. Peça um novo."`,
  `"Este código já foi usado. Peça um novo."`, `"Você não pode ser supervisor de si mesmo."`; 409 `"Vocês já estão conectados."`.
- **5 códigos errados** (inválido, expirado ou já usado) em 15 minutos → bloqueio de **15 minutos**, 429
  `"Muitas tentativas. Tente de novo em alguns minutos."`. Um código certo zera a contagem.
- **Resumo e histórico do dependente = dados de saúde:** só para o **supervisor** com vínculo com aquele dependente; senão **403**
  `"Você não acompanha esta pessoa."` (também quando o id não existe, para não revelar quem tem conta).
  O dependente não vê os remédios do supervisor.

## CORS (obrigatório para o front Web em localhost:8081)
Já configurado em `medtime-back/src/main/java/br/com/viverbem/config/WebConfig.java`
(origens em `app.cors.origins` no `application.properties`):
```java
r.addMapping("/api/**").allowedOrigins(origens)
 .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS").allowedHeaders("*");
```

## Como ligar o front
1. Crie o arquivo `.env` na pasta `medtime-front` com:
   ```
   EXPO_PUBLIC_USE_MOCK=false
   EXPO_PUBLIC_API_URL=http://localhost:8080
   ```
   Em celular físico, use o IP do PC (ex.: `http://192.168.0.10:8080`); no emulador Android, `http://10.0.2.2:8080`.
2. `EXPO_PUBLIC_USE_MOCK=false` usa o Spring Boot; sem isso o app roda em modo demonstração.
3. Reinicie com `npx expo start -c`.
