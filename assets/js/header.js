(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  if (!header) return;

  var THRESHOLD = 6; // px of travel before toggling, kills jitter on trackpads
  var lastY = window.pageYOffset;
  var hidden = false;
  var ticking = false;

  function setHidden(value) {
    if (value === hidden) return;
    hidden = value;
    header.classList.toggle('is-hidden', hidden);
  }

  function update() {
    ticking = false;
    var y = window.pageYOffset;
    var delta = y - lastY;
    if (Math.abs(delta) < THRESHOLD) return;

    // Hide while moving down the page, show as soon as the page moves up again.
    // Near the very top the header always stays visible.
    setHidden(delta > 0 && y > header.offsetHeight);
    lastY = y;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  // Keyboard users tabbing into the header must never land on a hidden link.
  header.addEventListener('focusin', function () {
    setHidden(false);
    lastY = window.pageYOffset;
  });

  // Desktop: nudging the pointer into the band the bar occupies brings it back,
  // so it is reachable without scrolling up first. The band is exactly as tall
  // as the bar (measured live, so it follows the responsive header); a
  // transform does not change offsetHeight, so a hidden bar still reports it.
  window.addEventListener('mousemove', function (event) {
    if (!hidden || event.clientY > header.offsetHeight) return;
    setHidden(false);
    lastY = window.pageYOffset;
  }, { passive: true });
}());
