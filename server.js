const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Armazena os pedidos recebidos
const pedidos = [];

// Quando o painel abrir, envia os pedidos já feitos
io.on('connection', (socket) => {
    console.log('🖥️ Painel conectado');
    socket.emit('pedidos', pedidos);
});

// Endpoint para receber pedidos do bot
app.use(express.json());
app.post('/novo-pedido', (req, res) => {
    const pedido = req.body;
    pedidos.push(pedido);
    io.emit('novo-pedido', pedido);
    res.sendStatus(200);
});

// Servir painel HTML
app.use(express.static(path.join(__dirname, 'painel')));

server.listen(3000, () => {
    console.log('✅ Painel disponível em http://localhost:3000');
});
