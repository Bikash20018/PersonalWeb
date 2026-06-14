/* =====================================================================
   Bikash Chhetri — portfolio interactions
   ===================================================================== */

$(document).ready(function () {

  /* auto-updating copyright year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* mobile menu toggle */
  $('#menu').click(function () {
    $(this).toggleClass('fa-times');
    $('.navbar').toggleClass('nav-toggle');
  });

  /* header state, scroll-top button, progress bar & scroll-spy */
  $(window).on('scroll load', function () {
    $('#menu').removeClass('fa-times');
    $('.navbar').removeClass('nav-toggle');

    const scrolled = window.scrollY > 60;
    document.querySelector('#scroll-top')?.classList.toggle('active', scrolled);
    document.querySelector('header')?.classList.toggle('scrolled', scrolled);

    /* scroll progress indicator */
    const progress = document.getElementById('scroll-progress');
    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progress.style.width = pct + '%';
    }

    /* scroll spy — highlight the active nav link */
    $('section').each(function () {
      const height = $(this).height();
      const offset = $(this).offset().top - 220;
      const top = $(window).scrollTop();
      const id = $(this).attr('id');
      if (id && top > offset && top < offset + height) {
        $('.navbar ul li a').removeClass('active');
        $('.navbar').find(`[href="#${id}"]`).addClass('active');
      }
    });
  });

  /* smooth scrolling with offset for the fixed header */
  $('a[href^="#"]').on('click', function (e) {
    const hash = $(this).attr('href');
    if (hash === '#' || $(hash).length === 0) return;
    e.preventDefault();
    const headerHeight = $('header').outerHeight() || 0;
    $('html, body').animate({
      scrollTop: $(hash).offset().top - headerHeight + 2,
    }, 700, 'swing');
  });

  /* contact form -> EmailJS */
  $('#contact-form').submit(function (event) {
    event.preventDefault();
    emailjs.init('user_TTDmetQLYgWCLzHTDgqxm');
    emailjs.sendForm('contact_service', 'template_contact', '#contact-form')
      .then(function (response) {
        console.log('SUCCESS!', response.status, response.text);
        document.getElementById('contact-form').reset();
        alert('Message sent successfully. Thank you!');
      }, function (error) {
        console.log('FAILED...', error);
        alert('Something went wrong — please try again.');
      });
  });

});

/* swap title/favicon when the tab loses focus */
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') {
    document.title = 'Bikash Chhetri · Full-Stack & Android Developer';
    $('#favicon').attr('href', 'assets/images/favicons.png');
  } else {
    document.title = 'Come back to the portfolio!';
    $('#favicon').attr('href', 'assets/images/favhand.png');
  }
});

/* typed.js hero effect */
new Typed('.typing-text', {
  strings: ['front-end development', 'back-end development', 'web design', 'Android development', 'full-stack apps'],
  loop: true,
  typeSpeed: 55,
  backSpeed: 28,
  backDelay: 1200,
});

/* skills — loaded from skills.json */
async function fetchSkills() {
  const response = await fetch('skills.json');
  return response.json();
}

function showSkills(skills) {
  const container = document.getElementById('skillsContainer');
  if (!container) return;
  container.innerHTML = skills.map(skill => `
    <li class="skill">
      <img src="${skill.icon}" alt="${skill.name}" loading="lazy" decoding="async" />
      <span>${skill.name}</span>
    </li>`).join('');
}

fetchSkills().then(showSkills).catch(err => console.error('Could not load skills:', err));

/* featured projects — recent public repos, names copied live from GitHub */
const GH_USER = 'Bikash20018';
const featuredEl = document.getElementById('featured-projects');

function ghEsc(s) {
  return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function ghTimeAgo(iso) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [name, s] of units) { const v = Math.floor(secs / s); if (v >= 1) return `${v} ${name}${v > 1 ? 's' : ''} ago`; }
  return 'just now';
}
function featuredCard(repo) {
  const role = ghEsc(repo.description) || (repo.language ? ghEsc(repo.language) + ' repository' : 'Public repository');
  const meta = `${repo.language ? ghEsc(repo.language) + ' · ' : ''}Updated ${ghTimeAgo(repo.updated_at)}`;
  return `
    <div class="container">
      <div class="content">
        <div class="tag"><h2><a href="${ghEsc(repo.html_url)}" target="_blank" rel="noopener">${ghEsc(repo.name)}</a></h2></div>
        <div class="desc">
          <h3>${role}</h3>
          <p>${meta}</p>
        </div>
      </div>
    </div>`;
}
if (featuredEl) {
  fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=100`)
    .then(r => { if (!r.ok) throw new Error('GitHub ' + r.status); return r.json(); })
    .then(repos => {
      const list = (Array.isArray(repos) ? repos : [])
        .filter(r => !r.fork && !r.archived)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 6);
      featuredEl.innerHTML = list.length
        ? list.map(featuredCard).join('')
        : `<p class="repo-loading">No public projects yet — see <a href="https://github.com/${GH_USER}" target="_blank" rel="noopener">GitHub</a>.</p>`;
    })
    .catch(err => {
      console.error('Featured projects: could not load repos —', err);
      featuredEl.innerHTML = `<p class="repo-loading">Couldn't load projects right now — see <a href="https://github.com/${GH_USER}" target="_blank" rel="noopener">github.com/${GH_USER}</a>.</p>`;
    });
}

/* scroll-reveal entrance animations */
const sr = ScrollReveal({
  origin: 'bottom',
  distance: '40px',
  duration: 850,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  reset: false,
});

/* hero */
sr.reveal('.hero__intro .eyebrow', { delay: 100 });
sr.reveal('.hero__title', { delay: 180 });
sr.reveal('.hero__lead', { delay: 260 });
sr.reveal('.hero__actions', { delay: 340 });
sr.reveal('.hero__intro .social-icons', { delay: 420 });
sr.reveal('.hero__media', { delay: 240, origin: 'right', distance: '60px' });

/* sections */
sr.reveal('.section-head', { delay: 100 });
sr.reveal('.about__media', { origin: 'left', distance: '60px' });
sr.reveal('.about__body .tag, .about__body .bio, .about__facts, .resumebtn', { interval: 90 });
sr.reveal('.skill', { interval: 50 });
sr.reveal('.education .box', { interval: 90 });
sr.reveal('.experience .timeline .container', { interval: 90 });
sr.reveal('.contact__details, .contact__intro .social-icons, .contact__form', { interval: 100 });

/* live chat (Tawk.to) */
var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
(function () {
  var s1 = document.createElement('script'), s0 = document.getElementsByTagName('script')[0];
  s1.async = true;
  s1.src = 'https://embed.tawk.to/60df10bf7f4b000ac03ab6a8/1f9jlirg6';
  s1.charset = 'UTF-8';
  s1.setAttribute('crossorigin', '*');
  s0.parentNode.insertBefore(s1, s0);
})();
