const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');

const client = new Client({
    authStrategy: new LocalAuth()
});

const clientes = {};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('🤖 Bot da Pizzaria do Leo está pronto!');
});

client.on('message', async (msg) => {
    const numero = msg.from;
    const texto = msg.body.trim();

    if (!clientes[numero]) {
        clientes[numero] = { etapa: 1 };
        client.sendMessage(numero, '🍕 Olá! Bem-vindo à *Pizzaria do Leo*! Digite o(s) sabor(es) da pizza que deseja pedir:');
        return;
    }

    const cliente = clientes[numero];

    if (cliente.etapa === 1) {
        cliente.itens = texto.split(',').map(i => i.trim());
        cliente.etapa = 2;
        client.sendMessage(numero, '📍 Informe seu *endereço* para entrega:');

    } else if (cliente.etapa === 2) {
        cliente.endereco = texto;
        cliente.etapa = 3;
        client.sendMessage(numero, '💳 Escolha a *forma de pagamento*:\n1️⃣ Dinheiro\n2️⃣ Cartão\n3️⃣ Pix');

    } else if (cliente.etapa === 3) {
        const pagamentos = { '1': 'Dinheiro', '2': 'Cartão', '3': 'Pix' };
        cliente.pagamento = pagamentos[texto] || texto;
        cliente.etapa = 4;
        client.sendMessage(numero, '⏰ Deseja *agendar a entrega*? Digite o horário (ex: 19:30) ou "agora":');

    } else if (cliente.etapa === 4) {
        cliente.horario = texto.toLowerCase() === 'agora' ? 'Agora' : texto;

        const pedido = {
            numero,
            nome: '',
            itens: cliente.itens,
            endereco: cliente.endereco,
            pagamento: cliente.pagamento,
            horario: cliente.horario
        };

        // Envia para o painel web
        try {
            await axios.post('http://localhost:3000/novo-pedido', pedido);
        } catch (e) {
            console.error('❌ Erro ao enviar pedido ao painel:', e.message);
        }

        // Monta o texto do pedido para impressão
        const textoImpressao = `
📄 NOVO PEDIDO - PIZZARIA DO LEO

📱 Cliente: ${numero}
📍 Endereço: ${cliente.endereco}
🍕 Itens: ${cliente.itens.join(', ')}
💳 Pagamento: ${cliente.pagamento}
⏰ Entrega: ${cliente.horario}
        `.trim();

        console.log('\n--- Pedido Recebido ---\n' + textoImpressao + '\n-----------------------');

        // Salva o pedido como arquivo .txt
        const nomeArquivo = `pedido-${Date.now()}.txt`;
        fs.writeFileSync(nomeArquivo, textoImpressao);

        // Envia para impressora padrão no Windows
        exec(`powershell.exe Start-Process -FilePath "${nomeArquivo}" -Verb Print`);

        // Mensagem final para o cliente
        client.sendMessage(numero, '✅ *Pedido realizado com sucesso!* Obrigado por comprar conosco.');

        // Limpa o cliente
        delete clientes[numero];
    }
});

client.initialize();