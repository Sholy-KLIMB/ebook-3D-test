export const spreads = [
  ['Avant de commencer', 'avant-propos'],
  ['Comment lire ce guide ? · Sommaire', 'sommaire'],
  ['Introduction', 'introduction'],
  ["Dissiper les doutes de votre équipe face à l’IA", 'chapitre-1'],
  ['Le Finance Engineer', 'chapitre-2'],
  ['La gouvernance', 'chapitre-3'],
  ['La carte des gains : où injecter l’IA', 'chapitre-4'],
  ['Identifier & prioriser vos opportunités', 'chapitre-5'],
  ['Paroles d’experts', 'paroles-experts'],
  ["Choisir l’agent adapté à votre besoin", 'chapitre-6'],
  ["2 packs d’agents en production", 'chapitre-7'],
  ['La facturation électronique', 'bonus'],
  ['Mesurer l’impact', 'chapitre-9'],
  ['Le cadrage', 'chapitre-8'],
].map(([title, alias], index) => ({id:`double-page-${String(index+1).padStart(2,'0')}`, title, alias, image:`./chapitre-${String(index+1).padStart(2,'0')}.png`}));
export function resolveSpread(value) {
  if (typeof value !== 'string') return null;
  const id=value.replace(/^#/, '');
  return spreads.find(s=>s.id===id || s.alias===id) || null;
}
