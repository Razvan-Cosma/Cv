// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const body = document.body;

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', currentTheme);
body.setAttribute('data-theme', currentTheme);

// Update toggle button icon
function updateToggleIcon() {
  const theme = body.getAttribute('data-theme');
  const icon = themeToggle.querySelector('.toggle-icon');
  icon.src = theme === 'dark' 
    ? 'Img/Light/Dark/icons8-light-96.png' 
    : 'Img/Light/Dark/icons8-light.png';
  icon.alt = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

updateToggleIcon();

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
  const currentTheme = body.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  htmlElement.setAttribute('data-theme', newTheme);
  body.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  updateToggleIcon();
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Add animation on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {
  threshold: 0.1
});

// Observe sections for animation
document.querySelectorAll('.section, .skill-card, .hobby-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease-out';
  observer.observe(el);
});

// Mouse follow effect on profile image
const profileImage = document.querySelector('.profile-image');
if (profileImage) {
  document.addEventListener('mousemove', (e) => {
    const rect = profileImage.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const distance = Math.sqrt(x * x + y * y);
    if (distance < 300) {
      profileImage.style.transform = `translateX(${x * 0.1}px) translateY(${y * 0.1}px)`;
    }
  });
}

// Add subtle parallax effect
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.bg-animation');
  
  parallaxElements.forEach(el => {
    el.style.transform = `translateY(${scrolled * 0.5}px)`;
  });
});

// Skill bars animation on scroll
const skillFills = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
      entry.target.classList.add('animated');
      entry.target.style.animation = 'none';
      setTimeout(() => {
        entry.target.style.animation = '';
      }, 10);
    }
  });
}, { threshold: 0.5 });

skillFills.forEach(fill => skillObserver.observe(fill));

// Contact button interactions
const contactBtns = document.querySelectorAll('.contact-btn');
contactBtns.forEach(btn => {
  btn.addEventListener('mouseenter', function() {
    this.style.transform = 'translateX(8px) scale(1.05)';
  });
  
  btn.addEventListener('mouseleave', function() {
    this.style.transform = 'translateX(0) scale(1)';
  });
});

// Add console message
console.log('%cWelcome to Razvan Cosma\'s Portfolio!', 'font-size: 20px; color: #00d9ff; font-weight: bold; text-shadow: 0 0 10px #00d9ff;');
console.log('%cBuilding the future, one line of code at a time.', 'font-size: 14px; color: #a5b4fc;');
