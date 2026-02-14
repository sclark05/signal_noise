export function init(container, opts = {}){
  const wrapper = document.createElement('div');
  wrapper.style.width = opts.width || '600px';
  wrapper.style.height = opts.height || '400px';
  container.appendChild(wrapper);
  const iframe = document.createElement('iframe');
  iframe.src = opts.src || './Particle_Suite_app/index.html';
  iframe.style.width = '100%'; iframe.style.height = '100%'; iframe.style.border = '0';
  wrapper.appendChild(iframe);
  return { iframe, wrapper };
}
