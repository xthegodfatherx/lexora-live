import React, { useEffect, useState } from 'react';
import axios from '../../axios';

const DAYS = [
  { id: 'dimanche', label: 'Dim' },
  { id: 'lundi', label: 'Lun' },
  { id: 'mardi', label: 'Mar' },
  { id: 'mercredi', label: 'Mer' },
  { id: 'jeudi', label: 'Jeu' },
  { id: 'vendredi', label: 'Ven' },
  { id: 'samedi', label: 'Sam' },
];

const fieldClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF8500]';

const Configuration = () => {
  const [form, setForm] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get('/juridique/parametres');
        if (cancelled) return;
        const data = response.data.data;
        setRoles(data.roles || []);
        setForm({
          organisation: data.organisation,
          calendrier: { joursOuvres: data.calendrier.joursOuvres },
          alertes: data.alertes,
          securite: data.securite,
          activites: data.activites,
        });
      } catch (err) {
        if (!cancelled) setError('Impossible de charger les paramètres.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const patch = (section, key, value) => {
    setForm((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
  };

  const toggleDay = (day) => {
    setForm((current) => {
      const selected = current.calendrier.joursOuvres.includes(day);
      const joursOuvres = selected
        ? current.calendrier.joursOuvres.filter((item) => item !== day)
        : [...current.calendrier.joursOuvres, day];
      return { ...current, calendrier: { joursOuvres } };
    });
  };

  const patchActivite = (activiteId, key, value) => {
    setForm((current) => ({
      ...current,
      activites: current.activites.map((row) => (row.activiteId === activiteId ? { ...row, [key]: value } : row)),
    }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await axios.put('/juridique/parametres', form);
      const data = response.data.data;
      setForm({
        organisation: data.organisation,
        calendrier: { joursOuvres: data.calendrier.joursOuvres },
        alertes: data.alertes,
        securite: data.securite,
        activites: data.activites,
      });
      setNotice(response.data.message || 'Paramètres enregistrés');
    } catch (err) {
      setError(err.response?.data?.message || 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Chargement des paramètres…</div>;
  }
  if (!form) {
    return <div className="p-8 text-red-600">{error || 'Paramètres indisponibles.'}</div>;
  }

  return (
    <form onSubmit={save} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Configuration</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-3xl">
              Paramètres centraux et paramètres par activité : identité, calendrier algérien, seuils d'alerte et sessions.
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF8500] text-white font-semibold disabled:opacity-60"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}
        {notice && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl">{notice}</div>}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Identité</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm text-gray-600">
              Raison sociale
              <input className={`${fieldClass} mt-1`} value={form.organisation.raisonSociale} onChange={(event) => patch('organisation', 'raisonSociale', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-600">
              Code
              <input className={`${fieldClass} mt-1`} value={form.organisation.code} onChange={(event) => patch('organisation', 'code', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-600 sm:col-span-2">
              Direction centrale
              <input className={`${fieldClass} mt-1`} value={form.organisation.directionCentrale} onChange={(event) => patch('organisation', 'directionCentrale', event.target.value)} />
            </label>
            <label className="block text-sm text-gray-600">
              Langue
              <select className={`${fieldClass} mt-1`} value={form.organisation.langue} onChange={(event) => patch('organisation', 'langue', event.target.value)}>
                <option value="fr">Français</option>
                <option value="ar">Arabe</option>
              </select>
            </label>
            <label className="block text-sm text-gray-600">
              Fuseau
              <input className={`${fieldClass} mt-1`} value={form.organisation.fuseau} readOnly />
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Calendrier</h2>
          <p className="text-sm text-gray-500">Jours ouvrés en orange. Le week-end algérien est vendredi et samedi.</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const open = form.calendrier.joursOuvres.includes(day.id);
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`px-3 py-2 rounded-full text-sm font-medium ${open ? 'bg-[#FF8500] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Alertes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block text-sm text-gray-600">
              Contrats (jours)
              <input type="number" min="1" max="365" className={`${fieldClass} mt-1`} value={form.alertes.contratsJours} onChange={(event) => patch('alertes', 'contratsJours', Number(event.target.value))} />
            </label>
            <label className="block text-sm text-gray-600">
              Patrimoine (jours)
              <input type="number" min="1" max="365" className={`${fieldClass} mt-1`} value={form.alertes.patrimoineJours} onChange={(event) => patch('alertes', 'patrimoineJours', Number(event.target.value))} />
            </label>
            <label className="block text-sm text-gray-600">
              Délai d'avis DER (jours ouvrés)
              <input type="number" min="1" max="30" className={`${fieldClass} mt-1`} value={form.alertes.delaiAvisJoursOuvres} onChange={(event) => patch('alertes', 'delaiAvisJoursOuvres', Number(event.target.value))} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.alertes.notificationsActives} onChange={(event) => patch('alertes', 'notificationsActives', event.target.checked)} />
            Notifications d'échéance actives
          </label>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-sm text-gray-600">
              Durée du jeton (heures)
              <input type="number" min="1" max="72" className={`${fieldClass} mt-1`} value={form.securite.dureeJetonHeures} onChange={(event) => patch('securite', 'dureeJetonHeures', Number(event.target.value))} />
            </label>
            <label className="block text-sm text-gray-600">
              Durée du renouvellement (jours)
              <input type="number" min="1" max="30" className={`${fieldClass} mt-1`} value={form.securite.dureeRefreshJours} onChange={(event) => patch('securite', 'dureeRefreshJours', Number(event.target.value))} />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.securite.invalidationSession} onChange={(event) => patch('securite', 'invalidationSession', event.target.checked)} />
            Invalider la session à la déconnexion
          </label>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Paramètres par activité</h2>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-gray-500">
                <tr>
                  <th className="py-2 pr-3 font-medium">Activité</th>
                  <th className="py-2 pr-3 font-medium">Seuil d'alerte (jours)</th>
                  <th className="py-2 font-medium">Devise</th>
                </tr>
              </thead>
              <tbody>
                {form.activites.map((row) => (
                  <tr key={row.activiteId} className="border-t border-gray-100">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-gray-800">{row.nom}</p>
                      <p className="text-xs text-gray-400">{row.code}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <input type="number" min="1" max="365" className={`${fieldClass} max-w-[8rem]`} value={row.seuilAlerteJours} onChange={(event) => patchActivite(row.activiteId, 'seuilAlerteJours', Number(event.target.value))} />
                    </td>
                    <td className="py-3">
                      <select className={`${fieldClass} max-w-[8rem]`} value={row.devise} onChange={(event) => patchActivite(row.activiteId, 'devise', event.target.value)}>
                        <option value="DZD">DZD</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {form.activites.map((row) => (
              <article key={row.activiteId} className="border border-gray-100 rounded-xl p-3 space-y-3">
                <div>
                  <p className="font-medium text-gray-800">{row.nom}</p>
                  <p className="text-xs text-gray-400">{row.code}</p>
                </div>
                <label className="block text-sm text-gray-600">
                  Seuil d'alerte (jours)
                  <input type="number" min="1" max="365" className={`${fieldClass} mt-1`} value={row.seuilAlerteJours} onChange={(event) => patchActivite(row.activiteId, 'seuilAlerteJours', Number(event.target.value))} />
                </label>
                <label className="block text-sm text-gray-600">
                  Devise
                  <select className={`${fieldClass} mt-1`} value={row.devise} onChange={(event) => patchActivite(row.activiteId, 'devise', event.target.value)}>
                    <option value="DZD">DZD</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-3">
          <h2 className="font-semibold text-gray-800">Rôles</h2>
          <p className="text-sm text-gray-500">Référentiel d'accès. L'affectation des rôles se fait depuis les utilisateurs.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((role) => (
              <article key={role.code} className="border border-gray-100 rounded-xl p-3">
                <p className="font-medium text-gray-800">{role.nom}</p>
                <p className="text-xs text-gray-400 mt-0.5">{role.code}</p>
                <p className="text-sm text-gray-600 mt-2">{role.perimetre}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </form>
  );
};

export default Configuration;
