const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

const pool = new Pool({
    connectionString: 'postgres://pydentech:DeD-140619@pyden-express.cjucwyoced9l.sa-east-1.rds.amazonaws.com:5432/pyden-express',
});

app.use(bodyParser.json());

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
        placa,
    } = req.body;

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
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO motoristas_administrativos (nome_completo, cpf, cnh, email, senha, empresa, tipo_veiculo, modelo, placa)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
            [nome_completo, cpf, cnh, email, hashedPassword, empresa, tipo_veiculo, modelo, placa]
        );

        res.status(201).json({ id: result.rows[0].id, message: 'Motorista registrado com sucesso' });
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'CPF, CNH, email ou placa já cadastrados' });
        } else {
            res.status(500).json({ error: 'Erro ao registrar motorista' });
        }
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
