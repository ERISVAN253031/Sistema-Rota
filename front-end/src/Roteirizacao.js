import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Roteirizacao = () => {
  const [cep, setCep] = useState('');
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(false);

  const validarCep = (cep) => {
    return /^\d{8}$/.test(cep);
  };

  const buscarEndereco = async (cep) => {
    if (!validarCep(cep)) {
      alert('CEP inválido. Por favor, insira um CEP válido.');
      return;
    }

    setLoading(true);
    try {
      const resposta = await axios.get(`http://localhost:5000/enderecos/${cep}`);
      console.log(resposta.data); // Verifique a estrutura da resposta

      if (resposta.data) {
        const { cep, endereco, bairro, zona_nome, motorista, placa } = resposta.data;

        const novoEndereco = {
          cep,
          endereco,
          bairro,
          zona: zona_nome,
          motorista,
          placa,
        };

        const cepExistente = enderecos.find(endereco => endereco.cep === cep);
        if (cepExistente) {
          alert('Este CEP já foi adicionado.');
          return;
        }

        setEnderecos((prev) => [...prev, novoEndereco]);
        setCep('');
      } else {
        alert('CEP não encontrado');
      }
    } catch (error) {
      console.error("Cep não cadastrado:", error.response ? error.response.data : error.message);
      alert('Cep não cadastrado.');
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = () => {
    const doc = new jsPDF('landscape', 'pt', 'a4');
    doc.setFontSize(16);

    doc.text('Manifesto de Roteirização', 20, 40);

    if (enderecos.length > 0) {
      const motoristaInfo = `Motorista: ${enderecos[0].motorista} - Placa: ${enderecos[0].placa}`;
      const zonaInfo = `ZONA: ${enderecos[0].zona}`;

      doc.text(motoristaInfo, 20, 70); // Ajuste a posição conforme necessário
      doc.text(zonaInfo, 20, 100);
      const startY = 120; // Ajuste a posição da tabela

      const tableData = enderecos.map((endereco) => [
        endereco.cep,
        endereco.endereco,
        endereco.bairro,
        endereco.zona,
      ]);

      doc.autoTable({
        head: [['CEP', 'Endereço', 'Bairro', 'ZONA']],
        body: tableData,
        startY: startY,
        margin: { horizontal: 10 },
      });

      doc.text(`Total de Endereços: ${enderecos.length}`, 20, doc.autoTable.previous.finalY + 20);
    }

    doc.save('manifesto_roteirizacao.pdf');
  };

  const excluirEndereco = (index) => {
    setEnderecos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="container">
      <h1>Sistema de Roteirização</h1>
      <form onSubmit={(e) => { e.preventDefault(); buscarEndereco(cep); }}>
        <input
          type="text"
          value={cep}
          onChange={(e) => setCep(e.target.value)}
          placeholder="Insira o CEP"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Adicionar Endereço'}
        </button>
      </form>

      <h2>Endereços Adicionados</h2>
      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>CEP</th>
              <th>Endereço</th>
              <th>Bairro</th>
              <th>ZONA</th>
              <th>Motorista</th>
              <th>Placa</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {enderecos.map((endereco, index) => (
              <tr key={index}>
                <td>{endereco.cep}</td>
                <td>{endereco.endereco}</td>
                <td>{endereco.bairro}</td>
                <td>{endereco.zona}</td>
                <td>{endereco.motorista}</td>
                <td>{endereco.placa}</td>
                <td>
                  <button onClick={() => excluirEndereco(index)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Total de Endereços: {enderecos.length}</h3>

      {enderecos.length > 0 && (
        <button className="manifesto" onClick={gerarPDF}>Gerar Manifesto</button>
      )}
    </div>
  );
};

export default Roteirizacao;