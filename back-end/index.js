const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 5000; // Porta da API

app.use(cors());
app.use(express.json()); // Middleware para analisar JSON

// Conectar ao banco de dados MySQL
const db = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'Josesales25303131@',
  database: 'Cadastros'
});

// Conectar ao banco de dados
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados MySQL:', err.message);
  } else {
    console.log('Conectado ao banco de dados MySQL.');
  }
});

// Criar as tabelas se não existirem
const createTables = () => {
  db.query(`CREATE TABLE IF NOT EXISTS zonas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela zonas:', err.message);
    }
  });

  db.query(`CREATE TABLE IF NOT EXISTS motoristas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    placa VARCHAR(20) NOT NULL,
    zona_id INT,
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela motoristas:', err.message);
    }
  });

  db.query(`CREATE TABLE IF NOT EXISTS enderecos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cep VARCHAR(8) NOT NULL UNIQUE,
    endereco VARCHAR(255) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    zona_id INT,
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
  )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela enderecos:', err.message);
    }
  });
};

createTables();

// Rota para obter todas as zonas
app.get('/zonas', (req, res) => {
  const sql = 'SELECT * FROM zonas';
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao obter zonas' });
    }
    res.status(200).json(results);
  });
});

// Rota para cadastrar motoristas
app.post('/motoristas', (req, res) => {
  const { nome, placa, zona_id } = req.body;

  // Verificar se a zona_id existe
  const checkZonaSql = 'SELECT * FROM zonas WHERE id = ?';
  db.query(checkZonaSql, [zona_id], (err, zonaResults) => {
    if (err || zonaResults.length === 0) {
      return res.status(400).json({ message: 'Zona inválida' });
    }

    // Inserir o novo motorista
    const sql = 'INSERT INTO motoristas (nome, placa, zona_id) VALUES (?, ?, ?)';
    db.query(sql, [nome, placa, zona_id], (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar motorista:', err.message);
        return res.status(500).json({ message: 'Erro ao cadastrar motorista' });
      }
      res.status(201).json({ message: 'Motorista cadastrado com sucesso!', id: result.insertId });
    });
  });
});

// Rota para obter todos os motoristas
app.get('/motoristas/filter', (req, res) => {
  const { nome, placa, zona_id } = req.query;
  let sql = 'SELECT motoristas.*, zonas.nome AS zona_nome FROM motoristas LEFT JOIN zonas ON motoristas.zona_id = zonas.id';
  const params = [];

  // Adiciona condições para a consulta
  if (nome) {
    sql += ' WHERE motoristas.nome LIKE ?';
    params.push(`%${nome}%`);
  }
  if (placa) {
    sql += (params.length ? ' AND' : ' WHERE') + ' motoristas.placa LIKE ?';
    params.push(`%${placa}%`);
  }
  if (zona_id) {
    sql += (params.length ? ' AND' : ' WHERE') + ' motoristas.zona_id = ?';
    params.push(zona_id);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erro ao buscar motoristas:', err.message);
      return res.status(500).json({ message: 'Erro ao buscar motoristas' });
    }
    res.status(200).json(results);
  });
});

// Rota para editar motoristas
app.put('/motoristas/:id', (req, res) => {
  const { id } = req.params;
  const { nome, placa, zona_id } = req.body;

  // Verificar se a zona_id existe
  const checkZonaSql = 'SELECT * FROM zonas WHERE id = ?';
  db.query(checkZonaSql, [zona_id], (err, zonaResults) => {
    if (err || zonaResults.length === 0) {
      return res.status(400).json({ message: 'Zona inválida' });
    }

    // Atualizar o motorista
    const sql = 'UPDATE motoristas SET nome = ?, placa = ?, zona_id = ? WHERE id = ?';
    db.query(sql, [nome, placa, zona_id, id], (err) => {
      if (err) {
        console.error('Erro ao atualizar motorista:', err.message);
        return res.status(500).json({ message: 'Erro ao atualizar motorista' });
      }
      res.status(200).json({ message: 'Motorista atualizado com sucesso!' });
    });
  });
});

// Rota para excluir motoristas
app.delete('/motoristas/:id', (req, res) => {
  const { id } = req.params;

  // Excluir o motorista
  const sql = 'DELETE FROM motoristas WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Erro ao excluir motorista:', err.message);
      return res.status(500).json({ message: 'Erro ao excluir motorista' });
    }
    res.status(200).json({ message: 'Motorista excluído com sucesso!' });
  });
});

// Rota para cadastrar endereços
app.post('/enderecos', (req, res) => {
  const { cep, endereco, bairro, zona_id } = req.body;

  // Verificar se a zona_id existe
  const checkZonaSql = 'SELECT * FROM zonas WHERE id = ?';
  db.query(checkZonaSql, [zona_id], (err, zonaResults) => {
    if (err || zonaResults.length === 0) {
      return res.status(400).json({ message: 'Zona inválida' });
    }

    // Verificar se o CEP já está cadastrado
    const checkCepSql = 'SELECT * FROM enderecos WHERE cep = ?';
    db.query(checkCepSql, [cep], (err, cepResults) => {
      if (err) {
        console.error('Erro ao verificar CEP:', err.message);
        return res.status(500).json({ message: 'Erro ao verificar CEP' });
      }
      if (cepResults.length > 0) {
        return res.status(400).json({ message: 'CEP já cadastrado' });
      }

      // Se o CEP não estiver cadastrado, prosseguir com a inserção
      const sql = 'INSERT INTO enderecos (cep, endereco, bairro, zona_id) VALUES (?, ?, ?, ?)';
      db.query(sql, [cep, endereco, bairro, zona_id], (err, result) => {
        if (err) {
          console.error('Erro ao cadastrar endereço:', err.message);
          return res.status(500).json({ message: 'Erro ao cadastrar endereço' });
        }
        res.status(201).json({ message: 'Endereço cadastrado com sucesso!', id: result.insertId });
      });
    });
  });
});

// Nova rota para buscar endereço pelo CEP
app.get('/enderecos/:cep', (req, res) => {
  const { cep } = req.params;

  // Buscar o endereço pelo CEP
  const sql = `
    SELECT enderecos.*, zonas.nome AS zona_nome, motoristas.nome AS motorista, motoristas.placa
    FROM enderecos
    LEFT JOIN zonas ON enderecos.zona_id = zonas.id
    LEFT JOIN motoristas ON motoristas.zona_id = enderecos.zona_id
    WHERE enderecos.cep = ?
  `;

  db.query(sql, [cep], (err, results) => {
    if (err) {
      console.error('Erro ao buscar endereço:', err); // Mostra o erro completo
      return res.status(500).json({ message: 'Erro ao buscar endereço' });
    }
    if (results.length > 0) {
      res.status(200).json(results[0]);
    } else {
      // Mensagem de erro atualizada
      res.status(404).json({ message: 'CEP não cadastrado' });
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Fechar a conexão ao encerrar o servidor
process.on('SIGINT', () => {
  db.end(err => {
    if (err) {
      return console.error('Erro ao fechar a conexão com o banco de dados:', err.message);
    }
    console.log('Conexão com o banco de dados encerrada.');
    process.exit(0);
  });
});