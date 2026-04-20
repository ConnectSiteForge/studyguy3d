/* transitions.js — page transition overlay for all StudyGuy 3D pages */
(function () {
  /* ── Inject overlay + styles ─────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '#sg-transition {',
    '  position: fixed; inset: 0; z-index: 9999;',
    '  background: #050d1a;',
    '  pointer-events: none;',
    '  opacity: 1;',
    '  transition: opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1);',
    '}',
    '#sg-transition.out { opacity: 0; }',
    '#sg-transition.in  { opacity: 1; pointer-events: all; }',
  ].join('\n');
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.id = 'sg-transition';
  document.body.appendChild(overlay);

  /* ── Fade in on load, then fade out ─────────────────── */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      overlay.classList.add('out');
    });
  });

  /* ── Intercept internal link clicks ─────────────────── */
  document.addEventListener('click', function (e) {
    var anchor = e.target.closest('a[href]');
    if (!anchor) return;

    var href = anchor.getAttribute('href');
    if (!href) return;

    /* Skip: external, hash-only, mailto, tel, new-tab */
    if (
      anchor.target === '_blank' ||
      href.startsWith('http') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#')
    ) return;

    e.preventDefault();
    var dest = href;

    /* Fade in overlay then navigate */
    overlay.classList.remove('out');
    overlay.classList.add('in');

    setTimeout(function () {
      window.location.href = dest;
    }, 460);
  });
})();
