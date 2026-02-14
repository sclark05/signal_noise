export default class ParticleEngine {
  constructor(canvas, opts = {}){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mode = null;
    this.running = false;
    this.particleCount = opts.particleCount || 800;
    this.last = performance.now();
    this.resize();
  }

  resize(){
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(this.canvas.clientWidth * dpr);
    this.canvas.height = Math.floor(this.canvas.clientHeight * dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);
    if(this.mode && this.mode.resize) this.mode.resize(this);
  }

  setParticleCount(n){
    this.particleCount = n;
    if(this.mode && this.mode.setParticleCount) this.mode.setParticleCount(this, n);
  }

  setMode(modeModule){
    if(this.mode && this.mode.destroy) this.mode.destroy(this);
    this.mode = modeModule;
    if(this.mode.init) this.mode.init(this);
  }

  start(){
    if(this.running) return;
    this.running = true;
    this.last = performance.now();
    this._frame();
  }

  stop(){ this.running = false; }

  _frame(){
    if(!this.running) return;
    const now = performance.now();
    const dt = (now - this.last) / 1000;
    this.last = now;

    // update + draw
    if(this.mode && this.mode.update) this.mode.update(this, dt);
    this._draw();

    requestAnimationFrame(()=> this._frame());
  }

  _draw(){
    const ctx = this.ctx;
    // simple fade trail
    ctx.fillStyle = 'rgba(10,10,12,0.15)';
    ctx.fillRect(0,0,this.canvas.clientWidth, this.canvas.clientHeight);
    if(this.mode && this.mode.draw) this.mode.draw(this, ctx);
  }
}
