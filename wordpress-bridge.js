/* Load once on the WordPress page, after the iframe. No interface is created. */
(() => {
  const frame=document.getElementById('phacet-livre-ouvert');
  if(!frame || frame.dataset.phacetBridge)return;
  frame.dataset.phacetBridge='true';
  const base=new URL(frame.getAttribute('src'),location.href);
  const targetOrigin=base.origin;
  const valid=/^(double-page-(0[1-9]|1[0-4])|chapitre-[1-9]|avant-propos|sommaire|introduction|paroles-experts|bonus)$/;
  const clean=value=>String(value||'').replace(/^#/,'');
  const selectors='[id^="cta-"], [data-phacet-page], a[href^="#"]';
  function controlId(el){
    const options=[el.id?.startsWith('cta-')?el.id.slice(4):'',el.dataset.phacetPage,el.getAttribute('href')];
    return options.map(clean).find(id=>valid.test(id))||null;
  }
  let pending=valid.test(clean(location.hash))?clean(location.hash):clean(base.hash)||'chapitre-1';
  function send(){frame.contentWindow?.postMessage({type:'phacet:show-spread',id:pending},targetOrigin);}
  function choose(id){
    id=clean(id);if(!valid.test(id))return false;
    pending=id;send();return true;
  }
  window.addEventListener('message',event=>{
    if(event.source!==frame.contentWindow || event.origin!==targetOrigin)return;
    if(event.data?.type==='phacet:ready')send();
    if(event.data?.type==='phacet:spread-changed'){
      const {id,alias}=event.data;
      document.querySelectorAll(selectors).forEach(button=>{
        const value=controlId(button);if(!value)return;
        if(value===id || value===alias)button.setAttribute('aria-current','page');
        else button.removeAttribute('aria-current');
      });
    }
  });
  document.addEventListener('click',event=>{
    if(!(event.target instanceof Element))return;
    // Walk ancestors so IDs on WordPress/Elementor button wrappers also work.
    let button=event.target.closest(selectors),id;
    while(button && !(id=controlId(button)))button=button.parentElement?.closest(selectors);
    if(!id || !choose(id))return;
    event.preventDefault();history.pushState(null,'',`#${id}`);
  });
  window.addEventListener('hashchange',()=>choose(location.hash));
  window.addEventListener('popstate',()=>choose(location.hash||base.hash||'chapitre-1'));
  frame.addEventListener('load',send);
  base.searchParams.set('parentOrigin',location.origin);base.hash=pending;
  frame.src=base.href;
})();
