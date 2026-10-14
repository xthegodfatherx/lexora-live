import React, { useEffect, useState } from 'react';
import { arbitrageApi } from './api';

const UI = {
  fr: {
    title: 'Arbitrage international',
    subtitle: 'Banque de données — aide à la décision. BIT = accords bilatéraux d\'investissement.',
    search: 'Recherche transversale',
    placeholder: 'Algérie + hydrocarbures + CIRDI + expropriation + 2020-2026',
    empty: 'Aucun résultat visible pour votre profil.',
    links: 'Entités liées',
    cited: 'Cité par',
    compare: 'Comparer les BIT sélectionnés',
    veille: 'Ajouter une veille',
    save: 'Enregistrer',
  },
  ar: {
    title: 'التحكيم الدولي',
    subtitle: 'بنك معلومات للمساعدة على القرار. اتفاقيات الاستثمار الثنائية.',
    search: 'بحث شامل',
    placeholder: 'الجزائر + محروقات + سيدي + نزع الملكية + 2020-2026',
    empty: 'لا توجد نتائج ظاهرة لصلاحياتك.',
    links: 'الكيانات المرتبطة',
    cited: 'مشار إليه من',
    compare: 'مقارنة الاتفاقيتين',
    veille: 'إضافة متابعة',
    save: 'حفظ',
  },
};

const SECTION_ORDER = [
  ['identification', 'Identification'],
  ['clause', 'Clause arbitrale'],
  ['chronologie', 'Chronologie'],
  ['argumentsDemandeur', 'Arguments du demandeur'],
  ['argumentsSonatrach', 'Arguments de SONATRACH'],
  ['risques', 'Risques'],
  ['montants', 'Montants'],
  ['strategie', 'Stratégie'],
  ['delais', 'Délais à venir'],
  ['documents', 'Documents'],
  ['historique', 'Historique des décisions'],
];

function FieldGrid({ data }) {
  if (!data || typeof data !== 'object') return <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(data || '')}</p>;
  if (Array.isArray(data)) {
    return (
      <div className="space-y-2">
        {data.map((row, index) => (
          <div key={index} className="text-sm text-gray-700 border border-gray-100 rounded-lg p-2">
            {typeof row === 'string' ? row : Object.entries(row).map(([key, value]) => (
              <p key={key}><span className="text-gray-400">{key} : </span>{String(value)}</p>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(data).map(([key, value]) => (
        <p key={key} className="text-sm text-gray-700">
          <span className="block text-xs uppercase text-gray-400">{key}</span>
          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
        </p>
      ))}
    </div>
  );
}

const ArbitrageWorkspace = () => {
  const [lang, setLang] = useState('fr');
  const [modules, setModules] = useState([]);
  const [active, setActive] = useState('dashboard');
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [query, setQuery] = useState('');
  const [groups, setGroups] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [selectedBits, setSelectedBits] = useState([]);
  const [compare, setCompare] = useState([]);
  const [error, setError] = useState('');
  const [veille, setVeille] = useState({ titre_fr: '', resume_fr: '', categorie: 'Sentences' });
  const text = UI[lang];

  const loadModules = async (nextLang) => {
    const response = await arbitrageApi.modules(nextLang);
    setModules(response.data.data || []);
  };

  useEffect(() => {
    loadModules(lang).catch(() => setError('Service arbitrage indisponible.'));
  }, [lang]);

  const openModule = async (moduleId) => {
    setActive(moduleId);
    setDetail(null);
    setGroups(null);
    setCompare([]);
    setError('');
    if (moduleId === 'dashboard') {
      const response = await arbitrageApi.dashboard();
      setDashboard(response.data.data);
      return;
    }
    const response = await arbitrageApi.list(moduleId, lang);
    setRows(response.data.data || []);
  };

  useEffect(() => {
    openModule('dashboard').catch(() => setError('Service arbitrage indisponible.'));
    // initial dashboard only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openItem = async (id) => {
    const response = await arbitrageApi.item(id, lang);
    setDetail(response.data.data);
    setGroups(null);
  };

  const runSearch = async (event) => {
    event?.preventDefault();
    setError('');
    const response = await arbitrageApi.search(query, lang);
    setGroups(response.data.data || []);
    setDetail(null);
    setActive('search');
  };

  const toggleBit = (id) => {
    setSelectedBits((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) return [current[1], id];
      return [...current, id];
    });
  };

  const runCompare = async () => {
    const details = await Promise.all(selectedBits.map(async (id) => (await arbitrageApi.item(id, lang)).data.data));
    setCompare(details);
    setDetail(null);
  };

  const submitVeille = async (event) => {
    event.preventDefault();
    await arbitrageApi.addVeille(veille);
    setVeille({ titre_fr: '', resume_fr: '', categorie: 'Sentences' });
    openModule('veille');
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{text.title}</h1>
              <p className="text-sm text-gray-500 mt-1 max-w-3xl">{text.subtitle}</p>
            </div>
            <div className="flex gap-2">
              {['fr', 'ar'].map((code) => (
                <button key={code} type="button" onClick={() => setLang(code)} className={`px-3 py-1.5 rounded-full text-sm font-medium ${lang === code ? 'bg-[#FF8500] text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {code === 'fr' ? 'FR' : 'عربي'}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.placeholder} className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FF8500]" />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#FF8500] text-white font-semibold">{text.search}</button>
          </form>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 flex gap-2 overflow-x-auto">
        {modules.map((item) => (
          <button key={item.id} type="button" onClick={() => openModule(item.id)} className={`shrink-0 px-3 py-2 rounded-xl text-sm border ${active === item.id ? 'bg-orange-50 border-[#FF8500] text-orange-700' : 'bg-white border-gray-200 text-gray-600'}`}>
            <span className="text-xs text-gray-400">{item.n}</span> {item.libelle}
            {item.total !== null && <span className="ms-2 text-xs text-gray-400">{item.total}</span>}
          </button>
        ))}
      </div>

      <div className="px-4 sm:px-6 lg:px-8 pb-8 space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">{error}</div>}

        {active === 'dashboard' && dashboard && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['Arbitrages', dashboard.arbitrages],
                ['Dossiers', dashboard.dossiers],
                ['Sentences', dashboard.sentences],
                ['Questions', dashboard.questions],
              ].map(([label, value]) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="text-2xl font-bold text-[#FF8500]">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section className="bg-white rounded-2xl border border-gray-100 p-4">
                <h2 className="font-semibold text-gray-800 mb-2">Montants visibles</h2>
                <p className="text-sm text-gray-600">Réclamés : {dashboard.montantsReclames.toLocaleString('fr-FR')} USD</p>
                <p className="text-sm text-gray-600">Provisionnés : {dashboard.montantsProvisionnes.toLocaleString('fr-FR')} USD</p>
              </section>
              <section className="bg-white rounded-2xl border border-gray-100 p-4">
                <h2 className="font-semibold text-gray-800 mb-2">Échéances à 30 jours</h2>
                {dashboard.echeances.length === 0 && <p className="text-sm text-gray-500">Aucune échéance visible.</p>}
                {dashboard.echeances.map((item) => (
                  <p key={item.objet} className="text-sm text-gray-700">{item.date} — {item.objet}</p>
                ))}
              </section>
            </div>
          </div>
        )}

        {active === 'search' && groups && (
          <div className="space-y-4">
            {groups.length === 0 && <p className="text-gray-500">{text.empty}</p>}
            {groups.map((group) => (
              <section key={group.module} className="bg-white rounded-2xl border border-gray-100 p-4">
                <h2 className="font-semibold text-gray-800">{group.libelle} <span className="text-sm text-gray-400">({group.total})</span></h2>
                <div className="mt-3 space-y-2">
                  {group.resultats.map((item) => (
                    <button key={item.id} type="button" onClick={() => openItem(item.id)} className="w-full text-start border border-gray-100 rounded-xl p-3 hover:border-orange-200">
                      <p className="font-medium text-gray-800">{item.titre}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.extrait}</p>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {active !== 'dashboard' && active !== 'search' && !detail && compare.length === 0 && (
          <div className="space-y-3">
            {active === 'bits' && selectedBits.length === 2 && (
              <button type="button" onClick={runCompare} className="px-4 py-2 rounded-xl bg-gray-800 text-white text-sm">{text.compare}</button>
            )}
            {active === 'veille' && (
              <form onSubmit={submitVeille} className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <h2 className="sm:col-span-2 font-semibold text-gray-800">{text.veille}</h2>
                <input required value={veille.titre_fr} onChange={(event) => setVeille({ ...veille, titre_fr: event.target.value })} placeholder="Titre" className="px-3 py-2 border border-gray-200 rounded-xl" />
                <input value={veille.resume_fr} onChange={(event) => setVeille({ ...veille, resume_fr: event.target.value })} placeholder="Résumé" className="px-3 py-2 border border-gray-200 rounded-xl" />
                <button type="submit" className="sm:col-span-2 w-fit px-4 py-2 rounded-xl bg-[#FF8500] text-white text-sm">{text.save}</button>
              </form>
            )}
            {rows.length === 0 && <p className="text-gray-500">{text.empty}</p>}
            {rows.map((item) => (
              <article key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                {active === 'bits' && (
                  <input type="checkbox" checked={selectedBits.includes(item.id)} onChange={() => toggleBit(item.id)} className="mt-1" />
                )}
                <button type="button" onClick={() => openItem(item.id)} className="text-start flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-gray-800">{item.titre}</h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{item.confidentialite}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{item.resume}</p>
                  <p className="text-xs text-gray-400 mt-2">{item.themes.join(' · ')} {item.annee ? `· ${item.annee}` : ''}</p>
                </button>
              </article>
            ))}
          </div>
        )}

        {compare.length === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {compare.map((item) => (
              <section key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                <h2 className="font-semibold text-gray-800">{item.titre_fr}</h2>
                {['traitementJuste', 'expropriation', 'mfn', 'parapluie', 'cirdi', 'cnutci'].map((key) => (
                  <p key={key} className="text-sm text-gray-700"><span className="text-gray-400">{key} — </span>{item.champs[key]}</p>
                ))}
              </section>
            ))}
          </div>
        )}

        {detail && (
          <article className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
            <button type="button" onClick={() => setDetail(null)} className="text-sm text-[#FF8500]">←</button>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{detail.titre}</h2>
              {detail.titre_ar && lang !== 'ar' && <p className="text-sm text-gray-500 mt-1" dir="rtl">{detail.titre_ar}</p>}
              <p className="text-sm text-gray-600 mt-2">{detail.resume_fr}</p>
            </div>
            {detail.module === 'dossiers' ? (
              <div className="space-y-4">
                {SECTION_ORDER.map(([key, title]) => (
                  <section key={key}>
                    <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                    {key === 'chronologie' ? (
                      <div className="space-y-2 border-s-2 border-orange-200 ps-3">
                        {(detail.champs.chronologie || []).map((row) => (
                          <p key={row.date} className="text-sm text-gray-700"><span className="text-gray-400">{row.date}</span> — {row.evenement} ({row.document})</p>
                        ))}
                      </div>
                    ) : (
                      <FieldGrid data={detail.champs[key]} />
                    )}
                  </section>
                ))}
              </div>
            ) : (
              <FieldGrid data={detail.champs} />
            )}
            <section>
              <h3 className="font-semibold text-gray-800 mb-2">{text.links}</h3>
              <div className="flex flex-wrap gap-2">
                {detail.liensResolus.sortants.map((link) => (
                  <button key={`${link.module}-${link.id}`} type="button" onClick={() => openItem(link.id)} className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-800 text-sm">
                    {link.relation} · {link.titre}
                  </button>
                ))}
                {detail.liensResolus.entrants.map((link) => (
                  <button key={`in-${link.id}`} type="button" onClick={() => openItem(link.id)} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">
                    {text.cited} · {link.titre}
                  </button>
                ))}
              </div>
            </section>
          </article>
        )}
      </div>
    </div>
  );
};

export default ArbitrageWorkspace;
