/* =====================================================================
   Projects — a live feed of public GitHub repositories
   ===================================================================== */

const GH_USER = 'Bikash20018';

$(document).ready(function () {

  /* auto-updating copyright year */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* mobile menu toggle */
  $('#menu').click(function () {
    $(this).toggleClass('fa-times');
    $('.navbar').toggleClass('nav-toggle');
  });

  /* header state + scroll-to-top button */
  $(window).on('scroll load', function () {
    $('#menu').removeClass('fa-times');
    $('.navbar').removeClass('nav-toggle');

    const scrolled = window.scrollY > 60;
    document.querySelector('#scroll-top')?.classList.toggle('active', scrolled);
    document.querySelector('header')?.classList.toggle('scrolled', scrolled);
  });
});

/* ---- helpers ---- */
const grid = document.querySelector('.work .box-container');

function esc(str) {
  return String(str || '').replace(/[&<>"]/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));
}

function timeAgo(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units = [
    ['year', 31536000], ['month', 2592000], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60],
  ];
  for (const [name, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${name}${value > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

function repoCard(repo) {
  const desc = esc(repo.description) || 'No description provided.';
  const lang = repo.language
    ? `<span class="repo-lang"><b class="dot"></b>${esc(repo.language)}</span>` : '';
  const live = repo.homepage
    ? `<a href="${esc(repo.homepage)}" target="_blank" rel="noopener" class="btn btn--primary">Live <i class="fas fa-external-link-alt"></i></a>` : '';
  return `
    <article class="repo-card">
      <div class="repo-head">
        <span class="repo-icon"><i class="fas fa-code-branch"></i></span>
        <h3 class="repo-name">${esc(repo.name)}</h3>
      </div>
      <p class="repo-desc">${desc}</p>
      <div class="repo-meta">
        ${lang}
        <span><i class="far fa-star"></i>${repo.stargazers_count}</span>
        <span><i class="fas fa-code-branch"></i>${repo.forks_count}</span>
        <span class="repo-updated">Updated ${timeAgo(repo.updated_at)}</span>
      </div>
      <div class="repo-links">
        <a href="${esc(repo.html_url)}" target="_blank" rel="noopener" class="btn">Code <i class="fab fa-github"></i></a>
        ${live}
      </div>
    </article>`;
}

function setState(html) { if (grid) grid.innerHTML = html; }

function emptyState() {
  return `
    <div class="empty-note">
      <i class="fas fa-folder-open"></i>
      <h3>No public projects yet</h3>
      <p>Nothing public to show right now — follow along on
      <a href="https://github.com/${GH_USER}" target="_blank" rel="noopener">GitHub</a>.</p>
    </div>`;
}

function errorState() {
  return `
    <div class="empty-note">
      <i class="fas fa-folder-open"></i>
      <h3>Couldn't load projects right now</h3>
      <p>GitHub may be rate-limiting requests. See everything on
      <a href="https://github.com/${GH_USER}" target="_blank" rel="noopener">github.com/${GH_USER}</a>.</p>
    </div>`;
}

/* ---- fetch & render ---- */
setState('<div class="repo-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading projects from GitHub…</div>');

fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=100`)
  .then(res => {
    if (!res.ok) throw new Error('GitHub API responded ' + res.status);
    return res.json();
  })
  .then(repos => {
    const list = (Array.isArray(repos) ? repos : [])
      .filter(r => !r.fork && !r.archived)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    setState(list.length ? list.map(repoCard).join('') : emptyState());
  })
  .catch(err => {
    console.error('Projects: could not load repos —', err);
    setState(errorState());
  });

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

/* swap title/favicon when the tab loses focus */
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') {
    document.title = 'Projects · Bikash Chhetri';
    $('#favicon').attr('href', '/assets/images/favicons.png');
  } else {
    document.title = 'Come back to the portfolio!';
    $('#favicon').attr('href', '/assets/images/favhand.png');
  }
});
