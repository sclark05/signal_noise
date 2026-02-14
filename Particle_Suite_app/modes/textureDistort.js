export default {
  name:'Texture Distorter',
  init(engine){
    this.particles = new Array(engine.particleCount).fill().map(()=>({x:Math.random()*engine.canvas.clientWidth,y:Math.random()*engine.canvas.clientHeight,vx:0,vy:0}));
  },
  setParticleCount(engine,n){ this.init(engine); },
  update(engine,dt){
    // simple random jitter
    for(const p of this.particles){ p.x += (Math.random()-0.5)*30*dt; p.y += (Math.random()-0.5)*30*dt; }
  },
  draw(engine,ctx){
    ctx.globalCompositeOperation = 'lighter';
    for(const p of this.particles){ ctx.fillStyle = 'rgba(180,220,200,0.08)'; ctx.fillRect(p.x,p.y,2,2); }
    ctx.globalCompositeOperation = 'source-over';
  },
  resize(engine){ this.init(engine); }
};
