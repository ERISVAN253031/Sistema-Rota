import React, { useState } from 'react'; // Importação do React e useState
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importação do Router, Route e Routes
import Cadastro from './Cadastro'; // Importação do componente Cadastro
import AlterarCadastro from './AlterarCadastro'; // Importação do componente AlterarCadastro
import Roteirizacao from './Roteirizacao'; // Importação do componente Roteirizacao
import './index.css'; // Importação do CSS

const App = () => {
  const [motoristas, setMotoristas] = useState({});

  const handleCadastro = (cep, motorista, placa) => {
    const cepRegex = /^\d{5}-\d{3}$/; // Exemplo de formato de CEP
    if (!cep || !motorista || !placa) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (!cepRegex.test(cep)) {
      alert('Por favor, insira um CEP válido no formato 12345-123.');
      return;
    }

    setMotoristas((prev) => ({
      ...prev,
      [cep]: { motorista, placa }
    }));

    alert(`Motorista ${motorista} cadastrado com placa ${placa} para o CEP ${cep}`);
  };

  return (
    <Router>
      <div className="app-container" style={{ position: 'relative' }}>
        <Routes>
          <Route path="/" element={
            <div>
              <Cadastro handleCadastro={handleCadastro} />
              <Roteirizacao motoristas={motoristas} />
            </div>
          } />
          <Route path="/alterar-cadastro" element={<AlterarCadastro motoristas={motoristas} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;