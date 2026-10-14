import axios from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Client HTTP — voir FRONTEND_API_GUIDE.md
//
// Une seule base URL pour TOUS les services. nginx monte dessus :
//   Django (slash final OBLIGATOIRE) : /auth/**  /affectation/**  /clm/**
//   Node   (PAS de slash final)      : /juridique/**  /bib/**  /notifications/**  /uploads/**
//
// REACT_APP_API_URL est lu au BUILD (CRA) : .env en local, variable d'env
// Netlify en production. Sans valeur → backend de production.
// ─────────────────────────────────────────────────────────────────────────────
const stripTrailingSlash = (url) => (url || '').replace(/\/+$/, '');

// `same-origin` (build de déploiement) : le navigateur appelle l'hôte qui a servi la page.
const configuredApi = stripTrailingSlash(process.env.REACT_APP_API_URL);
export const API_URL = configuredApi === 'same-origin'
  ? ''
  : (configuredApi || 'https://lexora.duckdns.org');
export const GATEWAY_URL = stripTrailingSlash(process.env.REACT_APP_GATEWAY_URL) || API_URL;

/** Timeout pour l'import OCR (POST /clm/contrats/upload/) — le serveur peut mettre jusqu'à 300 s. */
export const UPLOAD_TIMEOUT = 300000;

/**
 * Transforme un chemin relatif renvoyé par l'API en URL absolue.
 * Ex. pdfUrl "/uploads/1723980000000-123.pdf" → "https://lexora.duckdns.org/uploads/…"
 * (les fichiers /uploads sont publics : utilisables tels quels dans <iframe>/<a href>).
 */
export const toAbsoluteUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/\\/g, '/');
  return `${API_URL}${clean.startsWith('/') ? '' : '/'}${clean}`;
};

// Sur ces routes un 401 est une réponse "métier" (mauvais mot de passe, refresh
// expiré…) : on ne doit ni tenter un refresh ni rediriger.
const AUTH_PUBLIC_PATHS = [
  '/auth/login/',
  '/auth/token/refresh/',
  '/auth/logout/',
  '/auth/reset-password/',
  '/auth/reset-password-confirm/',
];
const isAuthPublicPath = (url = '') => AUTH_PUBLIC_PATHS.some((p) => url.includes(p));

// Le service auth répond 401 ({"code":"token_not_valid"}) ; affectation et clm
// vérifient le token via le service auth et répondent 403 {"detail":"Token invalide ou expiré."}.
// Les deux signifient "session à renouveler".
const isAuthFailure = (error) => {
  const status = error.response?.status;
  if (status === 401) return true;
  if (status === 403) {
    const detail = error.response?.data?.detail;
    return typeof detail === 'string' && /token/i.test(detail);
  }
  return false;
};

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

const clearSession = () => {
  localStorage.clear();
  delete axiosInstance.defaults.headers['Authorization'];
};

const redirectToLogin = () => {
  if (window.location.pathname !== '/login') window.location.href = '/login';
};

// Refresh "single-flight" : les refresh tokens tournent et sont à usage unique.
// Si plusieurs requêtes échouent en même temps (polling TopBar + chargement de page),
// une seule requête de refresh doit partir — une deuxième utiliserait un token
// déjà blacklisté et déconnecterait l'utilisateur à tort.
let refreshPromise = null;
const refreshAccessToken = () => {
  if (!refreshPromise) {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return Promise.reject(new Error('Aucun refresh token'));

    refreshPromise = axios
      .post(`${API_URL}/auth/token/refresh/`, { refresh }, { timeout: 15000 })
      .then((res) => {
        const { access, refresh: newRefresh } = res.data;
        // Le backend renvoie un nouveau couple access/refresh : stocker les DEUX.
        localStorage.setItem('access_token', access);
        if (newRefresh) localStorage.setItem('refresh_token', newRefresh);
        return access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// ✅ Intercepteur request — ajout automatique du token JWT
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && !isAuthPublicPath(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// ✅ Intercepteur response — renouvellement automatique de la session
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config || {};

    if (!isAuthFailure(error) || isAuthPublicPath(original.url) || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      const access = await refreshAccessToken();
      original.headers = { ...original.headers, Authorization: `Bearer ${access}` };
      return axiosInstance(original);
    } catch (refreshError) {
      console.error('🔴 Session expirée, déconnexion...');
      clearSession();
      redirectToLogin();
      return Promise.reject(error);
    }
  }
);

// Alias historique ("gateway") — même base que axiosInstance en production. Non utilisé.
const axiosApi = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { axiosInstance, axiosApi };

export default axiosInstance;
