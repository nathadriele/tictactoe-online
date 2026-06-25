// =============================================================
// Jogo da Velha Multiplayer Online - Servidor
// Node.js + Express + Socket.io
// =============================================================

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Inicializa aplicação Express e servidor HTTP
const app = express();
const server = http.createServer(app);

// Configura Socket.io com CORS liberado (necessário para Render)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Serve os arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------
// Estrutura de dados das salas ativas
// -------------------------------------------------------------
const rooms = {};

// Linhas vencedoras do jogo da velha (8 combinações)
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas horizontais
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas verticais
  [0, 4, 8], [2, 4, 6]             // diagonais
];

// -------------------------------------------------------------
// Gera código de sala único (6 caracteres, sem ambíguos)
// -------------------------------------------------------------
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sem 0, O, I, 1
  let code;
  do {
    code = Array.from({ length: 6 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  } while (rooms[code]); // garante unicidade
  return code;
}

// -------------------------------------------------------------
// Verifica se há vencedor ou empate no tabuleiro
// -------------------------------------------------------------
function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  // Se todas as células estão preenchidas e ninguém venceu = empate
  if (board.every(cell => cell !== null)) return { winner: 'draw' };
  return null;
}

// -------------------------------------------------------------
// Constrói o objeto de placar a partir de uma sala
// -------------------------------------------------------------
function obterPlacar(room) {
  return {
    wins: [room.players[0].wins, room.players[1].wins],
    draws: room.draws
  };
}

// -------------------------------------------------------------
// Encontra todas as salas das quais um socket participa
// -------------------------------------------------------------
function encontrarSalasDoSocket(socketId) {
  const resultado = [];
  for (const code of Object.keys(rooms)) {
    const room = rooms[code];
    const idx = room.players.findIndex(p => p.id === socketId);
    if (idx !== -1) {
      resultado.push({ code, room, playerIndex: idx });
    }
  }
  return resultado;
}

// =============================================================
// Eventos do Socket.io
// =============================================================
io.on('connection', (socket) => {
  console.log(`[Conexão] Novo socket conectado: ${socket.id}`);

  // -----------------------------------------------------------
  // Criar sala: jogador torna-se X (índice 0)
  // -----------------------------------------------------------
  socket.on('create_room', ({ name }) => {
    // Limpa qualquer participação anterior deste socket em outras salas
    const salasAnteriores = encontrarSalasDoSocket(socket.id);
    for (const entry of salasAnteriores) {
      if (entry.room.players[entry.playerIndex]) {
        entry.room.players[entry.playerIndex].id = null;
      }
      // Sai da sala antiga do Socket.io para não receber eventos fantasma
      socket.leave(entry.code);
    }

    const roomCode = generateRoomCode();
    rooms[roomCode] = {
      players: [
        {
          id: socket.id,
          name: name || 'Jogador 1',
          symbol: 'X',
          wins: 0,
          connected: true
        },
        {
          id: null,
          name: '',
          symbol: 'O',
          wins: 0,
          connected: false
        }
      ],
      board: Array(9).fill(null),
      currentTurn: 0,
      draws: 0,
      gameActive: false,
      turnStartTime: null,
      rematchVotes: [],
      rematchTimeout: null,
      disconnectTimeout: null,
      firstPlayer: 0 // quem começa a próxima rodada (alterna ao revanche)
    };

    socket.join(roomCode);
    socket.emit('room_created', {
      roomCode,
      playerIndex: 0,
      symbol: 'X'
    });

    console.log(`[Sala] Criada: ${roomCode} por ${name} (${socket.id})`);
  });

  // -----------------------------------------------------------
  // Entrar em sala: jogador torna-se O (índice 1)
  // -----------------------------------------------------------
  socket.on('join_room', ({ roomCode, name }) => {
    roomCode = (roomCode || '').toUpperCase().trim();
    const room = rooms[roomCode];

    // Sala não existe
    if (!room) {
      socket.emit('error', { message: 'Sala não encontrada' });
      return;
    }

    // Sala já tem 2 jogadores
    if (room.players[0].id && room.players[1].id) {
      socket.emit('error', { message: 'Sala cheia' });
      return;
    }

    // Preenche o segundo jogador
    room.players[1] = {
      id: socket.id,
      name: name || 'Jogador 2',
      symbol: 'O',
      wins: 0,
      connected: true
    };

    // Inicia o jogo
    room.board = Array(9).fill(null);
    room.currentTurn = 0; // X sempre começa a primeira rodada
    room.draws = 0;
    room.gameActive = true;
    room.turnStartTime = Date.now();
    room.rematchVotes = [];

    socket.join(roomCode);

    // Cancela timeout de desconexão se o jogador 1 estava "sumido"
    if (room.disconnectTimeout) {
      clearTimeout(room.disconnectTimeout);
      room.disconnectTimeout = null;
    }

    // Emite "joined" APENAS para o socket que entrou (informa seu índice/símbolo)
    socket.emit('joined', {
      roomCode,
      playerIndex: 1,
      symbol: 'O'
    });

    // Emite game_start para AMBOS os jogadores
    io.to(roomCode).emit('game_start', {
      board: room.board,
      players: room.players.map(p => ({
        name: p.name,
        symbol: p.symbol,
        wins: p.wins,
        connected: p.connected
      })),
      currentTurn: room.currentTurn,
      scores: obterPlacar(room),
      turnStartTime: room.turnStartTime
    });

    console.log(`[Sala] ${name} entrou em ${roomCode}. Jogo iniciado.`);
  });

  // -----------------------------------------------------------
  // Fazer jogada
  // -----------------------------------------------------------
  socket.on('make_move', ({ roomCode, position, playerIndex }) => {
    const room = rooms[roomCode];
    if (!room) return;

    // Valida se o jogo está ativo
    if (!room.gameActive) return;

    // Valida se é o turno do jogador que enviou
    if (room.currentTurn !== playerIndex) return;

    // Valida se o socket que enviou é realmente o jogador daquele índice
    const jogador = room.players[playerIndex];
    if (!jogador || jogador.id !== socket.id) return;

    // Valida posição (0-8) e se está vazia
    if (position < 0 || position > 8 || room.board[position] !== null) return;

    // Atualiza o tabuleiro
    const symbol = jogador.symbol;
    room.board[position] = symbol;

    // Calcula tempo da jogada
    const moveTime = room.turnStartTime
      ? Math.round((Date.now() - room.turnStartTime) / 1000)
      : 0;

    // Verifica vitória ou empate
    const resultado = checkWinner(room.board);

    if (resultado) {
      // Fim de jogo
      room.gameActive = false;

      if (resultado.winner === 'draw') {
        room.draws++;
        io.to(roomCode).emit('game_over', {
          winner: null,
          winLine: null,
          board: room.board,
          scores: obterPlacar(room),
          moveTime,
          lastMoverIndex: playerIndex // quem fez a jogada final
        });
        console.log(`[Sala ${roomCode}] Empate.`);
      } else {
        // Vencedor: incrementa wins
        const idxVencedor = resultado.winner === 'X' ? 0 : 1;
        room.players[idxVencedor].wins++;
        io.to(roomCode).emit('game_over', {
          winner: idxVencedor,
          winLine: resultado.line,
          board: room.board,
          scores: obterPlacar(room),
          moveTime,
          lastMoverIndex: playerIndex // quem fez a jogada final
        });
        console.log(`[Sala ${roomCode}] Jogador ${idxVencedor} venceu.`);
      }
    } else {
      // Jogo continua: alterna turno
      room.currentTurn = room.currentTurn === 0 ? 1 : 0;
      room.turnStartTime = Date.now();

      io.to(roomCode).emit('move_made', {
        board: room.board,
        currentTurn: room.currentTurn,
        position,
        symbol,
        turnStartTime: room.turnStartTime,
        moveTime
      });
    }
  });

  // -----------------------------------------------------------
  // Jogar novamente (revanche)
  // -----------------------------------------------------------
  socket.on('play_again', ({ roomCode, playerIndex }) => {
    const room = rooms[roomCode];
    if (!room) return;

    // Adiciona voto sem duplicata
    if (!room.rematchVotes.includes(playerIndex)) {
      room.rematchVotes.push(playerIndex);
    }

    // Cancela timeout anterior se existir
    if (room.rematchTimeout) {
      clearTimeout(room.rematchTimeout);
      room.rematchTimeout = null;
    }

    if (room.rematchVotes.length === 1) {
      // Apenas um votou: avisa o outro
      socket.to(roomCode).emit('waiting_rematch', {
        voter: playerIndex
      });

      // Define timeout de 30s
      room.rematchTimeout = setTimeout(() => {
        if (room.rematchVotes.length < 2) {
          // Segundo jogador não votou a tempo
          io.to(roomCode).emit('rematch_timeout', {
            message: 'Oponente não respondeu. Aguardando nova resposta.'
          });
          room.rematchVotes = [];
          room.rematchTimeout = null;
        }
      }, 30000);
    } else if (room.rematchVotes.length === 2) {
      // Ambos votaram: reinicia o jogo
      // Alterna quem começa: quem perdeu começa a próxima rodada
      // (na primeira revanche, alterna simplesmente)
      room.firstPlayer = room.firstPlayer === 0 ? 1 : 0;
      room.currentTurn = room.firstPlayer;
      room.board = Array(9).fill(null);
      room.gameActive = true;
      room.turnStartTime = Date.now();
      room.rematchVotes = [];

      if (room.rematchTimeout) {
        clearTimeout(room.rematchTimeout);
        room.rematchTimeout = null;
      }

      io.to(roomCode).emit('game_restart', {
        board: room.board,
        currentTurn: room.currentTurn,
        scores: obterPlacar(room),
        turnStartTime: room.turnStartTime
      });

      console.log(`[Sala ${roomCode}] Revanche iniciada.`);
    }
  });

  // -----------------------------------------------------------
  // Reconexão de jogador
  // -----------------------------------------------------------
  socket.on('reconnect_room', ({ roomCode, playerName, playerIndex }) => {
    roomCode = (roomCode || '').toUpperCase().trim();
    const room = rooms[roomCode];

    if (!room) {
      socket.emit('error', { message: 'Sala não encontrada' });
      return;
    }

    const jogador = room.players[playerIndex];
    if (!jogador || jogador.name !== playerName) {
      socket.emit('error', { message: 'Não foi possível reconectar: dados inválidos' });
      return;
    }

    // Guarda: se o socket original ainda está conectado e ativo, não permite hijack
    if (jogador.connected && jogador.id && jogador.id !== socket.id) {
      const socketOriginal = io.sockets.sockets.get(jogador.id);
      if (socketOriginal && socketOriginal.connected) {
        socket.emit('error', { message: 'Este jogador já está conectado em outra aba.' });
        return;
      }
    }

    // Atualiza o socket.id do jogador
    jogador.id = socket.id;
    jogador.connected = true;
    socket.join(roomCode);

    // Cancela timeout de desconexão (60s)
    if (room.disconnectTimeout) {
      clearTimeout(room.disconnectTimeout);
      room.disconnectTimeout = null;
    }

    // Emite estado completo para o jogador reconectado
    socket.emit('reconnected', {
      board: room.board,
      scores: obterPlacar(room),
      currentTurn: room.currentTurn,
      turnStartTime: room.turnStartTime,
      gameActive: room.gameActive,
      players: room.players.map(p => ({
        name: p.name,
        symbol: p.symbol,
        wins: p.wins,
        connected: p.connected
      }))
    });

    // Avisa o outro jogador
    socket.to(roomCode).emit('opponent_reconnected', {
      message: 'Oponente reconectado!'
    });

    console.log(`[Sala ${roomCode}] Jogador ${playerIndex} (${playerName}) reconectou.`);
  });

  // -----------------------------------------------------------
  // Desconexão
  // -----------------------------------------------------------
  socket.on('disconnect', () => {
    console.log(`[Desconexão] Socket: ${socket.id}`);

    const participacoes = encontrarSalasDoSocket(socket.id);

    for (const { code, room, playerIndex } of participacoes) {
      // Marca como desconectado
      room.players[playerIndex].connected = false;

      // Avisa o outro jogador
      socket.to(code).emit('opponent_disconnected', {
        message: 'Oponente desconectado. Aguardando reconexão por até 60 segundos...'
      });

      // Define timeout de 60s: se não reconectar, remove a sala
      if (room.disconnectTimeout) clearTimeout(room.disconnectTimeout);
      room.disconnectTimeout = setTimeout(() => {
        if (rooms[code]) {
          // Verifica se ainda está desconectado
          if (!room.players[playerIndex].connected) {
            io.to(code).emit('opponent_left', {
              message: 'Oponente saiu da partida.'
            });
            delete rooms[code];
            console.log(`[Sala ${code}] Removida por inatividade.`);
          }
        }
      }, 60000);
    }
  });
});

// =============================================================
// Inicialização do servidor
// =============================================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
