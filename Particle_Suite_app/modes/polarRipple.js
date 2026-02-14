export default {
  name: 'Polar Ripple',
  init(engine){
    this.particles = new Array(engine.particleCount).fill().map(()=>({
      r: Math.random()*engine.canvas.clientWidth/2,
      a: Math.random()*Math.PI*2,
      speed: 30+Math.random()*120,
      life: Math.random()*4
    }));
  },
  setParticleCount(engine, n){
    this.init(engine);
  },
  update(engine, dt){
    const w = engine.canvas.clientWidth, h = engine.canvas.clientHeight;
    for(const p of this.particles){
      p.r += p.speed * dt;
      p.life += dt;
      if(p.r > Math.max(w,h)){
        p.r = 0; p.a = Math.random()*Math.PI*2; p.speed = 30+Math.random()*120; p.life = 0;
      }
    }
  },
  draw(engine, ctx){
    const cx = engine.canvas.clientWidth/2, cy = engine.canvas.clientHeight/2;
    for(const p of this.particles){
      const x = cx + Math.cos(p.a)*p.r;
      const y = cy + Math.sin(p.a)*p.r;
      const s = Math.max(0.5, 2 - p.life*0.4);
      ctx.fillStyle = `hsl(${(p.r/5)%360} 80% 60%)`;
      ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill();
    }
  }
};
