/* Krishna Koshti — portfolio interactions. No framework required. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Footer year
$('#year').textContent = new Date().getFullYear();

// Theme toggle (preference is stored locally when available)
const root = document.documentElement;
const themeButton = $('#theme-toggle');
let savedTheme = null;
try { savedTheme = localStorage.getItem('kk-theme'); } catch (_) {}
if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
function updateThemeButton() {
  const light = root.dataset.theme === 'light';
  themeButton.textContent = light ? '☾' : '☼';
  themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
}
updateThemeButton();
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('kk-theme', root.dataset.theme); } catch (_) {}
  updateThemeButton();
});

// Mobile navigation
const menuToggle = $('#menu-toggle');
const navLinks = $('#nav-links');
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});
$$('#nav-links a').forEach(link => link.addEventListener('click', () => {
  navLinks.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
}));

// Typewriter headline
const roleElement = $('#typed-role');
const roles = ['Web developer in progress', 'Python & data enthusiast', 'Curious about AI and IoT', 'Learning by building'];
let roleIndex = 0, letterIndex = 0, deleting = false;
function typeRole() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    roleElement.textContent = roles[0];
    return;
  }
  const current = roles[roleIndex];
  roleElement.textContent = current.slice(0, letterIndex);
  if (!deleting && letterIndex < current.length) letterIndex++;
  else if (deleting && letterIndex > 0) letterIndex--;
  else if (!deleting) { deleting = true; setTimeout(typeRole, 1250); return; }
  else { deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
  setTimeout(typeRole, deleting ? 35 : 75);
}
typeRole();

// Skills: filterable, generated from one data list
const skills = [
  {name:'HTML', category:'web', detail:'Page structure', symbol:'</>'},
  {name:'CSS', category:'web', detail:'Styling & layout', symbol:'#'},
  {name:'JavaScript', category:'web', detail:'Web interactivity', symbol:'JS'},
  {name:'Django', category:'web', detail:'Python web framework', symbol:'DJ'},
  {name:'Python', category:'code', detail:'Programming & scripting', symbol:'Py'},
  {name:'Java', category:'code', detail:'Object-oriented programming', symbol:'J'},
  {name:'SQL', category:'code', detail:'Database queries', symbol:'DB'},
  {name:'Pandas', category:'data', detail:'Data manipulation', symbol:'Pd'},
  {name:'NumPy', category:'data', detail:'Numerical computing', symbol:'Np'},
  {name:'Matplotlib', category:'data', detail:'Data visualisation', symbol:'Mv'},
  {name:'ML fundamentals', category:'data', detail:'Machine learning basics', symbol:'ML'},
  {name:'Git & GitHub', category:'tools', detail:'Version control', symbol:'GH'},
  {name:'Arduino', category:'tools', detail:'Microcontroller basics', symbol:'Ar'},
  {name:'IoT / MQTT', category:'tools', detail:'Connected devices', symbol:'Io'}
];
const skillsGrid = $('#skills-grid');
function renderSkills(filter = 'all') {
  const filtered = skills.filter(skill => filter === 'all' || skill.category === filter);
  skillsGrid.innerHTML = '';
  filtered.forEach((skill, index) => {
    const card = document.createElement('article');
    card.className = 'skill-card';
    card.style.animationDelay = `${index * 35}ms`;
    const symbol = document.createElement('span');
    symbol.className = 'skill-symbol';
    symbol.textContent = skill.symbol;
    const name = document.createElement('strong');
    name.textContent = skill.name;
    const detail = document.createElement('small');
    detail.textContent = skill.detail;
    card.append(symbol, name, detail);
    skillsGrid.append(card);
  });
}
$$('[data-skill-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-skill-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  renderSkills(button.dataset.skillFilter);
}));
renderSkills();

// Scroll progress
function updateProgress() {
  const doc = document.documentElement;
  const maxScroll = doc.scrollHeight - doc.clientHeight;
  $('#progress').style.width = `${maxScroll > 0 ? (doc.scrollTop / maxScroll) * 100 : 0}%`;
}
addEventListener('scroll', updateProgress, {passive:true});
addEventListener('resize', updateProgress);
updateProgress();

// Reveal sections as they enter the viewport
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {threshold:0.12});
$$('.reveal').forEach(section => revealObserver.observe(section));

// Highlight the current navigation section
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    $$('.nav-links a').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, {rootMargin:'-35% 0px -55% 0px'});
$$('main section[id]').forEach(section => sectionObserver.observe(section));

// Contact helper: copy a prepared message instead of pretending to send a form.
const messageBox = $('#visitor-message');
const messageCount = $('#message-count');
const feedback = $('#form-feedback');
messageBox.addEventListener('input', () => { messageCount.textContent = `${messageBox.value.length} / 500`; });
$('#contact-form').addEventListener('submit', async event => {
  event.preventDefault();
  const message = messageBox.value.trim();
  if (message.length < 5) {
    feedback.textContent = 'Write a little more before copying your message.';
    return;
  }
  try {
    await navigator.clipboard.writeText(message);
    feedback.textContent = 'Message copied! Paste it into your preferred chat or email.';
  } catch (_) {
    messageBox.focus();
    messageBox.select();
    feedback.textContent = 'Clipboard access unavailable — your message is selected. Copy it manually.';
  }
});

// Quick navigation palette (Ctrl/Cmd + K, or /)
const overlay = $('#command-overlay');
const commandInput = $('#command-input');
const commandResults = $('#command-results');
const commands = [
  {label:'Go to Home', key:'01', target:'#home'},
  {label:'Go to About', key:'02', target:'#about'},
  {label:'Go to Skills', key:'03', target:'#skills'},
  {label:'Go to Projects', key:'04', target:'#projects'},
  {label:'Go to Experience', key:'05', target:'#experience'},
  {label:'Go to Contact', key:'06', target:'#contact'},
  {label:'Toggle colour theme', key:'T', action:() => themeButton.click()}
];
let visibleCommands = [...commands];
let selectedCommand = 0;
function renderCommands() {
  const query = commandInput.value.trim().toLowerCase();
  visibleCommands = commands.filter(command => command.label.toLowerCase().includes(query));
  selectedCommand = Math.min(selectedCommand, Math.max(visibleCommands.length - 1, 0));
  commandResults.innerHTML = '';
  if (!visibleCommands.length) {
    const empty = document.createElement('p');
    empty.className = 'command-item';
    empty.textContent = 'No matching commands';
    commandResults.append(empty);
    return;
  }
  visibleCommands.forEach((command, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `command-item${index === selectedCommand ? ' selected' : ''}`;
    const label = document.createElement('span');
    label.textContent = command.label;
    const key = document.createElement('small');
    key.textContent = command.key;
    button.append(label, key);
    button.addEventListener('click', () => executeCommand(index));
    commandResults.append(button);
  });
}
function openCommands() {
  overlay.hidden = false;
  commandInput.value = '';
  selectedCommand = 0;
  renderCommands();
  commandInput.focus();
}
function closeCommands() { overlay.hidden = true; }
function executeCommand(index) {
  const command = visibleCommands[index];
  if (!command) return;
  closeCommands();
  if (command.action) command.action();
  else document.querySelector(command.target)?.scrollIntoView({behavior:'smooth'});
}
$('#command-open').addEventListener('click', openCommands);
overlay.addEventListener('click', event => { if (event.target === overlay) closeCommands(); });
commandInput.addEventListener('input', () => { selectedCommand = 0; renderCommands(); });
commandInput.addEventListener('keydown', event => {
  if (!visibleCommands.length) return;
  if (event.key === 'ArrowDown') { event.preventDefault(); selectedCommand = (selectedCommand + 1) % visibleCommands.length; renderCommands(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); selectedCommand = (selectedCommand - 1 + visibleCommands.length) % visibleCommands.length; renderCommands(); }
  if (event.key === 'Enter') executeCommand(selectedCommand);
});
addEventListener('keydown', event => {
  const typing = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault(); overlay.hidden ? openCommands() : closeCommands();
  } else if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && overlay.hidden) {
    event.preventDefault(); openCommands();
  } else if (event.key === 'Escape' && !overlay.hidden) closeCommands();
});
