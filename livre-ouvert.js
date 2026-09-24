import {resolveSpread} from './chapitres.js?v=flat-1';
const viewer=document.querySelector('#livre');
const status=document.querySelector('#etat');
const params=new URLSearchParams(location.search);
const defaultSpread=resolveSpread('chapitre-1');
let requested=resolveSpread(location.hash)||defaultSpread;
let loaded=false, material, generation=0;
const textures=new Map();
const smallViewport=matchMedia('(max-width:480px)');
const tallViewport=matchMedia('(max-aspect-ratio:6/5)');
function fitBook(){
  const orbit=loaded?viewer.getCameraOrbit():null;
  const theta=orbit?orbit.theta*180/Math.PI:-8;
  const phi=orbit?orbit.phi*180/Math.PI:65;
  viewer.setAttribute('camera-orbit',`${theta}deg ${phi}deg ${smallViewport.matches||tallViewport.matches?'100%':'80%'}`);
}
fitBook();smallViewport.addEventListener('change',fitBook);tallViewport.addEventListener('change',fitBook);

// Load each original PNG with model-viewer's native glTF texture loader.
// Reuse already visited textures instead of allocating again on every CTA click.
const parentOrigin=(()=>{
  try {
    const value=params.get('parentOrigin') || document.referrer;
    if(!value) return null;
    const url=new URL(value);
    return ['https:','http:'].includes(url.protocol) ? url.origin : null;
  } catch { return null; }
})();
function notify(type,extra={}) {
  if(parent!==window && parentOrigin) parent.postMessage({type,...extra},parentOrigin);
}
function fail(message){status.textContent=message;viewer.setAttribute('aria-busy','false');}
async function showSpread(spread) {
  requested=spread;
  if(!loaded)return;
  const token=++generation;
  status.textContent='Chargement de la double page…';
  viewer.setAttribute('aria-busy','true');
  try {
    const url=new URL(spread.image,import.meta.url).href;
    let pending=textures.get(url);
    if(!pending){
      pending=viewer.createTexture(url).catch(error=>{textures.delete(url);throw error;});
      textures.set(url,pending);
    }
    const texture=await pending;
    if(token!==generation)return;
    if(!texture)throw new Error('Texture PNG indisponible');
    material.pbrMetallicRoughness.setBaseColorFactor([1,1,1,1]);
    material.pbrMetallicRoughness.setMetallicFactor(0);
    material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
    viewer.dataset.spreadId=spread.id;
    viewer.alt=`Livre ouvert : ${spread.title}. Faites glisser pour le tourner.`;
    document.title=`${spread.title} · Le guide du CFO`;
    status.textContent='';viewer.setAttribute('aria-busy','false');
    notify('phacet:spread-changed',{id:spread.id,alias:spread.alias,title:spread.title});
  } catch(error) {
    if(token!==generation)return;
    fail('Cette double page n’a pas pu être chargée.');
    notify('phacet:error',{id:spread.id});
    console.error('Chargement du chapitre impossible',error);
  }
}
function select(id,{writeHash=false}={}) {
  const spread=resolveSpread(id);
  if(!spread)return false;
  if(writeHash)history.replaceState(null,'',`#${spread.id}`);
  void showSpread(spread);return true;
}
function initializeBook(){
  if(loaded)return;
  try{
    material=viewer.model?.materials.find(m=>m.name==='Double page');
    if(!material)throw new Error('Matériau Double page introuvable');
    loaded=true;void showSpread(requested);notify('phacet:ready');
  }catch(error){
    fail('Le livre ne peut pas être affiché.');
    console.error('Initialisation du livre impossible',error);
  }
}
viewer.addEventListener('load',initializeBook);
customElements.whenDefined('model-viewer').then(()=>{
  if(viewer.loaded)initializeBook();
});
viewer.addEventListener('error',()=>fail('Le modèle 3D n’a pas pu être chargé.'));
window.addEventListener('hashchange',()=>{
  if(!location.hash)void showSpread(defaultSpread);
  else if(!select(location.hash))status.textContent='Cette double page n’existe pas.';
});
window.addEventListener('message',event=>{
  if(event.source!==parent || !parentOrigin || event.origin!==parentOrigin)return;
  if(event.data?.type==='phacet:show-spread')select(event.data.id,{writeHash:true});
});
if(location.hash && !resolveSpread(location.hash))history.replaceState(null,'',`#${defaultSpread.id}`);
