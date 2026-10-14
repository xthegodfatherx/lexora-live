// Ouvre l'assistant depuis n'importe quel écran, avec le contexte de cet écran :
//   openAssistant({ context: { ecran: 'Détail du contrat', contrat_id: 12, contrat_numero: 'CTR-…' },
//                   question: 'Quels textes de la bibliothèque concernent ce risque ?' })
// TopBar (présent dans tous les layouts) écoute l'évènement et ouvre le chat sur l'assistant.
export const ASSISTANT_EVENT = 'lexora:open-assistant';

export function openAssistant({ context, question } = {}) {
    window.dispatchEvent(new CustomEvent(ASSISTANT_EVENT, { detail: { context: context || null, question: question || '' } }));
}
