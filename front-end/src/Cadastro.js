import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importando useNavigate
import logo from "../src/assets/Logo.jpeg"; // Ajuste o caminho conforme a nova localização
const Cadastro = () => {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [zona_id, setZona] = useState("");
  const [zonasDisponiveis, setZonasDisponiveis] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate(); // Criando a instância de navegação

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/zonas");
        setZonasDisponiveis(response.data);
      } catch (error) {
        console.error("Erro ao buscar zonas:", error);
      }
    };

    fetchZonas();
  }, []);

  const buscarEndereco = async (cep) => {
    try {
      const resposta = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (resposta.data && !resposta.data.erro) {
        const { logradouro, bairro } = resposta.data;
        setEndereco(logradouro);
        setBairro(bairro);
      } else {
        alert("CEP não encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      alert("Erro ao buscar o CEP. Tente novamente.");
    }
  };

  const handleZonaChange = (e) => {
    setZona(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se todos os campos estão preenchidos corretamente
    if (!zona_id || !cep || !endereco || !bairro) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    const dadosParaEnviar = {
      cep,
      endereco,
      bairro,
      zona_id: parseInt(zona_id), // Assegure-se de que zona_id é um número
    };

    try {
      const resposta = await axios.post(
        "http://localhost:5000/enderecos",
        dadosParaEnviar
      );
      if (resposta.status === 201) {
        setMensagem("Endereço cadastrado com sucesso!");
        // Limpar campos
        setCep("");
        setEndereco("");
        setBairro("");
        setZona("");
      }
    } catch (error) {
      console.error(
        "Erro ao cadastrar:",
        error.response ? error.response.data : error.message
      );
      alert(
        error.response?.data.message ||
          "Erro ao cadastrar! Verifique os dados e tente novamente."
      );
    }
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo" />
      <h2 style={{ marginLeft: "140px" }}>Cadastro de Endereço</h2>
      <button
        onClick={() => navigate("/alterar-cadastro")}
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        Cadastro de Motorista
      </button>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={cep}
          onChange={(e) => {
            setCep(e.target.value);
            if (e.target.value.length === 8) {
              buscarEndereco(e.target.value);
            }
          }}
          placeholder="Insira o CEP"
          required
        />
        <input type="text" value={endereco} readOnly placeholder="Endereço" />
        <input
          type="text"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          placeholder="Insira o bairro"
          required
        />
        <select value={zona_id} onChange={handleZonaChange} required>
          <option value="">Selecione uma zona</option>
          {zonasDisponiveis.map((zona) => (
            <option key={zona.id} value={zona.id}>
              {zona.nome}
            </option>
          ))}
        </select>
        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <div className="alerta-sucesso">{mensagem}</div>}
    </div>
  );
};

export default Cadastro;
