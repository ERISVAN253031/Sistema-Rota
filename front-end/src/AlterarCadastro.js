import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Importando useNavigate
import logo from "../src/assets/Logo.jpeg"; // Ajuste o caminho conforme a nova localização

const AlterarCadastro = () => {
  const [motoristas, setMotoristas] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [filters, setFilters] = useState({ nome: "", placa: "", zona_id: "" });
  const [selectedMotorista, setSelectedMotorista] = useState(null);
  const [loading, setLoading] = useState(false);
  const [novoMotorista, setNovoMotorista] = useState({
    nome: "",
    placa: "",
    zona_id: "",
  });
  const navigate = useNavigate(); // Criando a instância de navegação

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/zonas");
        setZonas(response.data);
      } catch (error) {
        console.error("Erro ao buscar zonas:", error);
      }
    };
    fetchZonas();
  }, []);

  useEffect(() => {
    const fetchMotoristas = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/motoristas/filter",
          { params: filters }
        );
        setMotoristas(response.data);
      } catch (error) {
        console.error("Erro ao buscar motoristas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMotoristas();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleNovoMotoristaChange = (e) => {
    const { name, value } = e.target;
    setNovoMotorista((prev) => ({ ...prev, [name]: value }));
  };

  const cadastrarMotorista = async () => {
    try {
      await axios.post("http://localhost:5000/motoristas", novoMotorista);
      alert("Motorista cadastrado com sucesso!");
      setNovoMotorista({ nome: "", placa: "", zona_id: "" });
      setFilters({ nome: "", placa: "", zona_id: "" });
    } catch (error) {
      console.error(
        "Erro ao cadastrar motorista:",
        error.response ? error.response.data : error.message
      );
      alert(
        error.response
          ? error.response.data.message
          : "Erro ao cadastrar motorista"
      );
    }
  };

  const handleEditMotorista = (motorista) => {
    setSelectedMotorista(motorista);
  };

  const atualizarMotorista = async () => {
    if (selectedMotorista) {
      try {
        await axios.put(
          `http://localhost:5000/motoristas/${selectedMotorista.id}`,
          selectedMotorista
        );
        alert("Motorista atualizado com sucesso!");
        setSelectedMotorista(null);
        setFilters({ nome: "", placa: "", zona_id: "" });
      } catch (error) {
        console.error(
          "Erro ao atualizar motorista:",
          error.response ? error.response.data : error.message
        );
        alert(
          error.response
            ? error.response.data.message
            : "Erro ao atualizar motorista"
        );
      }
    }
  };

  const excluirMotorista = async (id) => {
    if (window.confirm("Você tem certeza que deseja excluir este motorista?")) {
      try {
        await axios.delete(`http://localhost:5000/motoristas/${id}`);
        setMotoristas((prev) =>
          prev.filter((motorista) => motorista.id !== id)
        );
        alert("Motorista excluído com sucesso!");
      } catch (error) {
        console.error(
          "Erro ao excluir motorista:",
          error.response ? error.response.data : error.message
        );
        alert(
          error.response
            ? error.response.data.message
            : "Erro ao excluir motorista"
        );
      }
    }
  };

  return (
    <div className="container">
      <button
        onClick={() => navigate("/")} // Direciona para a tela de cadastro
        style={{ position: "absolute", top: "20px", right: "20px" }}
      >
        Voltar
      </button>

      <h1>Gerenciar Cadastros</h1>

      {/* Cadastro de Novo Motorista */}
      <div className="cadastro-container">
        <img src={logo} alt="Logo" />
        <h3>Cadastrar Novo Motorista</h3>
        <input
          type="text"
          name="nome"
          placeholder="Nome do Motorista"
          value={novoMotorista.nome}
          onChange={handleNovoMotoristaChange}
        />
        <input
          type="text"
          name="placa"
          placeholder="Placa do Motorista"
          value={novoMotorista.placa}
          onChange={handleNovoMotoristaChange}
        />
        <select
          name="zona_id"
          value={novoMotorista.zona_id}
          onChange={handleNovoMotoristaChange}
        >
          <option value="">Selecione a Zona</option>
          {zonas.map((zona) => (
            <option key={zona.id} value={zona.id}>
              {zona.nome}
            </option>
          ))}
        </select>
        <button onClick={cadastrarMotorista}>Cadastrar Motorista</button>
      </div>

      {/* Filtro e Listagem de Motoristas */}
      <div className="filter-container">
        <input
          type="text"
          name="nome"
          placeholder="Nome do Motorista"
          value={filters.nome}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="placa"
          placeholder="Placa do Motorista"
          value={filters.placa}
          onChange={handleFilterChange}
        />
        <select
          name="zona_id"
          value={filters.zona_id}
          onChange={handleFilterChange}
        >
          <option value="">Selecione a Zona</option>
          {zonas.map((zona) => (
            <option key={zona.id} value={zona.id}>
              {zona.nome}
            </option>
          ))}
        </select>
        <button onClick={() => setFilters(filters)}>Filtrar</button>
      </div>

      <h2>Motoristas Cadastrados</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Placa</th>
                <th>Zona</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {motoristas.map((motorista) => (
                <tr key={motorista.id}>
                  <td>{motorista.nome}</td>
                  <td>{motorista.placa}</td>
                  <td>{motorista.zona_nome}</td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => handleEditMotorista(motorista)}
                    >
                      Editar
                    </button>
                    <button
                      className="action-button"
                      onClick={() => excluirMotorista(motorista.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3>Total de Motoristas: {motoristas.length}</h3>

      {selectedMotorista && (
        <div className="edit-container">
          <h3>Editar Motorista</h3>
          <input
            type="text"
            value={selectedMotorista.nome}
            onChange={(e) =>
              setSelectedMotorista({
                ...selectedMotorista,
                nome: e.target.value,
              })
            }
          />
          <input
            type="text"
            value={selectedMotorista.placa}
            onChange={(e) =>
              setSelectedMotorista({
                ...selectedMotorista,
                placa: e.target.value,
              })
            }
          />
          <select
            value={selectedMotorista.zona_id}
            onChange={(e) =>
              setSelectedMotorista({
                ...selectedMotorista,
                zona_id: e.target.value,
              })
            }
          >
            {zonas.map((zona) => (
              <option key={zona.id} value={zona.id}>
                {zona.nome}
              </option>
            ))}
          </select>
          <button onClick={atualizarMotorista}>Atualizar Motorista</button>
        </div>
      )}
    </div>
  );
};

export default AlterarCadastro;
