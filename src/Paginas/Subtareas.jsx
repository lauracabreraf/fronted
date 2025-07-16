import { useState, useEffect } from 'react';

export default function Subtareas({ tareaId }) {


  const [subtareas, setSubtareas] = useState([]);
  const [nuevaSubtarea, setNuevaSubtarea] = useState('');
  const token = localStorage.getItem('token');
  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');



  useEffect(() => {
    if (tareaId) {
      fetchSubtareas();
    }
  }, [tareaId]);




  const fetchSubtareas = async () => {
    try {
      const response = await fetch(`http://localhost:3000/subtareas/tarea/${tareaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });




      const data = await response.json();
      Array.isArray(data) ? setSubtareas(data) : setSubtareas([]);
    } catch (error) {
      console.error('Error al cargar subtareas:', error);
    }
  };




  const crearSubtarea = async () => {
    if (!nuevaSubtarea.trim()) return;

    try {
      const body = {
        titulo: nuevaSubtarea,
        tareaId: tareaId,
      };

      const response = await fetch('http://localhost:3000/subtareas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al crear subtarea');

      setNuevaSubtarea('');
      fetchSubtareas();
    } catch (error) {
      console.error('Error al agregar subtarea:', error);
    }
  };


const eliminarSubtarea = async (id) => {
  const confirmar = window.confirm('¿Deseas eliminar esta subtarea?');
  if (!confirmar) return;

  try {
    const response = await fetch(`http://localhost:3000/subtareas/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Error al eliminar subtarea');

    // Refrescar lista
    fetchSubtareas();
  } catch (error) {
    console.error('Error al eliminar subtarea:', error);
  }
};








const guardarEdicion = async (id) => {
  if (!textoEditado.trim()) return;

  try {
    const body = { titulo: textoEditado };

    const response = await fetch(`http://localhost:3000/subtareas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('Error al actualizar subtarea');

    setEditandoId(null);
    setTextoEditado('');
    fetchSubtareas();
  } catch (error) {
    console.error('Error al guardar edición de subtarea:', error);
  }
};




  const toggleCompletada = async (id, completada) => {
    try {
      const body = { completada: !completada };

      const response = await fetch(`http://localhost:3000/subtareas/actualizar/id/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al actualizar');

      fetchSubtareas();
    } catch (error) {
      console.error('Error al actualizar subtarea:', error);
    }
  };

  return (
    <div className="mt-8 p-4 border-t border-gray-200">
      <h3 className="text-md font-bold text-blue-900 mb-2"></h3>

      <div className="flex mb-3 space-x-2">
        <input
          type="text"
          value={nuevaSubtarea}
          onChange={(e) => setNuevaSubtarea(e.target.value)}
          placeholder="Nueva subtarea"
          className="flex-grow p-2 border border-gray-300 rounded"
        />
        <button
          onClick={crearSubtarea}
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Agregar
        </button>
      </div>

      <ul className="space-y-2">
  {subtareas.map((sub) => (
    <li key={sub.id} className="flex items-center justify-between bg-gray-50 p-2 rounded shadow-sm">
      <div className="flex items-center space-x-2 flex-grow">
        <input
          type="checkbox"
          checked={sub.completada}
          onChange={() => toggleCompletada(sub.id, sub.completada)}
          className="accent-blue-900"
        />

        {editandoId === sub.id ? (
          <input
            type="text"
            value={textoEditado}
            onChange={(e) => setTextoEditado(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter') guardarEdicion(sub.id);
              if (e.key === 'Escape') {
                setEditandoId(null);
                setTextoEditado('');
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className={`flex-grow cursor-pointer ${
              sub.completada ? 'line-through text-gray-400' : ''
            }`}
            onClick={() => {
              setEditandoId(sub.id);
              setTextoEditado(sub.titulo);
            }}
          >
            {sub.titulo}
          </span>
        )}
      </div>

      <div className="flex space-x-2">
        {editandoId === sub.id && (
          <button
            onClick={() => guardarEdicion(sub.id)}
            className="text-green-600 hover:text-green-800 text-sm font-bold"
            title="Guardar"
          >
            ✔
          </button>
        )}

        <button
          onClick={() => eliminarSubtarea(sub.id)}
          className="text-black"
          title="Eliminar"
        >
          x
        </button>
      </div>
    </li>
  ))}
</ul>

    </div>
  );
}
