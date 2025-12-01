import { useState } from 'react';
import useAuth from '../hook/useAuth';
import { register } from '../services/login';

const LoginForm = ({ onSuccess }) => {
  const { singin } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);

  // Campos del formulario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // NUEVO CAMPO

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors = {};

    if (!username.trim()) errors.username = 'El usuario es obligatorio';

    if (!password) errors.password = 'La contraseña es obligatoria';

    if (isRegistering) {
      if (!email.trim()) errors.email = 'El email es obligatorio';
      else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email inválido';

      if (password !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setFieldErrors(errors);

    // Retorna true si no hay errores (el objeto keys tiene longitud 0)
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // 1. Validamos localmente primero
    if (!validate()) return;

    setLoading(true);

    try {
      if (isRegistering) {
        // --- MODO REGISTRO ---
        const { data: token, error: regError } = await register(username, password, email);

        if (regError) {
          // Si el error es un string simple, lo ponemos arriba.
          // Si tu backend devolviera errores por campo, aquí los mapearías.
          setGeneralError(typeof regError === 'string' ? regError : 'Error al registrarse');
          setLoading(false);

          return;
        }

        // Auto-Login después de registrar
        localStorage.setItem('token', token);
        await singin(username, password);

        if (onSuccess) onSuccess();

      } else {
        // --- MODO LOGIN ---
        const result = await singin(username, password);

        if (result.error) {
          setGeneralError('Usuario o contraseña incorrectos.');
        } else {
          if (onSuccess) onSuccess();
        }
      }
    } catch (err) {
      console.error(err);
      setGeneralError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setFieldErrors({}); // Limpiar errores al cambiar
    setGeneralError('');
  };

  return (
    <div className="w-full max-w-sm mx-auto p-1">
      {/* Título dinámico */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {isRegistering ? 'Registrar Usuario' : 'Iniciar Sesión'}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Campo USUARIO */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Usuario</label>
          <input
            type="text"
            className={`border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200 ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'}`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          {fieldErrors.username && <span className="text-red-500 text-xs font-medium">{fieldErrors.username}</span>}
        </div>

        {/* Campo EMAIL (Solo en Registro) */}
        {isRegistering && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Email</label>
            <input
              type="email"
              className={`border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email && <span className="text-red-500 text-xs font-medium">{fieldErrors.email}</span>}
          </div>
        )}

        {/* Campo CONTRASEÑA */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-600">Contraseña</label>
          <input
            type="password"
            className={`border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200 ${fieldErrors.password ? 'border-red-500' : 'border-gray-300'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && <span className="text-red-500 text-xs font-medium">{fieldErrors.password}</span>}
        </div>

        {/* Campo CONFIRMAR CONTRASEÑA (Solo en Registro) */}
        {isRegistering && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Confirmar contraseña</label>
            <input
              type="password"
              className={`border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-purple-200 ${fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword && <span className="text-red-500 text-xs font-medium">{fieldErrors.confirmPassword}</span>}
          </div>
        )}

        {/* Error General (del backend) */}
        {generalError && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{generalError}</p>}

        {/* BOTÓN PRINCIPAL */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full bg-purple-200 hover:bg-purple-300 text-purple-900 font-bold py-2 rounded-md transition"
        >
          {loading
            ? 'Procesando...'
            : (isRegistering ? 'Registrar Usuario' : 'Iniciar Sesión')
          }
        </button>

        {/* LINK PARA CAMBIAR DE MODO */}
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-gray-500 hover:text-purple-600 underline"
          >
            {isRegistering
              ? '¿Ya tienes cuenta? Inicia Sesión'
              : '¿No tienes cuenta? Regístrate aquí'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;