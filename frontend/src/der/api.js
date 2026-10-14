import axios from 'axios';
import { API_URL } from '../axios';

const derConfigured = (process.env.REACT_APP_DER_URL || '').replace(/\/+$/, '');
export const DER_BASE = !derConfigured || derConfigured === 'same-origin'
  ? (process.env.NODE_ENV === 'development' ? 'http://localhost:8086' : API_URL)
  : derConfigured;

const der = axios.create({ baseURL: DER_BASE, timeout: 60000 });

der.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const role = localStorage.getItem('role');
  const nom = localStorage.getItem('nom_complet');
  if (role) config.headers['X-Lexora-Role'] = role;
  if (nom) config.headers['X-Lexora-Name'] = encodeURIComponent(nom);
  return config;
});

const data = (res) => res.data.data;

export const derApi = {
  structure: () => der.get('/der/structure').then(data),
  meta: () => der.get('/der/meta').then(data),
  dashboard: () => der.get('/der/dashboard').then(data),
  rapport: (mois) => der.get('/der/rapports/mensuel', { params: { mois } }).then(data),
  rapportPdf: (mois) => der.get('/der/rapports/mensuel/pdf', { params: { mois }, responseType: 'blob' }).then((r) => r.data),
  dossiers: (params) => der.get('/der/dossiers', { params }).then(data),
  dossier: (id) => der.get(`/der/dossiers/${id}`).then(data),
  creerDossier: (body) => der.post('/der/dossiers', body).then(data),
  modifierDossier: (id, body) => der.patch(`/der/dossiers/${id}`, body).then(data),
  assigner: (id, body) => der.post(`/der/dossiers/${id}/assigner`, body).then(data),
  transition: (id, action, commentaire) => der.post(`/der/dossiers/${id}/transition`, { action, commentaire }).then(data),
  assister: (id, templateId) => der.post(`/der/dossiers/${id}/assister`, { templateId }).then(data),
  signer: (id) => der.post(`/der/dossiers/${id}/signer`).then(data),
  pdf: (id) => der.get(`/der/dossiers/${id}/pdf`, { responseType: 'blob' }).then((r) => r.data),
  satisfaction: (id, body) => der.post(`/der/dossiers/${id}/satisfaction`, body).then(data),
  modeles: () => der.get('/der/modeles').then(data),
  creerModele: (body) => der.post('/der/modeles', body).then(data),
  sources: () => der.get('/der/veille/sources').then(data),
  collecte: () => der.post('/der/veille/collecte').then(data),
  journal: () => der.get('/der/veille/journal').then(data),
  fiches: () => der.get('/der/veille/fiches').then(data),
  creerFiche: (body) => der.post('/der/veille/fiches', body).then(data),
  commentaires: (ficheId) => der.get('/der/veille/commentaires', { params: { ficheId } }).then(data),
  commenter: (body) => der.post('/der/veille/commentaires', body).then(data),
  profils: () => der.get('/der/veille/profils').then(data),
  creerProfil: (body) => der.post('/der/veille/profils', body).then(data),
  actifs: () => der.get('/der/patrimoine/actifs').then(data),
  creerActif: (body) => der.post('/der/patrimoine/actifs', body).then(data),
  operations: () => der.get('/der/patrimoine/operations').then(data),
  creerOperation: (body) => der.post('/der/patrimoine/operations', body).then(data),
  decider: (id, decision) => der.post(`/der/patrimoine/operations/${id}/decision`, { decision }).then(data),
  alertes: () => der.get('/der/alertes').then(data),
  lireAlerte: (id) => der.post(`/der/alertes/${id}/lu`).then(data),
  recherche: (q) => der.post('/der/corpus/recherche', { q }).then(data),
  question: (body) => der.post('/der/corpus/question', body).then(data),
  traduire: (texte, vers) => der.post('/der/corpus/traduire', { texte, vers }).then(data),
};

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
