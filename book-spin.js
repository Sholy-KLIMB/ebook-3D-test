import {resolveSpread} from './chapitres.js?v=flat-1';

const closed=document.querySelector('#livre-ferme');
const opened=document.querySelector('#livre');
const status=document.querySelector('#etat');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const narrow=matchMedia('(max-aspect-ratio:6/5)');
const params=new URLSearchParams(location.search);
const parentOrigin=(()=>{try{
  const raw=params.get('parentOrigin')||document.referrer;
  if(!raw)return null;
  const u=new URL(raw);return /^https?:$/.test(u.protocol)?u.origin:null;
}catch{return null;}})();
let active=closed,current=null,desired=null,running=false,material;
const textures=new Map();
const notify=(type,extra={})=>{
  if(parent!==window&&parentOrigin)parent.postMessage({type,...extra},parentOrigin);
};
function ready(viewer){
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>finish(new Error('Chargement du modèle trop long')),30000);
    const done=()=>finish(),fail=()=>finish(new Error('Modèle 3D indisponible'));
    function finish(error){clearTimeout(timer);viewer.removeEventListener('load',done);viewer.removeEventListener('error',fail);error?reject(error):resolve();}
    viewer.addEventListener('load',done);viewer.addEventListener('error',fail);
    customElements.whenDefined('model-viewer').then(()=>{if(viewer.loaded)finish();});
  });
}
// Both models share one document: no iframe navigation during transitions.
const closedReady=ready(closed),openReady=ready(opened);
closedReady.catch(()=>{status.textContent='Le livre fermé ne peut pas être chargé.';});
openReady.catch(()=>{});
function fit(){
  if(running)return;
  const orbit=opened.loaded?opened.getCameraOrbit():null;
  opened.setAttribute('camera-orbit',`${orbit?orbit.theta*180/Math.PI:-8}deg ${orbit?orbit.phi*180/Math.PI:65}deg ${narrow.matches?'100%':'80%'}`);
}
fit();narrow.addEventListener('change',fit);
function visibility(viewer,shown){
  viewer.style.opacity=shown?'1':'0';
  viewer.style.pointerEvents=shown?'auto':'none';
  viewer.inert=!shown;viewer.setAttribute('aria-hidden',String(!shown));
}
visibility(closed,true);visibility(opened,false);
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
function orbitAt(viewer,orbit,angle){
  // Azimuth rotates the view around the model's vertical Y axis.
  viewer.setAttribute('camera-orbit',`${angle}rad ${orbit.phi}rad ${orbit.radius}m`);
  viewer.jumpCameraToGoal();
}
async function spin(from,to,swap){
  if(reduceMotion.matches){swap();visibility(from,false);visibility(to,true);return;}
  const outOrbit=from.getCameraOrbit();
  const inOrbit=to===from?outOrbit:to.getCameraOrbit();
  from.style.pointerEvents='none';to.style.pointerEvents='none';
  from.inert=true;to.inert=true;
  let swapped=false;
  const duration=900;
  await new Promise(resolve=>{
    let start;
    function tick(now){
      start??=now;
      const p=clamp((now-start)/duration),turn=smooth(p)*Math.PI*2;
      if(p>=0.5&&!swapped){swap();swapped=true;}
      if(p<0.5){
        orbitAt(from,outOrbit,outOrbit.theta+turn);
        from.style.opacity=String(1-smooth((p-0.36)/0.14));
      }else{
        if(from!==to)from.style.opacity='0';
        orbitAt(to,inOrbit,inOrbit.theta+turn-Math.PI*2);
        to.style.opacity=String(smooth((p-0.5)/0.14));
      }
      if(p<1)requestAnimationFrame(tick);else resolve();
    }
    requestAnimationFrame(tick);
  });
  orbitAt(from,outOrbit,outOrbit.theta);
  orbitAt(to,inOrbit,inOrbit.theta);
  visibility(from,false);visibility(to,true);
}
async function prepare(spread){
  await openReady;
  material??=opened.model?.materials.find(m=>m.name==='Double page');
  if(!material)throw new Error('Matériau Double page introuvable');
  const url=new URL(spread.image,import.meta.url).href;
  if(!textures.has(url))textures.set(url,opened.createTexture(url).catch(e=>{textures.delete(url);throw e;}));
  const texture=await textures.get(url);
  if(!texture)throw new Error('Texture indisponible');
  return texture;
}
async function drain(){
  if(running)return;
  running=true;
  try{
    while(desired&&desired.id!==current?.id){
      const target=desired;
      status.textContent='Chargement du chapitre…';
      opened.setAttribute('aria-busy','true');
      const texture=await prepare(target);
      if(desired.id!==target.id)continue;
      if(active===closed)await closedReady;
      status.textContent='';
      await spin(active,opened,()=>{
        material.pbrMetallicRoughness.setBaseColorFactor([1,1,1,1]);
        material.pbrMetallicRoughness.setMetallicFactor(0);
        material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
      });
      active=opened;current=target;
      opened.dataset.spreadId=target.id;
      opened.alt=`Livre ouvert : ${target.title}. Faites glisser pour le tourner.`;
      document.title=`${target.title} · Le guide du CFO`;
      history.replaceState(null,'',`#${target.alias}`);
      notify('phacet:spread-changed',{id:target.id,alias:target.alias,title:target.title});
    }
  }catch(error){
    status.textContent='Ce chapitre n’a pas pu être chargé. Cliquez pour réessayer.';
    notify('phacet:error',{id:desired?.id});console.error('Livre 3D',error);
    visibility(closed,active===closed);visibility(opened,active===opened);
  }finally{running=false;opened.setAttribute('aria-busy','false');fit();}
}
function select(id){
  const spread=resolveSpread(id);if(!spread)return;
  desired=spread;void drain();
}
window.addEventListener('message',event=>{
  if(event.source!==parent||!parentOrigin||event.origin!==parentOrigin)return;
  if(event.data?.type==='phacet:show-spread')select(event.data.id);
});
window.addEventListener('hashchange',()=>select(location.hash));
notify('phacet:ready',{state:'closed'});
if(location.hash)select(location.hash);
else if(document.body.dataset.initial==='open')select('chapitre-1');
