## Jogo da Velha Multiplayer Online 2026

Jogo da velha multiplayer em tempo real, feito com Node.js, Express e Socket.io.

## Stack

- **Backend:** Node.js 18+, Express 4.x, Socket.io 4.x
- **Frontend:** HTML5, CSS3, JavaScript vanilla (sem frameworks)
- **Hospedagem:** Render.com (plano Free, sem cartão de crédito)

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
- Se aparecer "Conectando ao servidor...", basta aguardar — a conexão será restabelecida.

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
