(() => {
  'use strict';
  if (!document.body.classList.contains('home-page')) return;
  const desktop = matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

  // Holograafilised projektikaardid: sündmused delegeeritakse hiljem loodud kaartidele.
  if (!desktop.matches) return;
  const grid = document.getElementById('project-grid');
  if (grid) {
    const observe = new MutationObserver(() => { grid.querySelectorAll('.project-card:not(.fx-holo)').forEach(card => card.classList.add('fx-holo')); });
    observe.observe(grid, {childList:true});
    grid.querySelectorAll('.project-card').forEach(card => card.classList.add('fx-holo'));
    grid.addEventListener('pointermove', e => {
      const card = e.target.closest('.project-card'); if (!card || !grid.contains(card)) return;
      const r = card.getBoundingClientRect(), x = (e.clientX-r.left)/r.width, y = (e.clientY-r.top)/r.height;
      card.style.setProperty('--fx-ry', `${((x-.5)*7).toFixed(2)}deg`);
      card.style.setProperty('--fx-rx', `${((.5-y)*7).toFixed(2)}deg`);
      card.style.setProperty('--fx-px', `${(x*100).toFixed(1)}%`);
      card.style.setProperty('--fx-py', `${(y*100).toFixed(1)}%`);
    });
    grid.addEventListener('pointerout', e => {
      const card=e.target.closest('.project-card'); if (card && !card.contains(e.relatedTarget)) {card.style.setProperty('--fx-rx','0deg');card.style.setProperty('--fx-ry','0deg');}
    });
  }

  // Väga hõre võrgustik sulandub olemasolevate joontega. Canvas ei võta klikke ära.
  const canvas = document.createElement('canvas'); canvas.id = 'fx-network-canvas'; canvas.setAttribute('aria-hidden','true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d', {alpha:true}); if (!ctx) {canvas.remove();return;}
  let width=0,height=0,dpr=1,points=[],frame=0,raf=0,active=true;
  const size=() => {
    dpr=Math.min(devicePixelRatio||1,2); width=innerWidth; height=innerHeight;
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    const count=Math.min(55,Math.max(30,Math.round(width*height/32000)));
    points=Array.from({length:count},()=>({x:Math.random()*width,y:Math.random()*height,vx:(Math.random()-.5)*.26,vy:(Math.random()-.5)*.26}));
  };
  const draw=() => {
    if(!active)return;
    frame++;ctx.clearRect(0,0,width,height);
    for(let i=0;i<points.length;i++){
      const p=points[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>width)p.vx*=-1;if(p.y<0||p.y>height)p.vy*=-1;
      ctx.fillStyle='rgba(100,247,219,.94)';ctx.beginPath();ctx.arc(p.x,p.y,1.65,0,Math.PI*2);ctx.fill();
      for(let j=i+1;j<points.length;j++){
        const q=points[j],dx=p.x-q.x,dy=p.y-q.y,dist=dx*dx+dy*dy;
        if(dist<41000){ctx.strokeStyle=`rgba(85,225,205,${(1-dist/41000)*.46})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}
      }
    }
    raf=requestAnimationFrame(draw);
  };
  size();draw();
  window.addEventListener('resize',size,{passive:true});
  document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active){cancelAnimationFrame(raf);draw();}else cancelAnimationFrame(raf);});
  desktop.addEventListener('change',e=>{if(!e.matches){active=false;cancelAnimationFrame(raf);canvas.remove();}});
})();
