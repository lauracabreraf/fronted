import { useEffect, useState } from 'react';



export default function Listas({ listaId, setListaId }) {


  const [listas, setListas] = useState([]);
  const [nuevaLista, setNuevaLista] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);

  const [editandoId, setEditandoId] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    cargarListas();
    cargarUsuarios();
  }, []);




  const cargarListas = async () => {
    try {
      const response = await fetch('http://localhost:3000/listas', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      Array.isArray(data) ? setListas(data) : setListas([]);
    } catch (error) {
      console.error('Error al cargar listas:', error);
    }
  };




    const cargarUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/Listar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };


  
 const crearLista = async () => {
    if (!nuevaLista.trim()) return;
    if (!usuario || !usuario.id) {
      console.error('Usuario no disponible');
      return;
    }

    try {
      const body = {
        name: nuevaLista,
        description: descripcion || null,
        usuarioId: usuario.id,
        usuariosCompartidos: usuariosSeleccionados,
      };

      const response = await fetch('http://localhost:3000/listas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al crear lista');

      setNuevaLista('');
      setDescripcion('');
      setUsuariosSeleccionados([]);
      cargarListas();
    } catch (error) {
      console.error('Error al agregar lista:', error);
    }
  };







  const eliminarLista = async (id) => {
    const confirmar = window.confirm('¿Deseas eliminar esta lista?');
    if (!confirmar) return;

    try {
      const response = await fetch(`http://localhost:3000/listas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Error al eliminar lista');
      cargarListas();
    } catch (error) {
      console.error('Error al eliminar lista:', error);
    }
  };







  const guardarEdicion = async (id) => {
    if (!textoEditado.trim()) return;

    try {
      const body = { name: textoEditado };
      const response = await fetch(`http://localhost:3000/listas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al actualizar lista');
      setEditandoId(null);
      setTextoEditado('');
      cargarListas();
    } catch (error) {
      console.error('Error al guardar edición de lista:', error);
    }
  };




  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-blue-900">Listas</h1>

     <div className="flex flex-col gap-2 mb-4">
        <input
          type="text"
          value={nuevaLista}
          onChange={(e) => setNuevaLista(e.target.value)}
          placeholder="Nueva lista"
          className="flex-grow p-2 border border-gray-300 rounded"
        />

    

 <input
  type="text"
  value={descripcion}
  onChange={(e) => setDescripcion(e.target.value)}
  placeholder="Descripción"
  className="flex-grow p-2 border border-gray-300 rounded"
 />





        <button
          onClick={crearLista}
          className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Agregar
        </button>
      </div>








      <ul className="space-y-2">
        {listas.map((lista) => (
          <li
            key={lista.id}
            className="flex items-center justify-between bg-gray-50 p-2 rounded shadow-sm"
          >
            <div className="flex items-center space-x-2 flex-grow">
             

              {editandoId === lista.id ? (
                <input 
                  type="text"
                  value={textoEditado}
                  onChange={(e) => setTextoEditado(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') guardarEdicion(lista.id);
                    if (e.key === 'Escape') {
                      setEditandoId(null);
                      setTextoEditado('');
                    }
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className="cursor-pointer flex-grow text-blue-900"
                  onClick={() => {
                    setEditandoId(lista.id);
                    setTextoEditado(lista.nombre);
                  }}
                >
                  {lista.nombre}
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              {editandoId === lista.id && (
                <button
                  onClick={() => guardarEdicion(lista.id)}
                  className="text-green-600 hover:text-green-800 text-sm font-bold"
                >
                  ✔
                </button>
              )}
              <button
                onClick={() => eliminarLista(lista.id)}
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

