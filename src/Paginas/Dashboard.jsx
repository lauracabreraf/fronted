import { useState } from 'react';
import { useEffect } from 'react';
import Subtareas from '../Paginas/Subtareas';

export default function Dashboard({ usuario, onLogout }) {
   
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); 
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const [mostrarModalTarea, setMostrarModalTarea] = useState(false);
  const [mostrarPanelIzquierdo, setMostrarPanelIzquierdo] = useState(false);
  const [modoImportante, setModoImportante] = useState(false);
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [favorito, setFavorito] = useState(false);
  const [realizada, setRealizada] = useState(false);
  const [nota, setNota] = useState('');
  const [fechaVencimiento, setFechaVencimiento] = useState(''); 
  const [usuarioId, setUsuarioId] = useState('1'); 
  const [listaId, setlistaId] = useState('');

  // Nuevos estados para el dashboard de listas
  const [mostrarDashboardListas, setMostrarDashboardListas] = useState(false);
  const [mostrarModalLista, setMostrarModalLista] = useState(false);

  const user = localStorage.getItem('usuario')
  const wipeUser = JSON.parse(user) 

  // Estados para listas
  const [nombreLista, setNombreLista] = useState('');
  const [descripcionLista, setDescripcionLista] = useState('');
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [listaEditando, setListaEditando] = useState(null);
  const [nuevaDescripcionLista, setNuevaDescripcionLista] = useState('');

  // Función para obtener el título actual
  const obtenerTituloActual = () => {
    if (mostrarDashboardListas) return 'Listas';
    if (modoImportante) return 'Importante';
    if (listaSeleccionada) return `Lista: ${listaSeleccionada.name}`;
    return 'Tareas';
  };

  useEffect(() => {
    if (tareaSeleccionada) {
      setTitulo(tareaSeleccionada.titulo || '');
      setDescripcion(tareaSeleccionada.descripcion || '');
      setEstado(tareaSeleccionada.estado || 'pendiente');
      setNota(tareaSeleccionada.nota || '');
      setFechaVencimiento(tareaSeleccionada.fechaVencimiento?.substring(0, 10) || '');
      setUsuarioId(tareaSeleccionada.usuarioId || '');
      setFavorito(tareaSeleccionada.favorito || false);
      setMostrarModalTarea(true);
    }
  }, [tareaSeleccionada]);

  const cargarListas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/listas', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      Array.isArray(data) ? setListas(data) : setListas([]);
    } catch (error) {
      console.error('Error al cargar listas:', error);
    }
  };

  // Función separada para cargar tareas
  const cargarTareas = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const url = listaSeleccionada
        ? `http://localhost:3000/tarea/listar/por-lista/${listaSeleccionada.id}`
        : 'http://localhost:3000/tarea/listar/all';

      const response = await fetch(url, {
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

  useEffect(() => {
    cargarUsuarios();
    cargarListas();
  }, []);

  useEffect(() => {
    cargarTareas();
  }, [listaSeleccionada]); 

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

  const limpiarFormularioLista = () => {
    setNombreLista('');
    setDescripcionLista('');
  };

const agregarTarea = async () => {
  if (!titulo.trim()) return;

  try {
    const token = localStorage.getItem('token');

    // Si no se selecciona un usuario, usar el usuarioId actual (de localStorage)
    const tareaUsuarioId = usuarioId || wipeUser?.id;

    const nuevaTarea = {
      titulo: titulo,
      descripcion: descripcion,
      estado: estado,
      favorito,
      realizada,
      nota: nota,
      fechaVencimiento: fechaVencimiento,
      usuarioId: tareaUsuarioId,  // Asegúrate de enviar el usuarioId correcto
      ...(listaId && { listaId })  // Solo enviar listaId si está seleccionado
    };

    console.log('nueva tarea', nuevaTarea);

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

    if (tareaCreada.favorito && setTareasImportantes) {
      setTareasImportantes(prev => [tareaCreada, ...prev]);
    }

    limpiarFormulario();
    setMostrarModalTarea(false);
  } catch (error) {
    console.error('Error al agregar tarea:', error);
  }
};

  const actualizarTarea = async () => {
    if (!titulo.trim() || !tareaSeleccionada) return;

    try {
      const token = localStorage.getItem('token');
      const body = {
        titulo,
        descripcion,
        estado,
        nota,
        fechaVencimiento,
        usuarioId,
        listaId 
      };

      const response = await fetch(`http://localhost:3000/tarea/${tareaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Error al actualizar tarea');

      const tareaActualizada = await response.json();

      setTareas(tareas.map(t => t.id === tareaActualizada.id ? tareaActualizada : t));
      setTareaSeleccionada(null);
      limpiarFormulario();
      setMostrarModalTarea(false);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  const eliminarTarea = async () => {
    if (!tareaSeleccionada) return;

    const confirmar = window.confirm('¿Estás segura de que deseas eliminar esta tarea?');
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/tarea/${tareaSeleccionada.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar tarea');

      setTareas(tareas.filter(t => t.id !== tareaSeleccionada.id));
      setTareaSeleccionada(null);
      limpiarFormulario();
      setMostrarModalTarea(false);
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
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
        favorito: !tarea.favorito,
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
  
  const agregarLista = async () => {
  if (!nombreLista.trim()) return;

  const token = localStorage.getItem('token');
  try {
    const response = await fetch('http://localhost:3000/listas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: nombreLista,
        description: descripcionLista,
        ...(usuarioId && { usuarioId }), // Solo agregar usuarioId si existe
      }),
    });

    if (!response.ok) throw new Error('Error al crear lista');

    const nuevaLista = await response.json();
    setListas([nuevaLista, ...listas]);

    limpiarFormularioLista();
    setMostrarModalLista(false);
    await cargarListas();
  } catch (error) {
    console.error('Error al crear lista:', error);
  }
};

  const actualizarLista = async () => {
    if (!listaEditando?.id || !nombreLista.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/listas/${listaEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: nombreLista,
          description: descripcionLista,
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar lista');

      setListaEditando(null);
      limpiarFormularioLista();
      setMostrarModalLista(false);
      await cargarListas();
    } catch (error) {
      console.error('Error al actualizar lista:', error);
    }
  };

  const eliminarLista = async () => {
    if (!listaEditando) return;

    const confirmar = window.confirm('¿Estás segura de eliminar esta lista?');
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/listas/${listaEditando.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Error al eliminar lista');

      setListas(listas.filter(l => l.id !== listaEditando.id));
      setListaEditando(null);
      limpiarFormularioLista();
      setMostrarModalLista(false);
      await cargarListas();
    } catch (error) {
      console.error('Error al eliminar lista:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* MODAL TAREA */}
      {mostrarModalTarea && (
        <div className="absolute top-0 right-0 h-full w-[350px] bg-white shadow-xl z-30 overflow-auto border-l border-gray-200">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl z-10"
            onClick={() => {
              setMostrarModalTarea(false);
              setTareaSeleccionada(null);
              limpiarFormulario();
            }}
          >
            &times; 
          </button>

          <div className="bg-white w-full max-w-md p-6 relative">
            {tareaSeleccionada && (
              <div className="mb-6">
                <Subtareas tareaId={tareaSeleccionada.id} />
              </div>
            )}

            <h2 className="text-xl font-bold text-blue-900 mb-6">
              {tareaSeleccionada ? 'Editar tarea' : 'Crear tarea'}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Descripción"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="pendiente">Pendiente</option>
                <option value="progreso">En progreso</option>
                <option value="completada">Completada</option>
              </select>

              <input
                type="text"
                placeholder="Nota"
                value={nota}
                onChange={e => setNota(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              
              <input
                type="date"
                value={fechaVencimiento}
                onChange={e => setFechaVencimiento(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />

              <select
                value={listaId}
                onChange={(e) => setlistaId(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Seleccionar lista</option>
                {listas.map((lista) => (
                  <option key={lista.id} value={lista.id}>
                    {lista.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center mt-8">
              {tareaSeleccionada && (
                <button 
                  onClick={eliminarTarea}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              )}

              <button
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors ml-auto"
                onClick={tareaSeleccionada ? actualizarTarea : agregarTarea}
              >
                {tareaSeleccionada ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LISTA */}
      {mostrarModalLista && (
        <div className="absolute top-0 right-0 h-full w-[350px] bg-white shadow-xl z-30 overflow-auto border-l border-gray-200">
          <button 
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
            onClick={() => {
              setMostrarModalLista(false);
              setListaEditando(null);
              limpiarFormularioLista();
            }}
          >
            &times; 
          </button>

          <div className="bg-white w-full max-w-md p-6 relative">
            <h2 className="text-xl font-bold text-blue-900 mb-6">
              {listaEditando ? 'Editar lista' : 'Crear lista'}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la lista"
                value={nombreLista}
                onChange={(e) => setNombreLista(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                required
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={descripcionLista}
                onChange={(e) => setDescripcionLista(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />

              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Asignar a un usuario</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center mt-8">
              {listaEditando && (
                <button 
                  onClick={eliminarLista}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              )}

              <button
                className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors text-sm ml-auto"
                onClick={listaEditando ? actualizarLista : agregarLista}
              >
                {listaEditando ? 'Guardar cambios' : 'Guardar lista'}
              </button> 
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN MENÚ HAMBURGUESA */}
      <button
        className="absolute top-4 left-4 text-blue-900 text-3xl z-40 focus:outline-none hover:bg-blue-50 p-2 rounded-lg transition-colors"
        onClick={() => setMostrarPanelIzquierdo(prev => !prev)}
      >
        &#9776;
      </button> 

      {/* PANEL IZQUIERDO */}
      {mostrarPanelIzquierdo && (
        <div className="h-full w-[280px] bg-white shadow-xl z-30 overflow-auto border-r border-gray-200 transition-transform duration-300">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
            onClick={() => setMostrarPanelIzquierdo(false)}
          >
            &times;
          </button>

          <div className="p-6 pt-16">
            <h2 className="text-xl font-bold text-blue-900 mb-8">Menú</h2>

            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => {
                    setModoImportante(false);
                    setListaSeleccionada(null);
                    setMostrarDashboardListas(false);
                  }}
                  className="w-full text-left text-blue-900 font-semibold hover:bg-blue-50 p-3 rounded-lg transition-colors"
                >
                  📝 Tareas
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    setModoImportante(true);
                    setMostrarDashboardListas(false);
                  }}
                  className="w-full text-left text-blue-900 font-semibold hover:bg-blue-50 p-3 rounded-lg transition-colors"
                >
                  ⭐ Importante
                </button>
              </li>

              <li className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setMostrarDashboardListas(true);
                    setModoImportante(false);
                    setListaSeleccionada(null);
                  }}
                  className="w-full text-left text-blue-900 font-semibold hover:bg-blue-50 p-3 rounded-lg transition-colors"
                >
                  📋 Listas
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* PANEL PRINCIPAL */}
      <section className={`transition-all duration-300 flex-1 p-6 overflow-auto ${mostrarModalTarea || mostrarModalLista ? 'pr-[380px]' : ''}`}>
        {/* HEADER CON TÍTULO DINÁMICO */}
        <div className="flex justify-between items-center mb-8 ml-12">
          <h1 className="text-3xl font-bold text-blue-900">
            {obtenerTituloActual()}
          </h1>

          <div className="relative">
            <button
              onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
              className="text-blue-900 hover:text-blue-700 focus:outline-none flex items-center space-x-2 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all"
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
              <div className="absolute top-12 right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="px-3 py-2 text-blue-900 font-bold border-b truncate">
                  {wipeUser?.username || 'Usuario'}
                </div>
                <button onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-red-700 font-bold hover:bg-gray-100 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
           
        {/* BOTÓN NUEVA */}
        <div className="w-full flex justify-end mb-6">
          <button
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            onClick={() => mostrarDashboardListas ? setMostrarModalLista(true) : setMostrarModalTarea(true)}
          >
            + Nueva {mostrarDashboardListas ? 'Lista' : 'Tarea'}
          </button>
        </div>

        {/* DASHBOARD DE LISTAS */}
        {mostrarDashboardListas ? (
          <ul className="space-y-4">
            {listas.map(lista => (
              <li
                key={lista.id}
                className="cursor-pointer bg-white p-5 rounded-lg shadow-sm hover:shadow-md flex justify-between items-center hover:bg-blue-50 transition-all border border-gray-100"
                onClick={() => {
                  setUsuarioId(lista.usuarioId || '');
                  setListaEditando(lista);
                  setNombreLista(lista.name);
                  setDescripcionLista(lista.description || '');
                  setMostrarModalLista(true);
                }}
              >
                <label
                  className="flex items-center space-x-3 flex-grow cursor-pointer"
                  onClick={e => e.stopPropagation()}
                >
                  <input className="accent-blue-900"
                    type="checkbox"
                    checked={false}
                    onChange={() => {}}
                  />
                  <div>
                    <span className="font-medium text-gray-800">{lista.name}</span>
                    {lista.description && (
                      <p className="text-sm text-gray-500 mt-1">{lista.description}</p>
                    )}
                  </div>
                </label>

                <button onClick={e => {
                    e.stopPropagation();
                    // Funcionalidad de favoritos para listas
                  }}
                  aria-label="Marcar como favorita"
                  className="focus:outline-none ml-3"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-400 hover:text-blue-900 transition-colors"
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
                </button>
              </li>
            ))}
          </ul>
        ) : (
          /* DASHBOARD DE TAREAS */
          <ul className="space-y-4">
            {(modoImportante ? tareas.filter(t => t.favorito) : tareas).map(tarea => (
              <li
                key={tarea.id}
                className="cursor-pointer bg-white p-5 rounded-lg shadow-sm hover:shadow-md flex justify-between items-center hover:bg-blue-50 transition-all border border-gray-100"
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
                  <div className="flex-grow">
                    <span className={`font-medium transition-all ${tarea.realizada ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {tarea.titulo}
                    </span>
                    {tarea.descripcion && (
                      <p className="text-sm text-gray-500 mt-1">{tarea.descripcion}</p>
                    )}
                    {tarea.fechaVencimiento && (
                      <p className="text-xs text-gray-400 mt-1">
                        Vence: {new Date(tarea.fechaVencimiento).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </label>

                <button onClick={e => {
                    e.stopPropagation();
                    toggleFavorita(tarea.id);
                  }}
                  aria-label={tarea.favorito ? 'Quitar de favoritas' : 'Marcar como favorita'}
                  className="focus:outline-none ml-3"
                >
                  {tarea.favorito ? (
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
                      className="h-6 w-6 text-gray-400 hover:text-blue-900 transition-colors"
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

            {/* MENSAJE CUANDO NO HAY TAREAS */}
            {(modoImportante ? tareas.filter(t => t.favorito) : tareas).length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">
                  {modoImportante ? '⭐' : '📝'}
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {modoImportante ? 'No hay tareas importantes' : 'No hay tareas aún'}
                </h3>
                <p className="text-gray-400">
                  {modoImportante 
                    ? 'Marca algunas tareas como favoritas para verlas aquí' 
                    : 'Crea tu primera tarea para empezar'
                  }
                </p>
              </div>
            )}
          </ul>
        )}

        {/* MENSAJE CUANDO NO HAY LISTAS */}
        {mostrarDashboardListas && listas.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay listas aún</h3>
            <p className="text-gray-400">Crea tu primera lista para organizar tus tareas</p>
          </div>
        )}
      </section>
    </div>
  );
}