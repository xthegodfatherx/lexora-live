import React, { useEffect, useState } from 'react';
import { derApi, saveBlob } from './api';

const TABS = [
  ['pilotage', 'Pilotage'],
  ['demande', 'Nouvelle demande'],
  ['dossiers', 'Dossiers'],
  ['modeles', 'Modèles d\'avis'],
  ['veille', 'Veille'],
  ['patrimoine', 'Patrimoine'],
  ['rapport', 'Rapport DG'],
  ['corpus', 'Corpus interne'],
];

const STATUT = {
  assigne: 'Assigné',
  en_cours: 'En cours',
  soumis_chef: 'Soumis au chef',
  rejete_chef: 'Renvoyé par le chef',
  valide_chef: 'Validé chef',
  soumis_directeur: 'Soumis au directeur',
  rejete_directeur: 'Renvoyé par le directeur',
  valide_directeur: 'Validé directeur',
  livre: 'Livré',
  archive: 'Archivé',
};

const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white';
const btn = 'px-3 py-2 rounded-lg text-sm font-medium bg-[#FF8500] text-white hover:bg-orange-600 disabled:opacity-50';
const btnGhost = 'px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50';

function errMsg(e) {
  return e?.response?.data?.message || e.message || 'Erreur';
}

function Card({ title, children, extra }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {extra}
      </div>
      {children}
    </section>
  );
}

export default function DerWorkspace() {
  const [tab, setTab] = useState('pilotage');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const flash = (e) => setError(errMsg(e));
  const ok = (m) => { setError(''); setInfo(m); };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-orange-600 font-semibold">SONATRACH — DCJ</p>
        <h1 className="text-2xl font-semibold text-gray-900">Direction Études et Réglementation</h1>
        <p className="text-sm text-gray-500 mt-1">Saisie, routage, rédaction sur le corpus interne, validation, livraison, archivage.</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => { setTab(id); setError(''); setInfo(''); }} className={`px-3 py-1.5 rounded-full text-sm ${tab === id ? 'bg-[#FF8500] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {info && <p className="text-sm text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{info}</p>}
      {tab === 'pilotage' && <Pilotage onError={flash} />}
      {tab === 'demande' && <Demande onError={flash} onOk={ok} />}
      {tab === 'dossiers' && <Dossiers onError={flash} onOk={ok} />}
      {tab === 'modeles' && <Modeles onError={flash} onOk={ok} />}
      {tab === 'veille' && <Veille onError={flash} onOk={ok} />}
      {tab === 'patrimoine' && <Patrimoine onError={flash} onOk={ok} />}
      {tab === 'rapport' && <Rapport onError={flash} />}
      {tab === 'corpus' && <Corpus onError={flash} />}
    </div>
  );
}

function Pilotage({ onError }) {
  const [dash, setDash] = useState(null);
  const [structure, setStructure] = useState(null);
  useEffect(() => {
    Promise.all([derApi.dashboard(), derApi.structure()]).then(([d, s]) => { setDash(d); setStructure(s); }).catch(onError);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (!dash || !structure) return <p className="text-sm text-gray-500">Chargement du pilotage…</p>;
  const k = dash.kpi;
  const rows = [
    ['Délai moyen de traitement', k.delaiMoyenJoursOuvres.valeur == null ? '—' : `${k.delaiMoyenJoursOuvres.valeur} j. ouvrés`, k.delaiMoyenJoursOuvres.cible],
    ['Taux de respect des délais', k.tauxRespectDelais.valeur == null ? '—' : `${k.tauxRespectDelais.valeur} %`, k.tauxRespectDelais.cible],
    ['Nouveaux textes ce mois', String(k.textesTraitesMois.valeur), k.textesTraitesMois.cible],
    ['Actifs à échéance < 90 j', `${k.actifsEcheance90j.valeur} dont ${k.actifsEcheance90j.nonAlertes} non alerté(s)`, k.actifsEcheance90j.cible],
    ['Satisfaction demandeurs', k.satisfaction.valeur == null ? '—' : `${k.satisfaction.valeur} / 5`, k.satisfaction.cible],
  ];
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        {[
          ['Dossiers', dash.compteurs.dossiers],
          ['Ouverts', dash.compteurs.enCours],
          ['Fiches de textes', dash.compteurs.fiches],
          ['Actifs', dash.compteurs.actifs],
        ].map(([l, v]) => (
          <div key={l} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-semibold">{v}</p>
            <p className="text-sm text-gray-500">{l}</p>
          </div>
        ))}
      </div>
      <Card title="Indicateurs DER">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500"><th className="py-2">Indicateur</th><th>Valeur</th><th>Cible</th></tr></thead>
          <tbody>
            {rows.map(([a, b, c]) => (
              <tr key={a} className="border-t border-gray-100"><td className="py-2">{a}</td><td>{b}</td><td>{c}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title={`${structure.direction.nom} (${structure.direction.code})`}>
        <ul className="space-y-2 text-sm">
          {structure.departements.map((d) => (
            <li key={d.code}><span className="font-medium">{d.code}</span> — {d.nom}. {d.mission}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Demande({ onError, onOk }) {
  const [meta, setMeta] = useState(null);
  const [form, setForm] = useState({ type: 'analyse', canal: 'activite', urgence: 'normale', activite: 'TRC', objet: '', textesApplicables: '', delai: '', documentRecu: '' });
  useEffect(() => { derApi.meta().then(setMeta).catch(onError); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    try {
      const d = await derApi.creerDossier(form);
      onOk(`${d.reference} routé vers ${d.departement}`);
      setForm((f) => ({ ...f, objet: '', textesApplicables: '', documentRecu: '' }));
    } catch (err) { onError(err); }
  };
  if (!meta) return null;
  return (
    <Card title="Fiche de demande">
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm">Type
          <select className={input} value={form.type} onChange={set('type')}>
            <option value="analyse">Analyse juridique</option>
            <option value="veille">Veille / avis sur document</option>
            <option value="patrimonial">Suivi patrimonial</option>
          </select>
        </label>
        <label className="text-sm">Canal
          <select className={input} value={form.canal} onChange={set('canal')}>
            <option value="activite">Activité — formulaire de demande</option>
            <option value="dg">Direction Générale — ticket prioritaire</option>
            <option value="direction_contrats">Direction Contrats</option>
            <option value="direction_differends">Direction Différends</option>
            <option value="direction_conformite">Direction Conformité</option>
          </select>
        </label>
        <label className="text-sm">Urgence
          <select className={input} value={form.urgence} onChange={set('urgence')}>
            <option value="normale">Normale</option>
            <option value="haute">Haute</option>
            <option value="critique">Critique</option>
          </select>
        </label>
        <label className="text-sm">Activité
          <select className={input} value={form.activite} onChange={set('activite')}>
            {meta.activites.map((a) => <option key={a}>{a}</option>)}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">Objet
          <input className={input} value={form.objet} onChange={set('objet')} required />
        </label>
        <label className="text-sm sm:col-span-2">Textes applicables
          <textarea className={input} rows={3} value={form.textesApplicables} onChange={set('textesApplicables')} />
        </label>
        <label className="text-sm">Délai de réponse
          <input type="date" className={input} value={form.delai} onChange={set('delai')} />
        </label>
        <label className="text-sm sm:col-span-2">Document reçu (avis sur pièce)
          <textarea className={input} rows={3} value={form.documentRecu} onChange={set('documentRecu')} />
        </label>
        <div><button className={btn} type="submit">Enregistrer et router</button></div>
      </form>
    </Card>
  );
}

function Dossiers({ onError, onOk }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ search: '', departement: '', activite: '', theme: '' });
  const [current, setCurrent] = useState(null);
  const load = () => derApi.dossiers(filters).then(setRows).catch(onError);
  useEffect(() => { load(); }, []); // eslint-disable-line
  const open = async (id) => {
    try { setCurrent(await derApi.dossier(id)); } catch (e) { onError(e); }
  };
  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-4">
      <Card title="Historique" extra={<button className={btnGhost} type="button" onClick={load}>Filtrer</button>}>
        <div className="space-y-2 mb-3">
          <input className={input} placeholder="Référence, objet…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input className={input} placeholder="Thème" value={filters.theme} onChange={(e) => setFilters({ ...filters, theme: e.target.value })} />
          <input className={input} placeholder="Activité" value={filters.activite} onChange={(e) => setFilters({ ...filters, activite: e.target.value })} />
        </div>
        <ul className="space-y-2 max-h-[32rem] overflow-auto">
          {rows.map((d) => (
            <li key={d.id}>
              <button type="button" onClick={() => open(d.id)} className="w-full text-left border border-gray-200 rounded-lg px-3 py-2 hover:border-orange-400">
                <p className="text-sm font-medium">{d.reference}</p>
                <p className="text-xs text-gray-500">{d.objet}</p>
                <p className="text-xs text-orange-700">{STATUT[d.statut] || d.statut} · {d.departement}</p>
              </button>
            </li>
          ))}
          {!rows.length && <p className="text-sm text-gray-500">Aucun dossier.</p>}
        </ul>
      </Card>
      {current ? <DossierDetail dossier={current} onChange={setCurrent} onError={onError} onOk={onOk} /> : <Card title="Dossier"><p className="text-sm text-gray-500">Sélectionnez un dossier.</p></Card>}
    </div>
  );
}

function DossierDetail({ dossier, onChange, onError, onOk }) {
  const [corps, setCorps] = useState(dossier.corps || '');
  const [analyste, setAnalyste] = useState(dossier.analysteNom || '');
  const [note, setNote] = useState('5');
  useEffect(() => { setCorps(dossier.corps || ''); setAnalyste(dossier.analysteNom || ''); }, [dossier.id, dossier.corps, dossier.analysteNom]);

  const run = async (fn, message) => {
    try {
      const d = await fn();
      onChange(d);
      onOk(message);
    } catch (e) { onError(e); }
  };
  const wrap = (mark) => {
    const el = document.getElementById('corps-der');
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = corps.slice(start, end) || 'texte';
    const next = `${corps.slice(0, start)}${mark}${selected}${mark}${corps.slice(end)}`;
    setCorps(next);
  };

  return (
    <Card title={dossier.reference} extra={<span className="text-xs text-orange-700">{STATUT[dossier.statut]}</span>}>
      <dl className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
        <div><dt className="text-gray-500">Département</dt><dd>{dossier.departement}</dd></div>
        <div><dt className="text-gray-500">Activité</dt><dd>{dossier.activite || '—'}</dd></div>
        <div><dt className="text-gray-500">Canal / urgence</dt><dd>{dossier.canal} · {dossier.urgence}{dossier.prioritaire ? ' · prioritaire' : ''}</dd></div>
        <div><dt className="text-gray-500">Délai</dt><dd>{dossier.delai || '—'}</dd></div>
        <div className="sm:col-span-2"><dt className="text-gray-500">Objet</dt><dd>{dossier.objet}</dd></div>
        <div className="sm:col-span-2"><dt className="text-gray-500">Textes applicables</dt><dd>{dossier.textesApplicables || '—'}</dd></div>
      </dl>
      <div className="flex flex-wrap gap-2 mb-2">
        <button type="button" className={btnGhost} onClick={() => wrap('**')}>Gras</button>
        <button type="button" className={btnGhost} onClick={() => run(() => derApi.assister(dossier.id).then((r) => { setCorps(r.corps); return { ...dossier, corps: r.corps, citations: r.citations }; }), 'Proposition insérée depuis le corpus interne')}>Rédiger avec le corpus</button>
        <button type="button" className={btn} onClick={() => run(() => derApi.modifierDossier(dossier.id, { corps }), 'Corps enregistré')}>Enregistrer</button>
      </div>
      <textarea id="corps-der" className={`${input} font-mono`} rows={12} value={corps} onChange={(e) => setCorps(e.target.value)} />
      {!!dossier.citations?.length && (
        <ul className="mt-2 text-xs text-gray-600 space-y-1">
          {dossier.citations.map((c) => <li key={c.id}>{c.ref} — {c.title}</li>)}
        </ul>
      )}
      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <input className={`${input} max-w-xs`} placeholder="Analyste assigné" value={analyste} onChange={(e) => setAnalyste(e.target.value)} />
        <button type="button" className={btnGhost} onClick={() => run(() => derApi.assigner(dossier.id, { analysteNom: analyste }), 'Analyste assigné')}>Assigner</button>
        {['soumis_chef', 'valide_chef', 'rejete_chef', 'soumis_directeur', 'valide_directeur', 'rejete_directeur', 'livre', 'archive'].map((action) => (
          <button key={action} type="button" className={btnGhost} onClick={() => run(() => derApi.transition(dossier.id, action), STATUT[action] || action)}>
            {STATUT[action] || action}
          </button>
        ))}
        <button type="button" className={btnGhost} onClick={() => run(() => derApi.signer(dossier.id), 'Sceau interne apposé')}>Apposer le sceau DCJ</button>
        <button type="button" className={btn} onClick={async () => { try { saveBlob(await derApi.pdf(dossier.id), `${dossier.reference}.pdf`); } catch (e) { onError(e); } }}>PDF</button>
      </div>
      {['livre', 'archive'].includes(dossier.statut) && (
        <form className="flex gap-2 mt-3 items-end" onSubmit={(e) => { e.preventDefault(); run(() => derApi.satisfaction(dossier.id, { note: Number(note) }), 'Satisfaction enregistrée'); }}>
          <label className="text-sm">Note de satisfaction
            <input type="number" min="1" max="5" className={input} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button className={btn} type="submit">Envoyer</button>
        </form>
      )}
      <ol className="mt-4 text-xs text-gray-500 space-y-1">
        {dossier.historique.map((h, i) => <li key={i}>{h.date?.slice(0, 16).replace('T', ' ')} — {h.action} — {h.par} {h.commentaire ? `· ${h.commentaire}` : ''}</li>)}
      </ol>
    </Card>
  );
}

function Modeles({ onError, onOk }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ nom: '', departement: 'DER-AJ', corps: '' });
  const load = () => derApi.modeles().then(setRows).catch(onError);
  useEffect(() => { load(); }, []); // eslint-disable-line
  return (
    <div className="space-y-4">
      {rows.map((t) => (
        <Card key={t.id} title={`${t.nom} · ${t.departement}`}>
          <pre className="text-xs whitespace-pre-wrap text-gray-700">{t.corps}</pre>
        </Card>
      ))}
      <Card title="Nouveau modèle">
        <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); try { await derApi.creerModele(form); setForm({ nom: '', departement: 'DER-AJ', corps: '' }); onOk('Modèle ajouté'); load(); } catch (err) { onError(err); } }}>
          <input className={input} placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          <select className={input} value={form.departement} onChange={(e) => setForm({ ...form, departement: e.target.value })}>
            <option>DER-AJ</option><option>DER-RVJ</option><option>DER-SJOP</option>
          </select>
          <textarea className={input} rows={6} placeholder="Corps du modèle" value={form.corps} onChange={(e) => setForm({ ...form, corps: e.target.value })} required />
          <button className={btn} type="submit">Ajouter</button>
        </form>
      </Card>
    </div>
  );
}

function Veille({ onError, onOk }) {
  const [sources, setSources] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [journal, setJournal] = useState([]);
  const [ficheId, setFicheId] = useState('');
  const [versions, setVersions] = useState([]);
  const [corps, setCorps] = useState('');
  const [form, setForm] = useState({ titre: '', texte: '', sourceId: 'jora', statutTexte: 'en_vigueur' });
  const [profil, setProfil] = useState({ nom: '', themes: '', activites: 'TRC' });
  const load = async () => {
    const [s, f, j] = await Promise.all([derApi.sources(), derApi.fiches(), derApi.journal()]);
    setSources(s); setFiches(f); setJournal(j);
  };
  useEffect(() => { load().catch(onError); }, []); // eslint-disable-line
  return (
    <div className="space-y-4">
      <Card title="Sources surveillées" extra={<button className={btn} type="button" onClick={async () => { try { const e = await derApi.collecte(); onOk(e.message); load(); } catch (err) { onError(err); } }}>Lancer la collecte JORA</button>}>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500"><th>Source</th><th>Type</th><th>Pertinence SONATRACH</th></tr></thead>
          <tbody>{sources.map((s) => <tr key={s.id} className="border-t border-gray-100"><td className="py-2">{s.nom}</td><td>{s.type}</td><td>{s.pertinence}</td></tr>)}</tbody>
        </table>
        {!!journal[0] && <p className="text-xs text-gray-500 mt-2">Dernière collecte : {journal[0].message}</p>}
      </Card>
      <Card title="Fiche de texte">
        <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); try { const f = await derApi.creerFiche(form); onOk(`${f.reference} — résumé et impact calculés sur le corpus interne`); setForm({ ...form, titre: '', texte: '' }); load(); } catch (err) { onError(err); } }}>
          <input className={input} placeholder="Titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} required />
          <select className={input} value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: e.target.value })}>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
          <select className={input} value={form.statutTexte} onChange={(e) => setForm({ ...form, statutTexte: e.target.value })}>
            <option value="en_vigueur">En vigueur</option>
            <option value="abroge">Abrogé</option>
            <option value="modifie">Modifié</option>
          </select>
          <textarea className={input} rows={5} placeholder="Texte intégral" value={form.texte} onChange={(e) => setForm({ ...form, texte: e.target.value })} required />
          <button className={btn} type="submit">Créer la fiche</button>
        </form>
      </Card>
      {fiches.map((f) => (
        <Card key={f.id} title={`${f.reference} — ${f.titre}`}>
          <p className="text-sm">{f.resume}</p>
          <p className="text-xs text-gray-500 mt-2">Impact : {(f.impact || []).map((i) => `${i.activite} (${i.raison})`).join(' · ') || 'aucun terme sectoriel'}</p>
          <p className="text-xs text-gray-500">Textes liés : {(f.textesLies || []).map((t) => t.title).join(', ') || '—'}</p>
          <p className="text-xs mt-1">Statut du texte : {f.statutTexte}</p>
        </Card>
      ))}
      <Card title="Commentaire juridique (versions)">
        <select className={input} value={ficheId} onChange={async (e) => { setFicheId(e.target.value); setVersions(e.target.value ? await derApi.commentaires(e.target.value) : []); }}>
          <option value="">Choisir une fiche</option>
          {fiches.map((f) => <option key={f.id} value={f.id}>{f.titre}</option>)}
        </select>
        <textarea className={`${input} mt-2`} rows={4} value={corps} onChange={(e) => setCorps(e.target.value)} />
        <button className={`${btn} mt-2`} type="button" onClick={async () => { try { const c = await derApi.commenter({ ficheId, corps }); setVersions([c]); setCorps(''); onOk(`Version ${c.versions.length} enregistrée`); } catch (e) { onError(e); } }}>Enregistrer une version</button>
        <ol className="mt-3 text-xs space-y-2">
          {(versions[0]?.versions || []).map((v) => <li key={v.n}><span className="font-medium">v{v.n}</span> — {v.auteur} — {v.date?.slice(0, 16).replace('T', ' ')}<pre className="whitespace-pre-wrap">{v.corps}</pre></li>)}
        </ol>
      </Card>
      <Card title="Alerte ciblée">
        <form className="grid sm:grid-cols-3 gap-2" onSubmit={async (e) => { e.preventDefault(); try { await derApi.creerProfil({ nom: profil.nom, activites: profil.activites.split(',').map((s) => s.trim()).filter(Boolean), themes: profil.themes.split(',').map((s) => s.trim()).filter(Boolean) }); onOk('Profil de veille enregistré'); } catch (err) { onError(err); } }}>
          <input className={input} placeholder="Nom du profil" value={profil.nom} onChange={(e) => setProfil({ ...profil, nom: e.target.value })} required />
          <input className={input} placeholder="Activités, séparées par des virgules" value={profil.activites} onChange={(e) => setProfil({ ...profil, activites: e.target.value })} />
          <input className={input} placeholder="Thèmes" value={profil.themes} onChange={(e) => setProfil({ ...profil, themes: e.target.value })} />
          <button className={btn} type="submit">Enregistrer le profil</button>
        </form>
      </Card>
    </div>
  );
}

function Patrimoine({ onError, onOk }) {
  const [actifs, setActifs] = useState([]);
  const [ops, setOps] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [fiches, setFiches] = useState([]);
  const [form, setForm] = useState({ intitule: '', type: 'concession', activite: 'Amont', statutJuridique: 'actif', echeance: '', documents: '', textesIds: [] });
  const [op, setOp] = useState({ actifId: '', nature: 'acquisition', objet: '' });
  const load = async () => {
    const [a, o, al, f] = await Promise.all([derApi.actifs(), derApi.operations(), derApi.alertes(), derApi.fiches()]);
    setActifs(a); setOps(o); setAlertes(al); setFiches(f);
  };
  useEffect(() => { load().catch(onError); }, []); // eslint-disable-line
  return (
    <div className="space-y-4">
      <Card title="Registre des actifs">
        <form className="grid sm:grid-cols-2 gap-2 mb-4" onSubmit={async (e) => { e.preventDefault(); try { await derApi.creerActif({ ...form, documents: form.documents.split(',').map((s) => s.trim()).filter(Boolean) }); onOk('Actif enregistré'); load(); } catch (err) { onError(err); } }}>
          <input className={input} placeholder="Intitulé" value={form.intitule} onChange={(e) => setForm({ ...form, intitule: e.target.value })} required />
          <select className={input} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="foncier">Foncier</option>
            <option value="participation">Participation</option>
            <option value="concession">Concession</option>
            <option value="droit_reel">Droit réel</option>
          </select>
          <select className={input} value={form.activite} onChange={(e) => setForm({ ...form, activite: e.target.value })}>
            {['Amont', 'Aval', 'TRC', 'LNG', 'Commerce'].map((a) => <option key={a}>{a}</option>)}
          </select>
          <select className={input} value={form.statutJuridique} onChange={(e) => setForm({ ...form, statutJuridique: e.target.value })}>
            <option value="actif">Actif</option>
            <option value="litigieux">Litigieux</option>
            <option value="en_regularisation">En cours de régularisation</option>
          </select>
          <input type="date" className={input} value={form.echeance} onChange={(e) => setForm({ ...form, echeance: e.target.value })} />
          <input className={input} placeholder="Titres, actes, permis (virgules)" value={form.documents} onChange={(e) => setForm({ ...form, documents: e.target.value })} />
          <label className="text-sm sm:col-span-2">Textes de la bibliothèque de veille liés
            <select multiple className={input} value={form.textesIds} onChange={(e) => setForm({ ...form, textesIds: [...e.target.selectedOptions].map((o) => o.value) })}>
              {fiches.map((f) => <option key={f.id} value={f.id}>{f.titre}</option>)}
            </select>
          </label>
          <button className={btn} type="submit">Ajouter l'actif</button>
        </form>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500"><th>Réf.</th><th>Intitulé</th><th>Type</th><th>Activité</th><th>Statut</th><th>Échéance</th></tr></thead>
          <tbody>
            {actifs.map((a) => (
              <tr key={a.id} className="border-t border-gray-100">
                <td className="py-2">{a.reference}</td><td>{a.intitule}</td><td>{a.type}</td><td>{a.activite}</td><td>{a.statutJuridique}</td><td>{a.echeance || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Acquisition et cession">
        <form className="flex flex-wrap gap-2 mb-3" onSubmit={async (e) => { e.preventDefault(); try { await derApi.creerOperation(op); onOk('Opération soumise'); load(); } catch (err) { onError(err); } }}>
          <select className={input} value={op.actifId} onChange={(e) => setOp({ ...op, actifId: e.target.value })} required>
            <option value="">Actif</option>
            {actifs.map((a) => <option key={a.id} value={a.id}>{a.reference}</option>)}
          </select>
          <select className={input} value={op.nature} onChange={(e) => setOp({ ...op, nature: e.target.value })}>
            <option value="acquisition">Acquisition</option>
            <option value="cession">Cession</option>
          </select>
          <input className={input} placeholder="Objet" value={op.objet} onChange={(e) => setOp({ ...op, objet: e.target.value })} />
          <button className={btn} type="submit">Soumettre</button>
        </form>
        <ul className="text-sm space-y-2">
          {ops.map((o) => (
            <li key={o.id} className="flex flex-wrap gap-2 items-center">
              <span>{o.nature} — {o.objet || o.actifId} — {o.statut}</span>
              <button className={btnGhost} type="button" onClick={async () => { try { await derApi.decider(o.id, 'approuve'); load(); } catch (e) { onError(e); } }}>Approuver</button>
              <button className={btnGhost} type="button" onClick={async () => { try { await derApi.decider(o.id, 'rejete'); load(); } catch (e) { onError(e); } }}>Rejeter</button>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Alertes 90 j / 30 j et veille">
        <ul className="text-sm space-y-1">
          {alertes.map((a) => <li key={a.id} className={a.lu ? 'text-gray-400' : ''}>{a.message}</li>)}
          {!alertes.length && <li className="text-gray-500">Aucune alerte.</li>}
        </ul>
      </Card>
    </div>
  );
}

function Rapport({ onError }) {
  const [mois, setMois] = useState(new Date().toISOString().slice(0, 7));
  const [rapport, setRapport] = useState(null);
  const load = () => derApi.rapport(mois).then(setRapport).catch(onError);
  useEffect(() => { load(); }, []); // eslint-disable-line
  if (!rapport) return null;
  return (
    <Card title={`Rapport ${rapport.mois}`} extra={<button className={btn} type="button" onClick={async () => { try { saveBlob(await derApi.rapportPdf(mois), `DER-${mois}.pdf`); } catch (e) { onError(e); } }}>PDF Direction Générale</button>}>
      <div className="flex gap-2 mb-3">
        <input type="month" className={input} value={mois} onChange={(e) => setMois(e.target.value)} />
        <button className={btnGhost} type="button" onClick={load}>Actualiser</button>
      </div>
      <h3 className="font-medium text-sm mb-1">Analyses produites</h3>
      <ul className="text-sm mb-3">{rapport.analyses.map((a) => <li key={a.reference}>{a.reference} — {a.objet} — {a.delaiJoursOuvres ?? '—'} j. ouvrés</li>)}{!rapport.analyses.length && <li>Aucune.</li>}</ul>
      <h3 className="font-medium text-sm mb-1">Veille</h3>
      <ul className="text-sm mb-3">{rapport.veille.map((f) => <li key={f.reference}>{f.reference} — {f.titre}</li>)}{!rapport.veille.length && <li>Aucune.</li>}</ul>
      <h3 className="font-medium text-sm mb-1">Patrimoine</h3>
      <p className="text-sm">{rapport.patrimoine.actifs} actif(s), {rapport.patrimoine.alertes} alerte(s) d'échéance.</p>
    </Card>
  );
}

function Corpus({ onError }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [texte, setTexte] = useState('');
  const [contrat, setContrat] = useState('');
  const [appli, setAppli] = useState(null);
  const [src, setSrc] = useState('');
  const [trad, setTrad] = useState(null);
  return (
    <div className="space-y-4">
      <Card title="Recherche dans les avis et fiches antérieurs">
        <p className="text-xs text-gray-500 mb-2">Calcul local sur le corpus SONATRACH déjà versé. Aucune donnée ne sort de ce service.</p>
        <form className="flex gap-2" onSubmit={async (e) => { e.preventDefault(); try { setHits(await derApi.recherche(q)); } catch (err) { onError(err); } }}>
          <input className={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Thème, texte, activité…" />
          <button className={btn} type="submit">Chercher</button>
        </form>
        <ul className="mt-3 text-sm space-y-2">{hits.map((h) => <li key={h.id}><span className="font-medium">{h.ref} — {h.title}</span><p className="text-gray-600">{h.extrait}</p></li>)}</ul>
      </Card>
      <Card title="Question juridique">
        <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); try { setAnswer(await derApi.question({ question })); } catch (err) { onError(err); } }}>
          <textarea className={input} rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button className={btn} type="submit">Répondre depuis le corpus</button>
        </form>
        {answer && <pre className="text-sm whitespace-pre-wrap mt-3">{answer.reponse}</pre>}
      </Card>
      <Card title="Ce texte s'applique-t-il à ce contrat ?">
        <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); try { setAppli(await derApi.question({ texte, contrat })); } catch (err) { onError(err); } }}>
          <textarea className={input} rows={3} placeholder="Texte" value={texte} onChange={(e) => setTexte(e.target.value)} />
          <textarea className={input} rows={3} placeholder="Contrat ou activité" value={contrat} onChange={(e) => setContrat(e.target.value)} />
          <button className={btn} type="submit">Comparer</button>
        </form>
        {appli && <p className="text-sm mt-3">{appli.message}</p>}
      </Card>
      <Card title="Traduction arabe / français">
        <form className="space-y-2" onSubmit={async (e) => { e.preventDefault(); try { setTrad(await derApi.traduire(src, 'ar')); } catch (err) { onError(err); } }}>
          <textarea className={input} rows={3} value={src} onChange={(e) => setSrc(e.target.value)} placeholder="Texte juridique en français" />
          <button className={btn} type="submit">Vers l'arabe (glossaire interne)</button>
        </form>
        {trad && <p className="text-sm mt-3" dir="auto">{trad.texte}</p>}
        {trad && <p className="text-xs text-gray-500 mt-1">{trad.note}</p>}
      </Card>
    </div>
  );
}
