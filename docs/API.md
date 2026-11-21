# Contrato da API (Spring Boot) – ViverBem

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
`usuario` = `{id, nome, idade, email, supervisor:{nome, parentesco, online}|null}` (nome e idade podem ser `null` logo após o cadastro)

| Método e rota | Corpo enviado | Resposta |
|---|---|---|
| `POST /api/auth/cadastrar` | `{email, senha:"1234", aceiteLgpd:true}` | 201 e `AuthRes`. E-mail repetido: 409 `"Este e-mail já tem conta. Use Entrar."` |
| `POST /api/auth/entrar` | `{email, senha}` | `AuthRes` (ou 401 / 429, veja acima) |
| `GET /api/usuarios/me` | – | `usuario` (usado ao reabrir o app com o token salvo) |
| `PUT /api/usuarios/me` | `{nome, idade}` (nome obrigatório, idade de 1 a 120) | `usuario` atualizado |
| `GET /api/medicamentos?data=2026-11-21` | – | `[medicamento]` só dos agendados para essa data, em ordem de horário (`tomado` = tomou nessa data) |
| `POST /api/medicamentos` | `{nome, dose, horario:"HH:mm", orientacao, diasSemana:["SEG","QUA"]}` | status 201 e o `medicamento` criado (`tomado:false`, `dataInicio` = hoje) |
| `POST /api/medicamentos/{id}/tomar?data=2026-11-21` | – | o `medicamento` com `tomado:true`. Só aceita a data de hoje |
| `GET /api/historico?mes=2026-11&data=2026-11-21` | – | `{diasSeguidos, adesao, dias:[{dia:1, status:"TOMOU"\|"FALHOU"}]}` (só dias antes de `data`) |

## Remédios e agenda
`medicamento` = `{id, nome, dose, horario:"09:00", orientacao, tomado, diasSemana:["SEG","TER","QUA","QUI","SEX"], dataInicio:"2026-11-21"}`
- `diasSemana`: siglas `SEG TER QUA QUI SEX SAB DOM`, obrigatório com pelo menos 1 (400 `"Escolha pelo menos um dia."`).
  A resposta vem sempre na ordem SEG → DOM.
- Um remédio está **agendado** numa data quando o dia da semana está marcado, `dataInicio <= data` e
  (`dataFim` nula ou `data <= dataFim`). `dataFim` ainda não aparece no JSON (será usada ao excluir).
- `tomar` com data diferente de hoje: 400 `"Só é possível marcar o remédio de hoje."`.
  Remédio que não está agendado para hoje: 400 `"Este remédio não está agendado para hoje."`.
- Histórico: um dia é `TOMOU` quando todos os remédios agendados *naquele dia* foram tomados.
  Dias sem remédio agendado não aparecem em `dias` e não quebram a sequência.
- "Hoje" no servidor é calculado no fuso **America/Fortaleza** (UTC-3, mesmo horário de Sergipe).
| `POST /api/assistente/perguntar` | `{pergunta}` | `{resposta}` (o Spring chama a LLM; a chave da API fica só no servidor) |

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
