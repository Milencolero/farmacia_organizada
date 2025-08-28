// ================================================================
// Utilidades para la gestión de sesión de usuario en localStorage
// ================================================================

const TOKEN_KEY = "token";
const USER_KEY = "usuarioLogeado";

/**
 * Guarda el token y el usuario en localStorage.
 * El token se incluye dentro del objeto de usuario para centralizar la información.
 * @param {string} token - Token JWT generado por el backend.
 * @param {object} user - Datos del usuario (nombre, rol, correo, etc.).
 */
export function setUserSession(token, user) {
  const userWithToken = { ...user, token };
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(userWithToken));
}

/**
 * Obtiene el token JWT desde localStorage.
 * @returns {string|null} Token si existe, null si no hay sesión.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Obtiene el usuario actualmente logeado desde localStorage.
 * @returns {object|null} Objeto usuario si existe, null si no hay sesión.
 */
export function getCurrentUser() {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

/**
 * Elimina la sesión de usuario y el token de localStorage.
 */
export function clearUserSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
