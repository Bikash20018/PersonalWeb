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

/* scroll-reveal entrance animations */
const srtop = ScrollReveal({
  origin: 'bottom',
  distance: '40px',
  duration: 850,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  reset: false,
});
srtop.reveal('.experience .section-head, .experience .heading, .experience .quote', { delay: 100 });
srtop.reveal('.experience .timeline .container', { interval: 80 });

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
    document.title = 'Experience | Bikash Chhetri';
    $('#favicon').attr('href', '/assets/images/favicons.png');
  } else {
    document.title = 'Come back to the portfolio!';
    $('#favicon').attr('href', '/assets/images/favhand.png');
  }
});
