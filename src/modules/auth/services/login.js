import { instance } from '../../shared/api/axiosInstance';
// --- SERVICIO DE LOGIN ---
export const login = async (username, password) => {
  try {
    const response = await instance.post('/api/auth/login', { username, password });

    return { data: response.data.token, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || 'Error de conexión' };
  }
};

// ---Servicio de Registro ---
export const register = async (username, password, email) => {
  try {
    const response = await instance.post('/api/auth/register', {
      username,
      password,
      email,
    });

    return { data: response.data.token, error: null };
  } catch (error) {

    console.error(error);
    const msg = error.response?.data?.[0]?.description || 'Error al registrarse';

    return { data: null, error: msg };
  }
};