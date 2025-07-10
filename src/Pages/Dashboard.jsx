import { useState } from 'react';
import { useEffect } from 'react';

export default function Dashboard({ usuario, onLogout }) {
   
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // Lista de usuarios disponibles
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [nuevoTextoSubtarea, setNuevoTextoSubtarea] = useState('');
  const [mostrarInputSubtarea, setMostrarInputSubtarea] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [mostrarModalTarea, setMostrarModalTarea] = useState(false);

  // Variables para el modal de crear tarea
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [favorito, setFavorito] = useState(false);
  const [realizada, setRealizada] = useState(false);
  const [nota, setNota] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(''); 
  const [usuarioId, setUsuarioId] = useState('1'); // Default 1

  const user = localStorage.getItem('usuario')
  const wipeUser = JSON.parse(user) 

  useEffect(() => {
    const cargarTareas = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await fetch('http://localhost:3000/tarea/listar/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        Array.isArray(data) ? setTareas(data) : setTareas([]);
      } catch (error) {
        console.error('Error al cargar tareas:', error);
      }
    };

    // Cargar usuarios para el selector
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/users/Listar', {

          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        Array.isArray(data) ? setUsuarios(data) : setUsuarios([]);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
       
        
      }
    };

    cargarTareas();
    cargarUsuarios();
  }, []);

  // Limpiar el formulario
  const limpiarFormulario = () => {
    setTitulo('');
    setDescripcion('');
    setEstado('pendiente');
    setFavorito(false);
    setRealizada(false);
    setNota('');
    setFechaVencimiento('');
    setUsuarioId('1');
  };

  // Añadir nueva tarea
  const agregarTarea = async () => {
    if (!titulo.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const nuevaTarea = {
        titulo: titulo,
        descripcion: descripcion,
        estado: estado,
        favorito: false, // Siempre false al crear
        realizada: false, // Siempre false al crear
        nota: nota,
        fechaVencimiento: fechaVencimiento,
        usuarioId: usuarioId
      };

      const response = await fetch('http://localhost:3000/tarea', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevaTarea),
      });

      if (!response.ok) {
        throw new Error('Error al crear tarea');
      }

      const tareaCreada = await response.json();
      setTareas([tareaCreada, ...tareas]);
      limpiarFormulario();
      setMostrarModalTarea(false);
    } catch (error) {
      console.error('Error al agregar tarea:', error);
    }
  };

  const toggleCompletadaTarea = async (id) => {
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return;

    try {
      const token = localStorage.getItem('token');
      const body = {
        realizada: !tarea.realizada,
      };

      const response = await fetch(`http://localhost:3000/tarea/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al actualizar tarea');

      const tareaActualizada = await response.json();
      setTareas(tareas.map(t => (t.id === id ? tareaActualizada : t)));

      if (tareaSeleccionada && tareaSeleccionada.id === id) {
        setTareaSeleccionada(tareaActualizada);
      }
    } catch (error) {
      console.error('Error al marcar como completada:', error);
    }
  };

  const toggleFavorita = async (id) => {
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return;

    try {
      const token = localStorage.getItem('token');
      const body = {
        favorita: !tarea.favorita,
      };

      const response = await fetch(`http://localhost:3000/tarea/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al actualizar favorita');

      const tareaActualizada = await response.json();
      setTareas(tareas.map(t => (t.id === id ? tareaActualizada : t)));

      if (tareaSeleccionada && tareaSeleccionada.id === id) {
        setTareaSeleccionada(tareaActualizada);
      }
    } catch (error) {
      console.error('Error al marcar como favorita:', error);
    }
  };

  // Eliminar tarea 
  const eliminarTarea = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/tarea/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar tarea');

      setTareas(tareas.filter(t => t.id !== id));
      setTareaSeleccionada(null);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  const toggleCompletadaSubtarea = idSubtarea => {
    if (!tareaSeleccionada) return;

    const subtareasActualizadas = tareaSeleccionada.subtareas.map(s =>
      s.id === idSubtarea ? { ...s, completada: !s.completada } : s
    );

    actualizarSubtareas(tareaSeleccionada.id, subtareasActualizadas);
  };

  const eliminarSubtarea = idSubtarea => {
    if (!tareaSeleccionada) return;

    const subtareasActualizadas = tareaSeleccionada.subtareas.filter(s => s.id !== idSubtarea);

    actualizarSubtareas(tareaSeleccionada.id, subtareasActualizadas);
  };

  const agregarSubtarea = () => {
    if (!tareaSeleccionada) return;
    const texto = nuevoTextoSubtarea.trim();
    if (!texto) return;

    const nuevaSubtarea = {
      id: Date.now(),
      texto,
      completada: false
    };

    const subtareasActualizadas = [...tareaSeleccionada.subtareas, nuevaSubtarea];
    actualizarSubtareas(tareaSeleccionada.id, subtareasActualizadas);
    setNuevoTextoSubtarea('');
    setMostrarInputSubtarea(false);
  };

  const actualizarSubtareas = (idTarea, subtareasActualizadas) => {
    const tareasActualizadas = tareas.map(t =>
      t.id === idTarea ? { ...t, subtareas: subtareasActualizadas } : t
    );
    setTareas(tareasActualizadas);
    setTareaSeleccionada(prev => ({ ...prev, subtareas: subtareasActualizadas }));
  };

  const cerrarPanel = () => {
    setTareaSeleccionada(null);
    setMostrarInputSubtarea(false);
  };

  return (


    
    <div className="flex h-screen bg-gray-50">
      {/* Modal para crear tarea - MEJORADO */}
      {mostrarModalTarea && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Crear nueva tarea</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
              
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>

              <input
                type="text"
                placeholder="Nota"
                value={nota}
                onChange={e => setNota(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />
              
              <input
                type="date"
                value={fechaVencimiento}
                onChange={e => setFechaVencimiento(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded"
              />

              {/* SELECTOR DE USUARIOS MEJORADO */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asignar a Usuario
                </label>
                <select
                  value={usuarioId}
                  onChange={e => setUsuarioId(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Seleccionar usuario...</option>
                 
                  {usuarios.map(usuario => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.username} 
                    </option>
                  ))}
                </select>
              </div>

              {/* ELIMINÉ LOS CHECKBOXES DE FAVORITO Y REALIZADA */}

              <div className="flex justify-end space-x-2">
                <button
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                  onClick={() => {
                    setMostrarModalTarea(false);
                    limpiarFormulario();
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded"
                  onClick={agregarTarea}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}







      {/* Panel izquierdo 60% */}
      <section className="w-1/2 border-r border-amber-50 p-6 overflow-auto">
        
        {/* Menu usuario arriba a la derecha - MEJORADO */}
        <div className="relative ml-auto mb-4 flex justify-end">
          <button
            onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
            className="text-blue-900 hover:text-blue-700 focus:outline-none flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium">{wipeUser?.username || 'Usuario'}</span>
          </button>

          {mostrarMenuUsuario && (
            <div className="absolute top-8 right-0 mt-1 w-48 bg-white border border-gray-200 rounded shadow-lg">
              <div className="px-3 py-2 text-blue-900 font-bold border-b truncate">
                {wipeUser?.username || 'Usuario'}
              </div>
              <button
                onClick={onLogout}
                className="w-full text-left px-3 py-2 text-red-700 font-bold hover:bg-gray-100"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-6 text-blue-900">Todo List</h1>

        {/* Input para crear nueva tarea */}
        <div className="flex mb-6">
          <input
            type="text"
            placeholder="+ Nueva"
            className="flex-grow p-2 focus:outline-none placeholder-gray-400 bg-transparent border-none cursor-pointer"
            onClick={() => setMostrarModalTarea(true)}
            readOnly
          />
         
        </div>

        {/* Lista de tareas */}
        <ul className="space-y-3">
          {tareas.map(tarea => (
            <li
              key={tarea.id}
              className="cursor-pointer bg-white p-4 rounded shadow flex justify-between items-center hover:bg-blue-50"
              onClick={() => setTareaSeleccionada(tarea)}
            >
              <label
                className="flex items-center space-x-3 flex-grow cursor-pointer"
                onClick={e => e.stopPropagation()}
              >
                <input className="accent-blue-900"
                  type="checkbox"
                  checked={tarea.realizada}
                  onChange={() => toggleCompletadaTarea(tarea.id)}
                />
                <span className={tarea.realizada ? 'line-through text-gray-400' : ''}>
                  {tarea.titulo}
                </span>
              </label>

              <button
                onClick={e => {
                  e.stopPropagation();
                  toggleFavorita(tarea.id);
                }}
                aria-label={tarea.favorita ? 'Quitar de favoritas' : 'Marcar como favorita'}
                className="focus:outline-none ml-3"
              >
                {tarea.favorita ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-800"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400 hover:text-blue-900 transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Panel derecho 40% */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white shadow-xl transform transition-transform duration-300 ${
          tareaSeleccionada ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '40vw', maxWidth: '450px' }}
      >
        {tareaSeleccionada && (
          <div className="p-6 flex flex-col h-full">
            {/* Input para nueva subtarea */}
            <div className="flex mb-6">
              <input
                type="text"
                placeholder="+ Nueva"
                value={nuevoTextoSubtarea}
                onChange={e => setNuevoTextoSubtarea(e.target.value)}
                className="flex-grow p-2 focus:outline-none placeholder-gray-400 bg-transparent border-none"
                onKeyDown={e => { if (e.key === 'Enter') agregarSubtarea(); }}
                autoComplete="off"
              />
              <button
                onClick={agregarSubtarea}
                className="bg-blue-900 text-white px-4 rounded hover:bg-blue-1000 transition"
              >
                Agregar
              </button>
            </div>

            {/* Título de la tarea */}
            <div className="flex items-center space-x-2 text-blue-900 focus:outline-none">
              <h2 className="font-bold text-2xl text-justify">{tareaSeleccionada.titulo}</h2>
              
              <div className="flex space-x-4 items-center">
                <button
                  onClick={() => toggleFavorita(tareaSeleccionada.id)}
                  aria-label={
                    tareaSeleccionada.favorita
                      ? 'Quitar de favoritas'
                      : 'Marcar como favorita'
                  }
                  className="focus:outline-none"
                >
                  {tareaSeleccionada.favorita ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-blue-800"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke="none"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400 transition"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <br />
           
            {/* Lista de subtareas */}
            <ul className="mb-6 overflow-auto flex-grow space-y-3">
              {tareaSeleccionada.subtareas?.length === 0 && (
                <p className="text-gray-500 italic">No hay subtareas</p>
              )}
              {tareaSeleccionada.subtareas?.map(subtarea => (
                <li key={subtarea.id} className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer flex-grow">
                    <input 
                      type="checkbox"
                      checked={subtarea.completada}
                      onChange={() => toggleCompletadaSubtarea(subtarea.id)}
                      className="cursor-pointer accent-blue-900" 
                    />
                    <span className={subtarea.completada ? 'line-through text-gray-400' : ''}>
                      {subtarea.texto}
                    </span>
                  </label>
                  <button
                    onClick={() => eliminarSubtarea(subtarea.id)}
                    aria-label="Eliminar subtarea"
                    className="text-gray-400 ml-3 focus:outline-none"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            {/* Controles inferiores */}
            <div className="mt-auto pt-4 flex justify-between items-center">
              <button
                onClick={cerrarPanel}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label="Volver a tareas"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v1"
                  />
                </svg>
                <span>Salir</span>
              </button>
              
              <button
                onClick={() => eliminarTarea(tareaSeleccionada.id)}
                aria-label="Eliminar tarea"
                className="text-gray-400 ml-3 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 10h12M9 10v10m6-10v10M5 6h14l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6zM9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}