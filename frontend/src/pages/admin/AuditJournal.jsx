import React, { useEffect, useMemo, useState } from 'react';
import axios from '../../axios';

const DOMAINS = [
  { id: '', label: 'Tout' },
  { id: 'connexion', label: 'Connexions' },
  { id: 'structure', label: 'Structure' },
  { id: 'affectation', label: 'Affectations' },
  { id: 'contrat', label: 'Contrats' },
  { id: 'bibliotheque', label: 'Bibliothèque' },
  { id: 'der', label: 'DER' },
  { id: 'alerte', label: 'Alertes' },
];

const ROLE_LABELS = {
  admin: 'Administrateur',
  vice_presedent: 'Vice-président',
  directeur_centrale: 'Directeur central',
  assistant_directeur_centrale: 'Assistant directeur central',
  directeur_direction: 'Directeur de direction',
  responsable_departement: 'Responsable de département',
  system: 'Système',
};

const DOMAIN_TONE = {
  connexion: 'bg-sky-100 text-sky-800',
  structure: 'bg-violet-100 text-violet-800',
  affectation: 'bg-orange-100 text-orange-800',
  contrat: 'bg-emerald-100 text-emerald-800',
  bibliotheque: 'bg-amber-100 text-amber-800',
  der: 'bg-rose-100 text-rose-800',
  alerte: 'bg-yellow-100 text-yellow-800',
};

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
}

const AuditJournal = () => {
  const [events, setEvents] = useState([]);
  const [domain, setDomain] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/audit/events', { params: domain ? { domain } : {} });
        if (!cancelled) setEvents(response.data.data || []);
      } catch (err) {
        if (!cancelled) setError('Impossible de charger le journal d\'audit.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [domain]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return events;
    return events.filter((event) =>
      `${event.actor} ${event.action} ${event.target} ${event.result}`.toLowerCase().includes(needle)
    );
  }, [events, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Journal d'audit</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-3xl">
            Piste des connexions, des modifications structurelles et des actions sensibles
            (affectations, contrats, dépôts documentaires, validations DER).
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-4">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher un acteur, une action ou une cible"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8500] bg-gray-50"
          />
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((item) => (
              <button
                key={item.id || 'all'}
                type="button"
                onClick={() => setDomain(item.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  domain === item.id
                    ? 'bg-[#FF8500] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">{visible.length} événement{visible.length !== 1 ? 's' : ''}</p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500">Chargement du journal…</div>
        ) : visible.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500">Aucun événement pour ce filtre.</div>
        ) : (
          <>
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Acteur</th>
                    <th className="px-4 py-3 font-medium">Domaine</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Cible</th>
                    <th className="px-4 py-3 font-medium">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((event) => (
                    <tr key={event.id} className="border-t border-gray-100 align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatWhen(event.at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{event.actor}</p>
                        <p className="text-xs text-gray-400">{ROLE_LABELS[event.role] || event.role}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${DOMAIN_TONE[event.domain] || 'bg-gray-100 text-gray-600'}`}>
                          {DOMAINS.find((item) => item.id === event.domain)?.label || event.domain}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-800">{event.action}</td>
                      <td className="px-4 py-3 text-gray-600">{event.target}</td>
                      <td className="px-4 py-3 text-gray-600">{event.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {visible.map((event) => (
                <article key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${DOMAIN_TONE[event.domain] || 'bg-gray-100 text-gray-600'}`}>
                      {DOMAINS.find((item) => item.id === event.domain)?.label || event.domain}
                    </span>
                    <time className="text-xs text-gray-400 whitespace-nowrap">{formatWhen(event.at)}</time>
                  </div>
                  <h2 className="font-semibold text-gray-800">{event.action}</h2>
                  <p className="text-sm text-gray-600">{event.target}</p>
                  <p className="text-sm text-gray-500">{event.result}</p>
                  <p className="text-xs text-gray-400">{event.actor} · {ROLE_LABELS[event.role] || event.role}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuditJournal;
