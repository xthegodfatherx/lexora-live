const axios = require('axios');
const jwt = require('jsonwebtoken');

const GATEWAY_URL = (process.env.GATEWAY_URL || 'https://lexora.duckdns.org').replace(/\/+$/, '');

async function resolve(token) {
  const res = await axios.get(`${GATEWAY_URL}/auth/users/me/`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 8000,
  });
  const u = res.data?.data || res.data?.user || res.data;
  if (!u || (!u.id && !u.user_id)) return null;
  return {
    id: String(u.id || u.user_id),
    role: u.role || 'agent',
    nom: u.nom_complet || `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Utilisateur',
  };
}

async function auth(req, res, next) {
  if (process.env.DER_OPEN_DEV === '1' && !req.headers.authorization) {
    req.user = { id: 'dev', role: 'admin', nom: 'Session locale DER' };
    return next();
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ success: false, message: 'Authentification requise' });

  try {
    const user = await resolve(token);
    if (user) {
      req.user = user;
      return next();
    }
  } catch (err) {
    if (process.env.DER_OPEN_DEV !== '1' && !process.env.JWT_SECRET) {
      return res.status(401).json({ success: false, message: 'Session invalide' });
    }
  }

  try {
    const payload = process.env.JWT_SECRET
      ? jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
      : jwt.decode(token);
    if (!payload?.user_id && process.env.DER_OPEN_DEV !== '1') {
      return res.status(401).json({ success: false, message: 'Session invalide' });
    }
    const nom = decodeURIComponent(req.headers['x-lexora-name'] || 'Utilisateur');
    req.user = {
      id: String(payload?.user_id || 'dev'),
      role: req.headers['x-lexora-role'] || 'agent',
      nom,
    };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session invalide' });
  }
}

module.exports = { auth };
