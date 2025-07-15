import { login, registrar } from '../Servicios/autenticacionService';
import { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoUsername, setNuevoUsername] = useState('');

  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [errorRegistro, setErrorRegistro] = useState('');

  const [modoRegistro, setModoRegistro] = useState(false);

  const [mostrarPasswordLogin, setMostrarPasswordLogin] = useState(false);
  const [mostrarPasswordRegistro, setMostrarPasswordRegistro] = useState(false);
  const [mostrarConfirmarPasswordRegistro, setMostrarConfirmarPasswordRegistro] = useState(false);

  const manejarLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const respuesta = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!respuesta.ok) throw new Error('Credenciales incorrectas');

      const data = await respuesta.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      onLoginSuccess(data.usuario); 
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarRegistro = async (e) => {
  e.preventDefault();
  setErrorRegistro('');

  if (nuevaPassword !== confirmarPassword) {
    setErrorRegistro('Las contraseñas no coinciden');
    return;
  }

  try {
    const respuesta = await fetch('http://localhost:3000/auth/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: nuevoUsername, 
        email: nuevoEmail,
        password: nuevaPassword,
      }),
    });

    if (!respuesta.ok) {
      const dataError = await respuesta.json();
      throw new Error(dataError.message || 'Error al crear usuario');
    }

    alert('Usuario creado con éxito, ahora inicia sesión');
    setModoRegistro(false);
    setNuevoEmail('');
    setNuevoUsername('');
    setNuevaPassword('');
    setConfirmarPassword('');
  } catch (err) {
    setErrorRegistro(err.message);
  }
};


  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      {!modoRegistro ? (
        <form
          onSubmit={manejarLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Iniciar sesión</h2>

          {error && (
            <div className="mb-4 text-sm text-red-500 font-medium text-center">
              {error}
            </div>
          )}

       


          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6 relative">
            <label className="block text-gray-700 mb-1">Contraseña:</label>
            <input
              type={mostrarPasswordLogin ? 'text' : 'password'}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-700"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setMostrarPasswordLogin(!mostrarPasswordLogin)}
              className="absolute right-3 top-9"
              tabIndex={-1}
              aria-label={mostrarPasswordLogin ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <EyeIcon abierto={mostrarPasswordLogin} />
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded transition hover:bg-blue-800"
          >
            Entrar
          </button>

          <p className="mt-4 text-center text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              className="text-blue-900 hover:underline"
              onClick={() => setModoRegistro(true)}
            >
              Crear una
            </button>
          </p>
        </form>
      ) : (
        <form
          onSubmit={manejarRegistro}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Crear cuenta</h2>

          {errorRegistro && (
            <div className="mb-4 text-sm text-red-500 font-medium text-center">
              {errorRegistro}
            </div>
          )}


             <div className="mb-4">
  <label className="block text-gray-700 mb-1">Nombre de usuario:</label>
  <input
    type="text"
    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
    value={nuevoUsername}
    onChange={(e) => setNuevoUsername(e.target.value)}
    required
  />
</div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4 relative">
            <label className="block text-gray-700 mb-1">Contraseña:</label>
            <input
              type={mostrarPasswordRegistro ? 'text' : 'password'}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9"
              onClick={() => setMostrarPasswordRegistro(!mostrarPasswordRegistro)}
              tabIndex={-1}
              aria-label={mostrarPasswordRegistro ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <EyeIcon abierto={mostrarPasswordRegistro} />
            </button>
          </div>

          <div className="mb-6 relative">
            <label className="block text-gray-700 mb-1">Repetir Contraseña:</label>
            <input
              type={mostrarConfirmarPasswordRegistro ? 'text' : 'password'}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-600"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9"
              onClick={() => setMostrarConfirmarPasswordRegistro(!mostrarConfirmarPasswordRegistro)}
              tabIndex={-1}
              aria-label={mostrarConfirmarPasswordRegistro ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              <EyeIcon abierto={mostrarConfirmarPasswordRegistro} />
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 transition"
          >
            Crear cuenta
          </button>

          <p className="mt-4 text-center text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              className="text-blue-900 hover:underline"
              onClick={() => setModoRegistro(false)}
            >
              Iniciar sesión
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
