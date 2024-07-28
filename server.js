const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000; // Alterado para a porta 5000

// Configuração do Body Parser
app.use(bodyParser.json());

// Configuração da conexão com o banco de dados
const pool = new Pool({
    connectionString: 'postgres://pydentech:DeD-140619@pyden-express.cjucwyoced9l.sa-east-1.rds.amazonaws.com:5432/pyden-express'
});

// Endpoint para registrar motoristas
app.post('/api/registroMotoristasAdministrativos', async (req, res) => {
    const {
        nome_completo,
        cpf,
        cnh,
        email,
        password,
        empresa,
        tipo_veiculo,
        modelo,
        placa
    } = req.body;

    // Verificação de dados faltantes
    if (
        !nome_completo ||
        !cpf ||
        !cnh ||
        !email ||
        !password ||
        !empresa ||
        !tipo_veiculo ||
        !modelo ||
        !placa
    ) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir dados na tabela motoristas_administrativos
        const query = `
      INSERT INTO motoristas_administrativos
      (nome_completo, cpf, cnh, email, password, empresa, tipo_veiculo, modelo, placa)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;

        const values = [
            nome_completo,
            cpf,
            cnh,
            email,
            hashedPassword,
            empresa,
            tipo_veiculo,
            modelo,
            placa
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Motorista registrado com sucesso',
            motoristaId: result.rows[0].id
        });
    } catch (error) {
        console.error('Erro ao registrar motorista:', error);
        res.status(500).json({ error: 'Erro ao registrar motorista' });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
