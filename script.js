const slides = [...document.querySelectorAll('.slide')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let current = Math.max(0, slides.findIndex(s => '#' + s.id === location.hash));
let touchStart = null, wheelAt = 0;

function show(index, hash = true) {
  if (index < 0 || index >= slides.length) return;
  const moveFocus = slides.some(s => s.contains(document.activeElement));
  current = index;
  slides.forEach((s, i) => {
    const active = i === current;
    s.classList.toggle('past', i < current);
    s.classList.toggle('active', active); s.setAttribute('aria-hidden', String(!active)); s.inert = !active;
  });
  window.storyBackground?.setScene(current);
  document.querySelector('#announcement').textContent = 'Chapter ' + (current + 1) + ' of ' + slides.length + ': ' + slides[current].dataset.label;
  if (hash) history.replaceState(null, '', '#' + slides[current].id);
  if (moveFocus) { slides[current].tabIndex = -1; slides[current].focus({ preventScroll: true }); }
  slides[current].scrollTop = 0;

}

function move(delta) { show(current + delta); }
document.querySelector('[data-next]').addEventListener('click', () => move(1));
document.querySelector('[data-restart]').addEventListener('click', () => { show(0); });

document.addEventListener('keydown', e => {
  if (document.querySelector('#cv-dialog')?.open) return;
  if (e.target.closest('button, a, input, textarea, select, [role="tablist"]')) return;
  if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault(); 
  show(e.key === 'Home' ? 0 : e.key === 'End' ? slides.length - 1 : current + (['ArrowRight', 'ArrowDown', 'PageDown'].includes(e.key) ? 1 : -1));
});
window.addEventListener('hashchange', () => {
  const i = slides.findIndex(s => '#' + s.id === location.hash);
  if (i >= 0) { show(i, false); }
});
const story = document.querySelector('.story');
story.addEventListener('touchstart', e => { touchStart = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; }, { passive: true });
story.addEventListener('touchend', e => {
  if (!touchStart) return;
  const origin = touchStart; touchStart = null;
  if (e.target.closest('a, button')) return;
  const dx = e.changedTouches[0].clientX - origin.x, dy = e.changedTouches[0].clientY - origin.y;
  const s = slides[current];
  const canScroll = (dy < 0 && s.scrollTop + s.clientHeight < s.scrollHeight - 2) || (dy > 0 && s.scrollTop > 2);
  if (Math.abs(dy) > 65 && Math.abs(dy) > Math.abs(dx) * 1.5 && !canScroll) move(dy < 0 ? 1 : -1);
  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
}, { passive: true });
story.addEventListener('wheel', e => {
  const s = slides[current], vertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX), d = vertical ? e.deltaY : e.deltaX;
  if (Math.abs(d) < 30 || Date.now() - wheelAt < 1100) return;
  if (vertical && ((d > 0 && s.scrollTop + s.clientHeight < s.scrollHeight - 2) || (d < 0 && s.scrollTop > 2))) return;
  wheelAt = Date.now(); move(d > 0 ? 1 : -1);
}, { passive: true });
const skillData = {
  security: ['Security throughout the build.', 'Cybersecurity fundamentals with a focus on secure authentication, data protection and security-aware web development.', ['Cybersecurity fundamentals', 'Secure authentication', 'Data protection', 'Security-aware development']],
  frontend: ['Interfaces that make sense.', 'Responsive layouts and interactive experiences, built with modern web technologies.', ['HTML5', 'CSS / SCSS', 'JavaScript', 'React', 'TypeScript']],
  backend: ['The logic behind the interface.', 'Node.js and database fundamentals support my work across the web development lifecycle.', ['Node.js', 'Database fundamentals']],
  tools: ['From local idea to shared project.', 'Tools I use for version control, development and web delivery.', ['Git', 'GitHub', 'Vite', 'Netlify']]
};
const tabs = [...document.querySelectorAll('[data-skill]')];
function selectSkill(button) {
  
  tabs.forEach(t => { t.setAttribute('aria-selected', String(t === button)); t.tabIndex = t === button ? 0 : -1; });
  const [title, description, tags] = skillData[button.dataset.skill];
  document.querySelector('#skill-title').textContent = title;
  document.querySelector('#skill-description').textContent = description;
  document.querySelector('#skill-tags').replaceChildren(...tags.map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
  const panel = document.querySelector('#skills-panel'); panel.setAttribute('aria-labelledby', button.id);
  if (!reducedMotion.matches && panel.animate) panel.animate([{ opacity: .2, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350 });
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => selectSkill(t));
  t.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectSkill(tabs[n]); tabs[n].focus();
  });
});
const theme = document.querySelector('#theme');
function setTheme(light) {
  document.body.classList.toggle('light', light); theme.textContent = light ? 'Dark mode' : 'Light mode';
  theme.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
}
try { setTheme(localStorage.getItem('rc-theme') === 'light'); } catch { setTheme(false); }
theme.addEventListener('click', () => {
  const light = !document.body.classList.contains('light'); setTheme(light);
  try { localStorage.setItem('rc-theme', light ? 'light' : 'dark'); } catch {}
});
window.addEventListener('beforeprint', () => { slides.forEach(s => { s.inert = false; s.setAttribute('aria-hidden', 'false'); }); });
window.addEventListener('afterprint', () => show(current, false));
show(current, false);

const cvDialog = document.querySelector('#cv-dialog');
const cvFrame = document.querySelector('#cv-frame');
document.querySelector('#view-cv').addEventListener('click', () => {
  if (!cvFrame.getAttribute('src')) cvFrame.setAttribute('src', cvFrame.dataset.src);
  cvDialog.showModal();
});
document.querySelector('#close-cv').addEventListener('click', () => cvDialog.close());






