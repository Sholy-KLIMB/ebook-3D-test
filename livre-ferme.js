import {resolveSpread} from './chapitres.js?v=flat-1';
const params=new URLSearchParams(location.search);
const parentOrigin=(()=>{
  try{
    const value=params.get('parentOrigin')||document.referrer;
    if(!value)return null;
    const url=new URL(value);
    return ['https:','http:'].includes(url.protocol)?url.origin:null;
  }catch{return null;}
})();
function openChapter(id){
  const spread=resolveSpread(id);
  if(!spread)return;
  const url=new URL('./ouvert.html',location.href);
  url.searchParams.set('v','png-2');
  if(parentOrigin)url.searchParams.set('parentOrigin',parentOrigin);
  url.hash=spread.alias;
  location.replace(url.href);
}
window.addEventListener('message',event=>{
  if(event.source!==parent||!parentOrigin||event.origin!==parentOrigin)return;
  if(event.data?.type==='phacet:show-spread')openChapter(event.data.id);
});
window.addEventListener('hashchange',()=>openChapter(location.hash));
if(resolveSpread(location.hash))openChapter(location.hash);
else if(parent!==window&&parentOrigin)parent.postMessage({type:'phacet:ready',state:'closed'},parentOrigin);
