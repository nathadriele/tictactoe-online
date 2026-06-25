## Jogo da Velha Multiplayer Online 2026

Jogo da velha multiplayer em tempo real, feito com Node.js, Express e Socket.io.

https://tictactoe-online-hffd.onrender.com

## Stack

- **Backend:** Node.js 18+, Express 4.x, Socket.io 4.x
- **Frontend:** HTML5, CSS3, JavaScript vanilla (sem frameworks)
- **Hospedagem:** Render.com (plano Free, sem cartão de crédito)

## Demonstração rápida

### Tela Inicial: Criar ou Entrar em Sala

Tela de entrada da aplicação com título "JOGO DA VELHA", subtítulo "Multiplayer Online em Tempo Real", campo de nome e botões para criar ou entrar em uma sala existente.
<img width="1154" height="890" alt="3" src="https://github.com/user-attachments/assets/0f6b8757-7f2b-43fd-b915-bc719a82bf2f" />


### Tela de Entrada em Sala: Campo de Código

Tela de acesso com campos para nome do jogador e código da sala (formato ABC123), exibida após clicar em "Entrar em Sala" na tela inicial.
<img width="972" height="804" alt="10" src="https://github.com/user-attachments/assets/0ce60843-ea62-42cc-945f-ea7e93e71bac" />

### Partida Iniciada: Tabuleiro Vazio, Vez de Adriele

Tela de jogo com os dois jogadores conectados (Adriele X e Felipe O), cronômetro ativo no painel de Adriele e tabuleiro limpo aguardando a primeira jogada.
<img width="1154" height="890" alt="4" src="https://github.com/user-attachments/assets/cc9e3e2e-e8dd-42a6-8dee-058d6cc683aa" />

### Partida em Andamento: Tabuleiro Quase Completo

Jogo com 8 das 9 células preenchidas, cronômetros e tempo médio por jogada visíveis para ambos os jogadores, uma célula restante para a jogada decisiva.
<img width="1154" height="890" alt="5" src="https://github.com/user-attachments/assets/fc3461a7-5ceb-442f-83dc-5c2c29738a1d" />

### Resultado: Empate Registrado no Placar

Tela de resultado exibindo "EMPATE!" com placar atualizado (Empates: 1) e botão "Jogar Novamente" disponível para ambos os jogadores reiniciarem a partida.
<img width="1154" height="890" alt="6" src="https://github.com/user-attachments/assets/40a5f577-93d4-4638-9125-b416c298251b" />

### Vitória: Adriele Vence a Rodada

Tela de vitória com animação de confetti, placar atualizado (Adriele 1 × Felipe 0, Empates: 1) e tempo médio de resposta registrado para cada jogador.
<img width="1154" height="890" alt="7" src="https://github.com/user-attachments/assets/2ecf7383-3ca3-4822-b783-a784743b54cd" />

### Sala Criada: Aguardando Oponente com Código Copiado

Tela de espera exibindo o código da sala (4FW2FY) em destaque, feedback visual "Copiado! ✓" após clicar no botão, spinner de carregamento e instrução para compartilhar o código com o oponente.
<img width="977" height="769" alt="8" src="https://github.com/user-attachments/assets/9723100f-23c6-40ed-948e-c44898c23b70" />

### Validação de Sala Cheia: Tentativa de Entrada Bloqueada

Tela de entrada preenchida com nome "Vhagar" e código "SUTM48", exibindo o toast de erro "Sala cheia" ao tentar entrar em uma sala que já possui dois jogadores ativos.
<img width="972" height="804" alt="9" src="https://github.com/user-attachments/assets/d11db1b3-f807-4f71-9145-1b751c9dfa1e" />

---

## Como testar localmente? Vem comigo que eu te mostro como fazer:

```bash
git clone https://github.com/nathadriele/tictactoe-online
cd tictactoe-online
npm install
node server.js
```

Depois abra **duas abas** (ou dois navegadores) em:

```
http://localhost:3000
```

- Na primeira aba: digite seu nome e clique em **Criar Sala**.
- Copie o código de 6 caracteres.
- Na segunda aba: digite outro nome, clique em **Entrar em Sala**, cole o código.
- O jogo começa automaticamente.

---

## Como fazer deploy no Render.com

### 1. Criar conta
- Acesse https://render.com e crie uma conta (pode usar GitHub/Google).
- **Não é necessário cartão de crédito.**

### 2. Subir o código no GitHub
```bash
git init
git add .
git commit -m "Jogo da velha multiplayer online"
git branch -M main
git remote add origin https://github.com/seu-usuario/tictactoe-online.git
git push -u origin main
```

### 3. Criar Web Service no Render
1. No painel do Render, clique em **New +** → **Web Service**.
2. Conecte seu repositório do GitHub (`tictactoe-online`).
3. Preencha:
   - **Name:** `tictactoe-online` (ou o nome que preferir)
   - **Branch:** `main`
   - **Runtime:** Node (detectado automaticamente)
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** **Free**
4. Clique em **Create Web Service**.
5. Aguarde o deploy (2–3 minutos na primeira vez).

### 4. Acessar a URL pública
Após o deploy, o Render gera uma URL no formato:

```
https://tictactoe-online-xxxx.onrender.com
```

Esta URL é permanente e pode ser acessada de qualquer lugar.

---

## Aviso sobre Cold Start (Render Free)

No plano gratuito, o servidor **hiberna após 15 minutos** sem acesso.
O primeiro acesso após hibernação pode levar **30–50 segundos** para "acordar".

**Como lidar:**
- Abra a URL no navegador e **aguarde o carregamento completo** antes de chamar o oponente.
- A aplicação já inclui **retry automático** com Socket.io (10 tentativas com backoff).
- Se aparecer "Conectando ao servidor...", basta aguardar, a conexão será restabelecida.

---

## Como jogar online

1. **Jogador 1:**
   - Acessa a URL pública.
   - Digita seu nome.
   - Clica em **Criar Sala**.
   - Copia o código de 6 caracteres exibido na tela.
   - Envia o código para o oponente.

2. **Jogador 2:**
   - Acessa a **mesma URL**.
   - Digita seu nome.
   - Clica em **Entrar em Sala**.
   - Cola o código de 6 caracteres.
   - O jogo começa automaticamente quando ambos estão conectados.

3. **Durante o jogo:**
   - O tabuleiro mostra de quem é a vez.
   - Clique em uma célula vazia para marcar.
   - O cronômetro mostra quanto tempo cada jogador leva.
   - Ao final, clique em **Jogar Novamente** para revanche.

---

## Estrutura do projeto atual

```
tictactoe-online/
├── server.js          # Servidor Node.js + Socket.io
├── public/
│   └── index.html     # Frontend completo (HTML+CSS+JS)
├── package.json       # Dependências e scripts
├── render.yaml        # Configuração do Render
├── .gitignore
└── README.md
```

---

## Jogo da Velha Multiplayer Online - Alguns testes no ambiente local

<img width="575" height="919" alt="1" src="https://github.com/user-attachments/assets/d68217f8-f6c4-42db-929a-498e8c407dad" />

---

## Recursos atuais

- Salas com código único de 6 caracteres
- Reconexão automática (desconexão temporária)
- Persistência de sessão via `localStorage`
- Cronômetro e estatísticas de tempo por jogador
- Indicador de conexão (Online/Offline) em tempo real
- Revanche com votação e timeout de 30s
- Placar de vitórias e empates
- Design responsivo (mobile-first)
- Celebração com confetti em vitórias
- Suporte a `prefers-reduced-motion`
