import { useEffect, useState } from 'react';
import Login from './Paginas/Login.jsx';
import Dashboard from './Paginas/Dashboard.jsx';

export default function App() {
  const [logueado, setLogueado] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App montado, revisando localStorage...');
    
    try {
      const token = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');
      
      console.log('Token:', token);
      console.log('Usuario guardado:', usuarioGuardado);

      if (token && usuarioGuardado) {
        const usuarioParseado = JSON.parse(usuarioGuardado);
        setLogueado(true);
        setUsuario(usuarioParseado);
        console.log('Usuario logueado desde localStorage');
      }
    } catch (error) {
      console.error('Error al leer localStorage:', error);
      
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    }
    
    setLoading(false);
  }, []);

  const manejarLogout = () => {
    console.log('Cerrando sesión...');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setLogueado(false);
    setUsuario(null);
  };

  console.log('Estado actual:', { logueado, usuario, loading });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {logueado ? (
        <Dashboard usuario={usuario} onLogout={manejarLogout} />
      ) : (
        <Login onLoginSuccess={(usuario) => {
          console.log('Login exitoso:', usuario);
          setUsuario(usuario);
          setLogueado(true);
        }} />
      )}
    </div>
  );
}