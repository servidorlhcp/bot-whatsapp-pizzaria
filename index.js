const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Cria o cliente com autenticação local (salva a sessão no computador)
const client = new Client({
    authStrategy: new LocalAuth()
});

// Gera o QR code no terminal
client.on('qr', qr => {
    console.log('📱 Escaneie o QR Code com seu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Confirma quando o bot estiver pronto
client.on('ready', () => {
    console.log('✅ Bot está online!');
});

// Quando receber uma mensagem
client.on('message', msg => {
    const texto = msg.body.toLowerCase(); // Transforma em minúsculo para evitar erros


    if (texto === 'Boa noite') {
        msg.reply(
            `📋 *Menu Interativo*\n` +
            `1️⃣ Fazer pedido\n` +
            `2️⃣ Falar com um atendente\n` +
            `3️⃣ Encerrar conversa`
        );
    }

    if (texto === '1') {
        msg.reply('📦 Cardápio');
    }

    if (texto === '2') {
        msg.reply('👩‍💼 Um atendente será acionado em breve...');
    }

    if (texto === '3') {
        msg.reply('✅ Obrigado pelo contato! Encerramos por aqui.');
    }
});

// Inicializa o bot
client.initialize();
