export default class ParticleEngine {
  constructor(canvas, opts = {}){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.mode = null;
    this.running = false;
    this.particleCount = opts.particleCount || 800;
    this.last = performance.now();
    this.modeControls = null;
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
    // cleanup previous
    if(this.mode){
      if(this.mode.destroy) this.mode.destroy(this);
      // ensure UI detach if provided
      if(this.mode.detachUI && this.modeControls) this.mode.detachUI(this, this.modeControls);
    }

    this.mode = modeModule;

    // let the mode initialize with engine reference
    if(this.mode.init) this.mode.init(this);

    // attach pointer hooks if the mode wants them
    if(this.mode.attachPointer && this.canvas) this.mode.attachPointer(this.canvas);

    // attach UI controls area if provided
    if(this.mode.attachUI && this.modeControls) this.mode.attachUI(this, this.modeControls);
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
    // simple fade trail; allow modes to override trailAlpha
    const alpha = (this.mode && this.mode.trailAlpha !== undefined) ? this.mode.trailAlpha : 0.15;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0,0,this.canvas.clientWidth, this.canvas.clientHeight);
    if(this.mode && this.mode.draw) this.mode.draw(this, ctx);
  }
}
