(function () {
  'use strict';

  var box = document.getElementById('lightbox');
  if (!box) return;

  var img = box.querySelector('.lightbox__img');
  var caption = box.querySelector('.lightbox__caption');
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  if (!links.length) return;

  var SWIPE_X = 40;   // horizontal distance to change image, in px
  var SWIPE_Y = 80;   // vertical distance to dismiss, in px

  var current = -1;
  var lastFocus = null;
  var startX = null;
  var startY = null;
  var swallowClick = false;

  function show(index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    img.src = link.getAttribute('data-full');
    img.alt = link.getAttribute('data-caption') || '';
    var text = link.getAttribute('data-caption') || '';
    caption.textContent = text;
    caption.hidden = text === '';
  }

  function open(index) {
    lastFocus = document.activeElement;
    box.hidden = false;
    document.body.classList.add('no-scroll');
    show(index);
    box.querySelector('.lightbox__close').focus();
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove('no-scroll');
    img.removeAttribute('src');
    if (lastFocus) lastFocus.focus();
  }

  links.forEach(function (link, index) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      open(index);
    });
  });

  box.querySelector('.lightbox__close').addEventListener('click', close);
  box.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });

  box.addEventListener('click', function (event) {
    if (swallowClick) {
      swallowClick = false;
      return;
    }
    if (event.target === box) close();
  });

  document.addEventListener('keydown', function (event) {
    if (box.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Touch and pen: swipe left/right to change image, swipe down to dismiss.
  box.addEventListener('pointerdown', function (event) {
    if (event.target.closest('button')) return;
    if (event.pointerType === 'mouse' && event.buttons === 0) return;
    startX = event.clientX;
    startY = event.clientY;
  });

  box.addEventListener('pointercancel', function () {
    startX = null;
  });

  box.addEventListener('pointerup', function (event) {
    if (startX === null) return;
    var dx = event.clientX - startX;
    var dy = event.clientY - startY;
    startX = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) < SWIPE_X) return;
      swallowClick = true;
      show(dx > 0 ? current - 1 : current + 1);
      return;
    }

    if (dy > SWIPE_Y) {
      swallowClick = true;
      close();
    }
  });
}());
