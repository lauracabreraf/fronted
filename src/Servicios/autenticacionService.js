const BASE_URL = 'http://localhost:3000/auth';


export async function login(email, password) {
  const resp = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message || 'Error en login');
  }

  return resp.json(); 
}

export async function registrar(email, password) {
  const resp = await fetch(`${BASE_URL}/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const data = await resp.json();
    throw new Error(data.message || 'Error en registro');
  }

  return resp.json(); 
}
