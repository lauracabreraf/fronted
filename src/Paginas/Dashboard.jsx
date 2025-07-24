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

  const user = localStorage.getItem('usuario')
  const wipeUser = JSON.parse(user) 

  // Estados para listas
  const [nombreLista, setNombreLista] = useState('');
  const [descripcionLista, setDescripcionLista] = useState('');
  const [listas, setListas] = useState([]);
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [listaEditando, setListaEditando] = useState(null);
  const [nuevaDescripcionLista, setNuevaDescripcionLista] = useState('');
  
  // Nuevos estados para el dashboard de listas
  const [mostrarDashboardListas, setMostrarDashboardListas] = useState(false);
  const [mostrarModalLista, setMostrarModalLista] = useState(false);

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

  // useEffect inicial para cargar datos por primera vez
  useEffect(() => {
    cargarUsuarios();
    cargarListas();
  }, []);

  // useEffect separado que se ejecuta cuando cambia listaSeleccionada
  useEffect(() => {
    cargarTareas();
  }, [listaSeleccionada]); // Aquí está la clave - se ejecuta cuando cambia listaSeleccionada

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
    console.log('l')
    if (!titulo.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const nuevaTarea = {
        titulo: titulo,
        descripcion: descripcion,
        estado: estado,
        favorito,
        realizada, 
        nota: nota,
        fechaVencimiento: fechaVencimiento,
        usuarioId: usuarioId,
        listaId: listaId

      };
      console.log('nueva tarea', nuevaTarea) 

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
        usuarioId
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

  // Funciones para manejar listas
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
          usuarioId,
          ...(listaId && { listaId })
, 
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
        <div className="absolute top-0 right-0 h-full w-[350px] bg-white shadow-lg z-30 overflow-auto border-l border-gray-200">

           
          <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
           onClick={() => {
           setMostrarModalTarea(false);
           setTareaSeleccionada(null);
           limpiarFormulario();
           }}
            >
            &times; 
          </button>

          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
          {tareaSeleccionada && (
            <Subtareas tareaId={tareaSeleccionada.id} />
          )}

           <h2 className="text-lg font-bold text-blue-900 mb-4">
          {tareaSeleccionada ? 'Editar tarea' : 'Crear tarea'}
          </h2>

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
                <option value="progreso">progreso</option>
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
              </div>

              <div className="flex justify-between items-center mt-6">
               {tareaSeleccionada && ( 
              <button onClick={eliminarTarea}
               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
             >
               Eliminar
               </button>
               )} 

<div className="flex justify-end mt-4">
  <button
    className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded"
    onClick={tareaSeleccionada ? actualizarTarea : agregarTarea}
  >
    {tareaSeleccionada ? 'Guardar cambios' : 'Crear'}
  </button>

</div>

 </div>

  <select
  value={listaId}
  onChange={(e) => setlistaId(e.target.value)}
  className="w-full border border-gray-300 p-2 rounded"
>
  <option value="">Seleccionar lista</option>
  {listas.map((lista) => (
    <option key={lista.id} value={lista.id}>
      {lista.name}
    </option>
  ))}
</select>




            </div>
          </div>
      )}



      {/* MODAL LISTA */}
      {mostrarModalLista && (
        <div className="absolute top-0 right-0 h-full w-[350px] bg-white shadow-lg z-30 overflow-auto border-l border-gray-200">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
           onClick={() => {
           setMostrarModalLista(false);
           setListaEditando(null);
           limpiarFormularioLista();
           }}
            >
            &times; 
          </button>

          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
           <h2 className="text-lg font-bold text-blue-900 mb-4">
          {listaEditando ? 'Editar lista' : 'Crear lista'}
          </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la lista"
                value={nombreLista}
                onChange={(e) => setNombreLista(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm"
                required
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={descripcionLista}
                onChange={(e) => setDescripcionLista(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              />
              </div>

              <div className="flex justify-between items-center mt-6">
               {listaEditando && ( 
              <button onClick={eliminarLista}
               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
             >
               Eliminar
               </button>
               )} 

<div className="flex justify-end mt-4">
  
  <button
    className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded text-sm"
    onClick={listaEditando ? actualizarLista : agregarLista}
  >
    {listaEditando ? 'Guardar cambios' : 'Guardar lista'}
  </button> 
</div>
 </div>

  <select
  value={usuarioId}
  onChange={(e) => setUsuarioId(e.target.value)}
  className="w-full border border-gray-300 p-2 rounded"
>
  <option value="">Asignar a un usuario</option>
  {usuarios.map((usuario) => (
    <option key={usuario.id} value={usuario.id}>
      {usuario.username}
    </option>
  ))}
</select>


            </div>
          </div>
      )}
      


<button
  className="absolute top-4 left-4 text-blue-900 text-3xl z-40 focus:outline-none"
 onClick={() => setMostrarPanelIzquierdo(prev => !prev)}
>
  &#9776;
</button> 

{/* PANEL IZQUIERDO */}
{mostrarPanelIzquierdo && (
  <div className="h-full w-[250px] bg-white shadow-lg z-30 overflow-auto border-r border-gray-200 transition-transform duration-300">
    <button
      className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl"
      onClick={() => setMostrarPanelIzquierdo(false)}
    >
      &times;
    </button>

    <h2 className="text-lg font-bold text-blue-900 mb-6 px-4 mt-12"></h2>

    <ul className="space-y-4 px-4">
    <li>
  <button
    onClick={() => {
      setModoImportante(false);
      setListaSeleccionada(null);
      setMostrarDashboardListas(false);
      setMostrarPanelIzquierdo(false);
    }}
    className="text-blue-900 font-semibold hover:underline"
  >
    Tareas
  </button>
</li>

     <li>
  <button
    onClick={() => {
      setModoImportante(true);
      setMostrarDashboardListas(false);
      setMostrarPanelIzquierdo(false);
    }}
    className="text-blue-900 font-semibold hover:underline"
  >
    Importante
  </button>
</li> <br></br><br></br>

<li>
  <button
    onClick={() => {
      setMostrarDashboardListas(true);
      setModoImportante(false);
      setListaSeleccionada(null);
      setMostrarPanelIzquierdo(false);
    }}
    className="text-blue-900 font-semibold hover:underline"
  >
   Listas
  </button>
</li>
    </ul>
  </div>
)}

        {/* PANEL PRINCIPAL - DASHBOARD DE LISTAS */}
        {mostrarDashboardListas ? (
          <section className={`transition-all duration-300 p-6 overflow-auto border-r border-amber-50 ${mostrarModalLista ? 'w-[calc(100%-350px)]' : 'w-full'}`}>
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
                  <button onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-red-700 font-bold hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
           
            <div className="w-full flex justify-end mb-4">
             <input
                type="text"
                placeholder="+ Nueva"
                className="white px-4 py-2 rounded focus:outline-none placeholder-gray-400 bg-transparent border-none cursor-pointer"
                onClick={() => setMostrarModalLista(prev => !prev)}
                readOnly
            />
            </div>
            
            <ul className="space-y-3">
              {listas.map(lista => (
                <li
                  key={lista.id}
                  className="cursor-pointer bg-white p-4 rounded shadow flex justify-between items-center hover:bg-blue-50"
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
                    <span>
                      {lista.name}
                    </span>
                  </label>

                  <button onClick={e => {
                      e.stopPropagation();
                      // Aquí podrías agregar funcionalidad de favoritos para listas si quieres
                    }}
                    aria-label="Marcar como favorita"
                    className="focus:outline-none ml-3"
                  >
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
                  </button>
                </li>
              ))}
            </ul>
          </section>




        ) : (
          /* PANEL PRINCIPAL - TAREAS */
          <section className={`transition-all duration-300 p-6 overflow-auto border-r border-amber-50 ${mostrarModalTarea ? 'w-[calc(100%-350px)]' : 'w-full'}`}>
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
                  <button onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-red-700 font-bold hover:bg-gray-100"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
           
            <div className="w-full flex justify-end mb-4">
             <input
                type="text"
                placeholder="+ Nueva"
                className="white px-4 py-2 rounded focus:outline-none placeholder-gray-400 bg-transparent border-none cursor-pointer"
                onClick={() => setMostrarModalTarea(prev => !prev)}
                readOnly
            />

            {listaSeleccionada && (
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                 List: {listaSeleccionada.name}  
              </h2>
            )}
            </div>
            
            <ul className="space-y-3">
              {(modoImportante ? tareas.filter(t => t.favorito) : tareas).map(tarea => (
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
        )}
    </div>
  );
}