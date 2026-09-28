const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(__dirname+'/../book-spin.js','utf8').replace(/^import .*;\n/,'').replaceAll('import.meta.url',JSON.stringify('https://sholy-klimb.github.io/ebook-3D-test/book-spin.js'));
const pause=()=>new Promise(r=>setImmediate(r));
async function setup(reduced=false){
 const events={},notifications=[],applied=[],pending={};let clock=0,frames=0,failNext=false;
 const material={name:'Double page',pbrMetallicRoughness:{setBaseColorFactor(){},setMetallicFactor(){},baseColorTexture:{setTexture(t){applied.push(t.url);}}}};
 function viewer(theta){return {loaded:true,style:{},dataset:{},attrs:{},orbit:{theta,phi:1.13,radius:.8},model:{materials:[material]},addEventListener(){},removeEventListener(){},setAttribute(k,v){this.attrs[k]=v;if(k==='camera-orbit'&&v.includes('rad')){const a=v.split(' ').map(parseFloat);this.orbit={theta:a[0],phi:a[1],radius:a[2]};}},getCameraOrbit(){return {...this.orbit};},jumpCameraToGoal(){},createTexture(url){if(failNext){failNext=false;return Promise.reject(Error('PNG failed'));}return Promise.resolve({url});}};}
 const closed=viewer(1.1),opened=viewer(-.14),status={textContent:''},parent={postMessage:(m)=>notifications.push(m)};
 const context={URL,URLSearchParams,console:{error(){}},setTimeout,clearTimeout,requestAnimationFrame:cb=>setImmediate(()=>{frames++;clock+=30;cb(clock);}),matchMedia:q=>({matches:q.includes('reduced')?reduced:false,addEventListener(){}}),customElements:{whenDefined:()=>Promise.resolve()},document:{querySelector:q=>({'#livre-ferme':closed,'#livre':opened,'#etat':status}[q]),referrer:'',body:{dataset:{}}},parent,window:{addEventListener:(k,v)=>events[k]=v},location:{search:'?parentOrigin=https%3A%2F%2Fexample.webflow.io',hash:''},history:{replaceState(){}},resolveSpread:id=>/^#?chapitre-[1-9]$/.test(id)?{id:id.replace('#',''),alias:id.replace('#',''),title:id,image:id.replace('#','')+'.png'}:null};
 vm.runInNewContext(source,context);
 const select=(id,origin='https://example.webflow.io')=>events.message({source:parent,origin,data:{type:'phacet:show-spread',id}});
 async function idle(){for(let i=0;i<250;i++)await pause();}
 await idle();return {select,idle,closed,opened,applied,notifications,status,frames:()=>frames,fail:()=>failNext=true};
}
(async()=>{
 const s=await setup();assert.equal(s.closed.style.opacity,'1');assert.equal(s.opened.style.opacity,'0');
 s.select('chapitre-1','https://wrong.example');await s.idle();assert.equal(s.applied.length,0);
 s.select('chapitre-1');await s.idle();assert.equal(s.opened.dataset.spreadId,'chapitre-1');assert.equal(s.closed.style.opacity,'0');assert.equal(s.opened.style.opacity,'1');assert(s.frames()>20);
 const n=s.applied.length;s.select('chapitre-1');await s.idle();assert.equal(s.applied.length,n,'same chapter must not spin again');
 const theta=s.opened.orbit.theta;s.select('chapitre-2');await s.idle();assert.equal(s.opened.dataset.spreadId,'chapitre-2');assert.equal(s.opened.orbit.theta,theta);
 s.select('chapitre-3');s.select('chapitre-4');s.select('chapitre-8');await s.idle();assert.equal(s.opened.dataset.spreadId,'chapitre-8');assert(!s.applied.some(x=>x.endsWith('chapitre-4.png')));
 s.fail();s.select('chapitre-9');await s.idle();assert.equal(s.opened.dataset.spreadId,'chapitre-8');assert.equal(s.opened.style.opacity,'1');assert(s.status.textContent.includes('réessayer'));
 s.select('chapitre-9');await s.idle();assert.equal(s.opened.dataset.spreadId,'chapitre-9');
 const r=await setup(true);r.select('chapitre-3');await r.idle();assert.equal(r.frames(),0);assert.equal(r.opened.dataset.spreadId,'chapitre-3');
 console.log('PASS: closed/open transition, chapter spin, camera restored, duplicate ignored, latest click wins, origin rejection, load failure/retry, reduced motion.');
})().catch(e=>{console.error(e);process.exitCode=1;});
