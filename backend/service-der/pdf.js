const PDFDocument = require('pdfkit');

function strip(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function dossierPdf(dossier) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 72).fill('#1f4e79');
    doc.fillColor('#ffffff').fontSize(11).text('SONATRACH — Direction Centrale Juridique', 56, 22, { width: 480 });
    doc.fontSize(16).text('Direction Études et Réglementation', 56, 40);
    doc.fillColor('#111111');
    doc.moveDown(3);
    doc.fontSize(13).text(dossier.reference, { underline: false });
    doc.moveDown(0.4);
    doc.fontSize(10).fillColor('#444444');
    doc.text(`Type : ${dossier.type}    Département : ${dossier.departement}`);
    doc.text(`Activité : ${dossier.activite || '—'}    Urgence : ${dossier.urgence}    Canal : ${dossier.canal}`);
    doc.text(`Saisie : ${dossier.dateSaisie?.slice(0, 10) || ''}    Délai : ${dossier.delai || '—'}    Statut : ${dossier.statut}`);
    doc.moveDown(0.6);
    doc.fillColor('#111111').fontSize(12).text('Objet');
    doc.fontSize(11).text(dossier.objet);
    if (dossier.textesApplicables) {
      doc.moveDown(0.5);
      doc.fontSize(12).text('Textes applicables');
      doc.fontSize(11).text(dossier.textesApplicables);
    }
    doc.moveDown(0.5);
    doc.fontSize(12).text('Corps du livrable');
    doc.fontSize(11).text(strip(dossier.corps) || '[Corps non rédigé]', { align: 'justify' });

    doc.moveDown(1);
    const y = doc.y + 8;
    doc.roundedRect(56, y, 480, 92, 4).stroke('#1f4e79');
    doc.fontSize(10).fillColor('#1f4e79').text('TAMPON DCJ — DER', 70, y + 10);
    if (dossier.signature) {
      doc.fillColor('#111111').fontSize(9);
      doc.text(`${dossier.signature.tampon}`, 70, y + 26, { width: 450 });
      doc.text(`Signataire : ${dossier.signature.signataire} (${dossier.signature.role})  ${dossier.signature.date?.slice(0, 16).replace('T', ' ')}`, 70, y + 42, { width: 450 });
      doc.text(`Empreinte SHA-256 : ${dossier.signature.empreinte}`, 70, y + 58, { width: 450 });
      doc.fillColor('#666666').text(dossier.signature.nature, 70, y + 74, { width: 450 });
    } else {
      doc.fillColor('#666666').fontSize(9).text('Sceau non apposé. La validation du directeur DER est requise avant l\'export signé.', 70, y + 36, { width: 450 });
    }
    doc.end();
  });
}

function rapportPdf(rapport) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56, size: 'A4' });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    doc.fontSize(16).text(`Rapport mensuel DER — ${rapport.mois}`);
    doc.moveDown(0.4);
    doc.fontSize(11).text('Direction Générale — synthèse automatique LEXORA');
    doc.moveDown();
    doc.fontSize(13).text('Analyses produites');
    doc.fontSize(10);
    if (!rapport.analyses.length) doc.text('Aucune analyse sur la période.');
    for (const a of rapport.analyses) {
      doc.text(`${a.reference} — ${a.objet} (${a.activite || 'activité non précisée'}) — ${a.delaiJoursOuvres ?? '—'} j. ouvrés`);
    }
    doc.moveDown();
    doc.fontSize(13).text('Veille réglementaire');
    doc.fontSize(10);
    if (!rapport.veille.length) doc.text('Aucune fiche sur la période.');
    for (const f of rapport.veille) {
      doc.text(`${f.reference} — ${f.titre}`);
      if (f.impact?.length) doc.text(`Impact : ${f.impact.map((i) => i.activite).join(', ')}`);
    }
    doc.moveDown();
    doc.fontSize(13).text('Patrimoine juridique');
    doc.fontSize(10).text(`Actifs : ${rapport.patrimoine.actifs}    Alertes d'échéance : ${rapport.patrimoine.alertes}`);
    doc.moveDown();
    doc.fontSize(13).text('Indicateurs');
    const k = rapport.indicateurs;
    doc.fontSize(10);
    doc.text(`Délai moyen : ${k.delaiMoyenJoursOuvres.valeur ?? '—'} (cible ${k.delaiMoyenJoursOuvres.cible})`);
    doc.text(`Respect des délais : ${k.tauxRespectDelais.valeur ?? '—'} % (cible ${k.tauxRespectDelais.cible})`);
    doc.text(`Textes du mois : ${k.textesTraitesMois.valeur}`);
    doc.text(`Actifs < 90 j : ${k.actifsEcheance90j.valeur}, non alertés : ${k.actifsEcheance90j.nonAlertes}`);
    doc.text(`Satisfaction : ${k.satisfaction.valeur ?? '—'} / 5`);
    doc.end();
  });
}

module.exports = { dossierPdf, rapportPdf };
