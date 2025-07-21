import { useState } from 'react';
import { useEffect } from 'react';
import Subtareas from '../Paginas/Subtareas';



export default function Dashboard({ usuario, onLogout }) {
   
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]); 
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
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
  const [usuarioId, setUsuarioId] = useState('1'); 
  const [listaId, setlistaId] = useState('1');
  





  const user = localStorage.getItem('usuario')

  const wipeUser = JSON.parse(user) 


  useEffect(() => {
  if (tareaSeleccionada) {
    setTitulo(tareaSeleccionada.titulo || '');
    setDescripcion(tareaSeleccionada.descripcion || '');
    setEstado(tareaSeleccionada.estado || 'pendiente');
    setNota(tareaSeleccionada.nota || '');
    setFechaVencimiento(tareaSeleccionada.fechaVencimiento?.substring(0, 10) || '');
    setUsuarioId(tareaSeleccionada.usuarioId || '');
    setMostrarModalTarea(true);
  }
 }, [tareaSeleccionada]);




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





    



    
    
    const cargarUsuarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/users/Listar', {

          headers: {
            Authorization: `Bearer ${token}`,

          },
        });
        const data = await response.json();
        console.log('lll')
       
         
        Array.isArray(data) ? setUsuarios(data) : setUsuarios([]);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
       
        
      }
    };

    cargarTareas();
    cargarUsuarios();
  }, []);





 
  
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













  
  


  

  
  const agregarTarea = async () => {
    console.log('l')
    if (!titulo.trim()) return;

    try {
      const token = localStorage.getItem('token');

      const nuevaTarea = {
  
        titulo: titulo,
        descripcion: descripcion,
        estado: estado,
        favorito: false, 
        realizada: false, 
        nota: nota,
        fechaVencimiento: fechaVencimiento,
        usuarioId: usuarioId
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

 
  


   





    {/* FORMULARIO MODAL - CREAR TAREA*/}

   return (
    
    <div className="flex h-screen bg-gray-50">
  
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


 
            </div>
          </div>
  

       
      )}






        {/* PANEL IZQUIERDO*/}

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








        <h1 className="text-2xl font-bold mb-6 text-blue-900">Todo List</h1>
     
        <div className="w-full flex justify-end mb-4">


          
         <input
  type="text"
  placeholder="+ Nueva"
  className="white px-4 py-2 rounded focus:outline-none placeholder-gray-400 bg-transparent border-none cursor-pointer"
  onClick={() => setMostrarModalTarea(prev => !prev)}
  readOnly
/>


      
         
        </div>

     

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

              <button onClick={e => {
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


    </div>


  );
  
}