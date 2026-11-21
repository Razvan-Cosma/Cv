(() => {
  const canvas = document.querySelector('#living-background');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: -9999, y: -9999 };
  const positions = [[.5,.48,.38],[.13,.48,.32],[.86,.42,.31],[.55,.91,.4],[.15,.62,.33],[.86,.7,.35],[.2,.72,.36],[.5,.63,.39]];
  const count = 76;
  let palette;
  function refreshPalette() {
    const style = getComputedStyle(document.body);
    palette = {
      color: style.getPropertyValue('--particle-rgb').trim() || '192,232,146',
      glow: Number(style.getPropertyValue('--glow-alpha')) || .1,
      dot: Number(style.getPropertyValue('--particle-alpha')) || .6,
      line: Number(style.getPropertyValue('--thread-alpha')) || .15
    };
  }
  let width = 1, height = 1, scene = 0, frame = 0, last = 0, burst = 0, settled = false;
  const particles = Array.from({ length: count }, (_, i) => ({ x: 0, y: 0, vx: 0, vy: 0, seed: i * 2.39996, size: i % 5 === 0 ? 2 : 1 }));
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = width * ratio; canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!settled) { particles.forEach(p => { p.x = width / 2; p.y = height / 2; }); settled = true; }
    if (motion.matches) draw(performance.now(), true);
  }
  function target(i, time) {
    const [cx,cy,scale] = positions[scene];
    const radius = Math.min(width, height) * scale;
    const angle = i / count * Math.PI * 2;
    if (scene === positions.length - 1) return {
      x: cx * width + radius * 1.15 * Math.cos(angle) / (1 + Math.sin(angle) ** 2),
      y: cy * height + radius * .78 * Math.sin(angle) * Math.cos(angle) / (1 + Math.sin(angle) ** 2)
    };
    const drift = motion.matches ? 0 : time * .00007;
    const a = angle + drift;
    const spiral = .3 + Math.sqrt(i / count) * .7;
    return { x: width * cx + Math.cos(a * (scene === 2 ? 2 : 1) + particles[i].seed * .08) * radius * spiral * 1.25,
      y: height * cy + Math.sin(a + particles[i].seed * .09) * radius * spiral * .8 };
  }
  function draw(time, immediate = false) {
    ctx.clearRect(0, 0, width, height);
    const color = palette.color;
    const [cx,cy,scale] = positions[scene];
    const glow = ctx.createRadialGradient(cx * width, cy * height, 0, cx * width, cy * height, Math.min(width,height) * scale * 1.5);
    glow.addColorStop(0, 'rgba(' + color + ',' + palette.glow + ')');
    glow.addColorStop(1, 'rgba(' + color + ',0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    particles.forEach((p,i) => {
      const dest = target(i,time);
      if (immediate) { p.x = dest.x; p.y = dest.y; }
      else {
        p.vx += (dest.x - p.x) * .008; p.vy += (dest.y - p.y) * .008;
        const dx = p.x - pointer.x, dy = p.y - pointer.y, distance = Math.hypot(dx,dy);
        if (distance < 135 && distance > 1) { const force = (1 - distance / 135) * (1.7 + burst * 4); p.vx += dx / distance * force; p.vy += dy / distance * force; }
        p.vx *= .87; p.vy *= .87; p.x += p.vx; p.y += p.vy;
      }
      ctx.fillStyle = 'rgba(' + color + ',' + palette.dot + ')';
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
    });
    const maxDistance = Math.min(width,height) * .16;
    for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
      const a = particles[i], b = particles[j], d = Math.hypot(a.x-b.x,a.y-b.y);
      if (d > maxDistance) continue;
      ctx.strokeStyle = 'rgba(' + color + ',' + ((1-d/maxDistance) * palette.line * (scene===positions.length-1 ? 1.5 : 1)) + ')';
      ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }
    if (scene === positions.length - 1) {
      ctx.strokeStyle = 'rgba(' + color + ',' + palette.line * 1.5 + ')'; ctx.lineWidth = 1;
      ctx.beginPath(); particles.forEach((p,i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.stroke();
    }
    burst *= .93;
  }
  function loop(time) {
    frame = 0;
    if (document.hidden || motion.matches) return;
    if (time-last > 30) { draw(time); last = time; }
    frame = requestAnimationFrame(loop);
  }
  function start() { if (!frame && !motion.matches && !document.hidden) frame = requestAnimationFrame(loop); }
  window.storyBackground = { setScene(index) { scene = Math.max(0,Math.min(index,positions.length-1)); document.body.dataset.scene = String(scene); refreshPalette(); if(motion.matches) draw(performance.now(),true); else start(); } };
  window.addEventListener('resize', resize);
  document.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, {passive:true});
  document.addEventListener('pointerleave', () => { pointer.x=-9999; pointer.y=-9999; });
  document.addEventListener('pointerdown', () => { burst=1; }, {passive:true});
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame=0; } else start(); });
  motion.addEventListener('change', () => { cancelAnimationFrame(frame); frame=0; if(motion.matches) draw(performance.now(),true); else start(); });
  new MutationObserver(() => { refreshPalette(); if (motion.matches) draw(performance.now(),true); }).observe(document.body, {attributes:true,attributeFilter:['class']});
  refreshPalette(); resize(); start();
})();


