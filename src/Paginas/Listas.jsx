import { useEffect, useState } from 'react';

export default function listas() {
  const [listas, setListas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    cargarListas();
  }, []);

  const cargarListas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/listas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setListas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar listas:', error);
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setListaSeleccionada(null);
  };

  const abrirModalNueva = () => {
    limpiarFormulario();
    setMostrarModal(true);
  };

  const guardarLista = async () => {
    if (!nombre.trim()) return;
    const token = localStorage.getItem('token');
    const body = { nombre, descripcion };

    const url = listaSeleccionada
      ? `http://localhost:3000/listas/${listaSeleccionada.id}`  // CORREGIDO
      : 'http://localhost:3000/listas';                         // CORREGIDO

    const metodo = listaSeleccionada ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      await cargarListas();
      setMostrarModal(false);
      limpiarFormulario();
    } catch (error) {
      console.error('Error al guardar lista:', error);
    }
  };

  const eliminarLista = async (id) => {
    const confirmar = window.confirm('¿Deseas eliminar esta lista?');
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/listas/${id}`, {  // CORREGIDO
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar');

      await cargarListas();
    } catch (error) {
      console.error('Error al eliminar lista:', error);
    }
  };

  const editarLista = (lista) => {
    setNombre(lista.nombre);
    setDescripcion(lista.descripcion || '');
    setListaSeleccionada(lista);
    setMostrarModal(true);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Listas</h1>

      <button
        onClick={abrirModalNueva}
        className="mb-4 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
      >
        + Nueva lista
      </button>

      <ul className="space-y-3">
        {listas.map((lista) => (
          <li
            key={lista.id}
            className="bg-white p-4 rounded shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-blue-900">{lista.nombre}</h3>
              {lista.descripcion && <p className="text-gray-600">{lista.descripcion}</p>}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => editarLista(lista)}
                className="text-blue-600 hover:text-blue-800"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarLista(lista.id)}
                className="text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-blue-900">
              {listaSeleccionada ? 'Editar lista' : 'Crear lista'}
            </h2>

            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full mb-3 border border-gray-300 p-2 rounded"
            />
            <textarea
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full mb-3 border border-gray-300 p-2 rounded"
            ></textarea>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setMostrarModal(false);
                  limpiarFormulario();
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={guardarLista}
                className="px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
              >
                {listaSeleccionada ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
