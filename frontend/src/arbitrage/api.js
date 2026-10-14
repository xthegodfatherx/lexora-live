import axios from '../axios';

export const arbitrageApi = {
  modules: (lang) => axios.get('/arbitrage/modules', { params: { lang } }),
  list: (moduleId, lang) => axios.get(`/arbitrage/modules/${moduleId}`, { params: { lang } }),
  item: (id, lang) => axios.get(`/arbitrage/items/${id}`, { params: { lang } }),
  search: (q, lang) => axios.get('/arbitrage/search', { params: { q, lang } }),
  dashboard: () => axios.get('/arbitrage/dashboard'),
  addVeille: (body) => axios.post('/arbitrage/veille', body),
};
