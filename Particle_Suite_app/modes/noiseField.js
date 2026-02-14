// Simple pointer-driven noise-like field (no external lib)
function pseudoNoise(x,y){
  return (Math.sin(x*0.01)+Math.cos(y*0.013))*0.5;
}
export default {
  name:'Noise Field Explorer',
  init(engine){
    this.particles = new Array(engine.particleCount).fill().map(()=>({x:Math.random()*engine.canvas.clientWidth,y:Math.random()*engine.canvas.clientHeight,vx:0,vy:0}));
  },
  setParticleCount(engine,n){ this.init(engine); },
  update(engine,dt){
    const mx = this.mx || engine.canvas.clientWidth/2, my = this.my || engine.canvas.clientHeight/2;
    for(const p of this.particles){
      const n = pseudoNoise(p.x - mx, p.y - my);
      p.vx += (n-0.5) * 60 * dt;
      p.vy += (n-0.5) * 40 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      if(p.x<0) p.x += engine.canvas.clientWidth; if(p.x>engine.canvas.clientWidth) p.x-=engine.canvas.clientWidth;
      if(p.y<0) p.y += engine.canvas.clientHeight; if(p.y>engine.canvas.clientHeight) p.y-=engine.canvas.clientHeight;
    }
  },
  draw(engine,ctx){
    ctx.fillStyle = 'rgba(200,200,255,0.9)';
    for(const p of this.particles){ ctx.fillRect(p.x-0.5,p.y-0.5,2,2); }
  },
  resize(engine){ this.init(engine); },
  // simple pointer hook
  attachPointer(canvas){
    const move = e=>{ const r = canvas.getBoundingClientRect(); this.mx = e.clientX - r.left; this.my = e.clientY - r.top; };
    canvas.addEventListener('pointermove', move);
    this._remove = ()=> canvas.removeEventListener('pointermove', move);
  },
  destroy(){ if(this._remove) this._remove(); }
};
