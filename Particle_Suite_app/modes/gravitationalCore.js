// Gravitational Core mode: central attractor with inverse-square force
export default {
  name: 'Gravitational Core',
  // allow engine to use a slightly stronger trail
  trailAlpha: 0.08,
  init(engine){
    const w = engine.canvas.clientWidth, h = engine.canvas.clientHeight;
    this.particles = new Array(engine.particleCount).fill().map(()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-0.5)*40,
      vy: (Math.random()-0.5)*40
    }));
    this.attractor = {x: w/2, y: h/2};
    this.gravity = 8000; // strength scalar
    this.damping = 0.995; // friction per frame
    this._listeners = [];
  },
  setParticleCount(engine,n){ this.init(engine); },
  attachPointer(canvas){
    const move = e=>{
      const r = canvas.getBoundingClientRect();
      this.attractor.x = e.clientX - r.left;
      this.attractor.y = e.clientY - r.top;
    };
    canvas.addEventListener('pointermove', move);
    this._listeners.push(()=> canvas.removeEventListener('pointermove', move));
  },
  attachUI(engine, container){
    // create controls: gravity strength & damping
    this._ui = document.createElement('div');
    this._ui.style.display = 'flex';
    this._ui.style.gap = '8px';
    this._ui.style.alignItems = 'center';

    const gLabel = document.createElement('label');
    gLabel.textContent = 'Gravity:';
    const gSlider = document.createElement('input');
    gSlider.type='range'; gSlider.min='100'; gSlider.max='20000'; gSlider.value = String(this.gravity);
    gSlider.style.width='140px';
    gSlider.addEventListener('input', ()=>{ this.gravity = +gSlider.value; });
    gLabel.appendChild(gSlider);

    const dLabel = document.createElement('label');
    dLabel.textContent = 'Damping:';
    const dSlider = document.createElement('input');
    dSlider.type='range'; dSlider.min='0.90'; dSlider.max='0.999'; dSlider.step='0.001'; dSlider.value = String(this.damping);
    dSlider.style.width='120px';
    dSlider.addEventListener('input', ()=>{ this.damping = +dSlider.value; });
    dLabel.appendChild(dSlider);

    this._ui.appendChild(gLabel);
    this._ui.appendChild(dLabel);
    container.appendChild(this._ui);
  },
  detachUI(engine, container){
    if(this._ui && container.contains(this._ui)) container.removeChild(this._ui);
    this._ui = null;
  },
  update(engine, dt){
    const ax = this.attractor.x, ay = this.attractor.y;
    for(const p of this.particles){
      const dx = ax - p.x, dy = ay - p.y;
      const r2 = dx*dx + dy*dy + 25; // avoid singularity
      const inv = 1 / Math.sqrt(r2);
      // inverse-square scaled acceleration
      const accel = this.gravity / r2;
      p.vx += dx * inv * accel * dt;
      p.vy += dy * inv * accel * dt;

      // integrate
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // damping
      p.vx *= this.damping;
      p.vy *= this.damping;

      // wrap edges
      const w = engine.canvas.clientWidth, h = engine.canvas.clientHeight;
      if(p.x < 0) p.x += w; else if(p.x > w) p.x -= w;
      if(p.y < 0) p.y += h; else if(p.y > h) p.y -= h;
    }
  },
  draw(engine, ctx){
    ctx.save();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(240,240,255,0.9)';
    ctx.fillStyle = 'rgba(200,220,255,0.9)';
    for(const p of this.particles){
      const speed = Math.hypot(p.vx, p.vy);
      // length based on speed
      const len = Math.min(24, speed * 0.6);
      if(len > 1){
        const ang = Math.atan2(p.vy, p.vx);
        const x2 = p.x - Math.cos(ang) * len;
        const y2 = p.y - Math.sin(ang) * len;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.1, 0, Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
  },
  destroy(){
    // remove any pointer listeners
    for(const fn of this._listeners || []) fn();
    this._listeners = [];
    // remove UI if left behind
    if(this._ui && this._ui.parentNode) this._ui.parentNode.removeChild(this._ui);
    this._ui = null;
  }
};
