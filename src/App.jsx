import React from 'react';
import './App.css';
import PokemonFetcher from './PokemonFetcher';

function App() {
  return (
    <div className="App">
      <h1 className="titulo-principal">¡Conoce a tus pokemones!</h1>
      <PokemonFetcher />
    </div>
  );
}

export default App;
