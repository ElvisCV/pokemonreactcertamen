import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [capturados, setCapturados] = useState([]);
  const [jefes, setJefes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [contador, setContador] = useState(1);
  const [resultadoCombate, setResultadoCombate] = useState(null);

  const fetchPokemonesAleatorios = async () => {
    try {
      setCargando(true);
      setError(null);
      const nuevosPokemones = [];
      const ids = new Set();
      while (ids.size < 4) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        ids.add(randomId);
      }
      for (const id of ids) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error(`Error al cargar Pokémon ID ${id}`);
        const data = await res.json();
        nuevosPokemones.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(t => t.type.name)
        });
      }
      setPokemones(nuevosPokemones);
      setHistorial(prev => [...prev, ...nuevosPokemones]);
      setContador(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const buscarPokemon = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;
    try {
      setCargando(true);
      setError(null);
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${busqueda.toLowerCase()}`);
      if (!res.ok) throw new Error(`No se encontró el Pokémon "${busqueda}"`);
      const data = await res.json();
      const pokemon = {
        id: data.id,
        nombre: data.name,
        imagen: data.sprites.front_default,
        tipos: data.types.map(t => t.type.name)
      };
      setPokemones([pokemon]);
      setHistorial(prev => [...prev, pokemon]);
      setBusqueda('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const capturarPokemon = (pokemon) => {
    if (!capturados.some(p => p.id === pokemon.id)) {
      setCapturados(prev => [...prev, pokemon]);
    }
  };

  const fetchJefes = async () => {
    try {
      const nuevosJefes = [];
      const ids = new Set();
      while (ids.size < 2) {
        const randomId = Math.floor(Math.random() * 898) + 1;
        ids.add(randomId);
      }
      for (const id of ids) {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error(`Error al cargar jefe ID ${id}`);
        const data = await res.json();
        nuevosJefes.push({
          id: data.id,
          nombre: data.name,
          imagen: data.sprites.front_default,
          tipos: data.types.map(t => t.type.name)
        });
      }
      setJefes(nuevosJefes);
    } catch (err) {
      console.error("Error al obtener jefes:", err);
    }
  };

  const tieneVentaja = (tipoA, tipoB) => {
    const ventajas = {
      fire: ['grass', 'bug'],
      water: ['fire', 'rock'],
      grass: ['water', 'ground'],
      electric: ['water', 'flying'],
      ground: ['electric', 'fire'],
      psychic: ['fighting', 'poison'],
      fighting: ['normal', 'rock'],
    };
    return ventajas[tipoA]?.includes(tipoB) || false;
  };

  const combatir = () => {
    const capturadosCombatientes = capturados.slice(0, 6).map(p => ({ ...p, hp: 100 }));
    const jefesCombatientes = jefes.map(j => ({ ...j, hp: 150 }));

    let i = 0;
    let turno = 0;
    while (
      capturadosCombatientes.some(p => p.hp > 0) &&
      jefesCombatientes.some(p => p.hp > 0)
    ) {
      const atacante = capturadosCombatientes[i % 6];
      const enemigo = jefesCombatientes[i % 2];
      if (atacante.hp > 0) {
        const tipoA = atacante.tipos[0];
        const tipoE = enemigo.tipos[0];
        const bonus = tieneVentaja(tipoA, tipoE) ? 20 : 0;
        const dmg = Math.floor(Math.random() * 20 + 20 + bonus);
        enemigo.hp -= dmg;
      }
      if (enemigo.hp > 0) {
        const tipoA = atacante.tipos[0];
        const tipoE = enemigo.tipos[0];
        const bonus = tieneVentaja(tipoE, tipoA) ? 20 : 0;
        const dmg = Math.floor(Math.random() * 20 + 20 + bonus);
        atacante.hp -= dmg;
      }
      i++;
      turno++;
      if (turno > 100) break;
    }

    const vivosCapturados = capturadosCombatientes.filter(p => p.hp > 0).length;
    const vivosJefes = jefesCombatientes.filter(p => p.hp > 0).length;

    if (vivosCapturados > 0 && vivosJefes === 0) {
      setResultadoCombate('🎉 ¡Ganaste el combate contra los jefes!');
    } else {
      setResultadoCombate('💥 Perdiste el combate... ¡sigue entrenando!');
    }
  };

  useEffect(() => {
    fetchPokemonesAleatorios();
    fetchJefes();
  }, []);

  return (
    <div className="pokemon-container">
      <h2>Tus Pokémon Aleatorios</h2>

      {/* JEFES */}
      {jefes.length > 0 && (
        <div className="jefes-section">
          <h3>👑 Jefes Pokémon</h3>
          <div className="pokemon-list">
            {jefes.map(j => (
              <div key={j.id} className="pokemon-card jefe">
                <h3>{j.nombre.charAt(0).toUpperCase() + j.nombre.slice(1)}</h3>
                <img src={j.imagen} alt={j.nombre} />
                <p><strong>Tipos:</strong> {j.tipos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
              </div>
            ))}
          </div>
          <button className="reload-bosses" onClick={fetchJefes}>🔁 Cambiar Jefes</button>
        </div>
      )}

      {/* BUSCADOR */}
      <form onSubmit={buscarPokemon} className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre (ej. pikachu)"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button type="submit">🔍 Buscar</button>
      </form>

      <button className="reload-button" onClick={fetchPokemonesAleatorios}>🔄 Obtener Nuevos</button>
      <p className="contador">Generado {contador} vez{contador > 1 ? 'es' : ''}</p>

      {cargando && <div>Cargando Pokémon...</div>}
      {error && <div className="pokemon-container error">Error: {error}</div>}

      {/* POKEMONES */}
      <div className="pokemon-list">
        {pokemones.map(p => (
          <div key={p.id} className="pokemon-card">
            <h3>{p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)}</h3>
            <img src={p.imagen} alt={p.nombre} />
            <p><strong>Tipos:</strong> {p.tipos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
            <button className="capture-button" onClick={() => capturarPokemon(p)}>🎯 Capturar</button>
          </div>
        ))}
      </div>

      {/* CAPTURADOS (VISIBLES) */}
      {capturados.length > 0 && (
        <div className="historial">
          <h3>📦 Capturados</h3>
          <div className="pokemon-list">
            {capturados.map((p, i) => (
              <div key={`capturado-${p.id}-${i}`} className="pokemon-card mini capturado">
                <h4>{p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)}</h4>
                <img src={p.imagen} alt={p.nombre} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMBATE */}
      {capturados.length >= 6 && (
        <div className="combat-section">
          <h3>⚔️ ¡Listos para combatir!</h3>
          <button className="combat-button" onClick={combatir}>⚔️ Iniciar combate</button>
        </div>
      )}

      {/* RESULTADO */}
      {resultadoCombate && (
        <div className="resultado-combate">
          <h3>{resultadoCombate}</h3>
        </div>
      )}
    </div>
  );
};

export default PokemonFetcher;
