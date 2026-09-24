import {resolveSpread} from './chapitres.js?v=flat-1';
const viewer=document.querySelector('#livre');
const status=document.querySelector('#etat');
const params=new URLSearchParams(location.search);
const defaultSpread=resolveSpread('chapitre-1');
let requested=resolveSpread(location.hash)||defaultSpread;
let loaded=false, texture, canvas, ctx, generation=0;
const smallViewport=matchMedia('(max-width:480px)');
const tallViewport=matchMedia('(max-aspect-ratio:6/5)');
function fitBook(){
  const orbit=loaded?viewer.getCameraOrbit():null;
  const theta=orbit?orbit.theta*180/Math.PI:-8;
  const phi=orbit?orbit.phi*180/Math.PI:65;
  viewer.setAttribute('camera-orbit',`${theta}deg ${phi}deg ${smallViewport.matches||tallViewport.matches?'100%':'80%'}`);
}
fitBook();smallViewport.addEventListener('change',fitBook);tallViewport.addEventListener('change',fitBook);

// A single reusable GPU texture bounds memory even after visiting all 14 spreads.
// Canvas performs only proportional fitting; the source PNGs remain untouched.
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
    const image=new Image();image.src=new URL(spread.image,import.meta.url).href;
    await image.decode();
    if(token!==generation)return;
    // 10.png is four pixels wider: proportional fitting adds a tiny margin,
    // avoiding horizontal compression or cropping of its original artwork.
    const ratio=Math.min(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight);
    const w=image.naturalWidth*ratio,h=image.naturalHeight*ratio;
    ctx.setTransform(1,0,0,-1,0,canvas.height);
    ctx.fillStyle='#f5f3ef';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,(canvas.width-w)/2,(canvas.height-h)/2,w,h);
    texture.source.update();
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
viewer.addEventListener('load',()=>{
  texture=viewer.createCanvasTexture();canvas=texture.source.element;
  canvas.width=3368;canvas.height=2384;ctx=canvas.getContext('2d');
  const material=viewer.model.materials.find(m=>m.name==='Double page');
  if(!material || !ctx){fail('Le livre ne peut pas être affiché.');return;}
  material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
  loaded=true;void showSpread(requested);notify('phacet:ready');
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
