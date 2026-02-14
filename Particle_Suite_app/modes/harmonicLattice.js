export default {
  name:'Harmonic Lattice',
  init(engine){
    this.particles = [];
    const cols = 40, rows = 30;
    for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){
      this.particles.push({x:i/cols*engine.canvas.clientWidth,y:j/rows*engine.canvas.clientHeight,phase:Math.random()*Math.PI*2});
    }
  },
  setParticleCount(engine,n){ this.init(engine); },
  update(engine,dt){
    const t = performance.now()*0.001;
    for(const p of this.particles){ p.y += Math.sin(t + p.phase)*0.3; }
  },
  draw(engine,ctx){
    ctx.fillStyle='rgba(255,180,120,0.9)';
    for(const p of this.particles){ ctx.beginPath(); ctx.arc(p.x,p.y,1.6,0,Math.PI*2); ctx.fill(); }
  },
  resize(engine){ this.init(engine); }
};
