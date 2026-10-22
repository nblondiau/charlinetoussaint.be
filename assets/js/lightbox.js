(function () {
  'use strict';

  var Core = window.PhotoSwipe;
  var Lightbox = window.PhotoSwipeLightbox;
  // Progressive: without the vendor script (or without a gallery on the page)
  // the thumbnail links simply open the full image in the browser.
  if (!Core || !Lightbox || !document.querySelector('a[data-lightbox]')) return;

  var CAPTION_PX = 36; // space reserved under the image for the caption

  // PhotoSwipe quietly replaces the animation with a fade when the browser
  // reports prefers-reduced-motion or (update: slow):
  //   _prepareOptions() { if (matchMedia('(prefers-reduced-motion), (update: slow)').matches)
  //     options.showHideAnimationType = 'none'; options.zoomAnimationDuration = 0; }
  // The thumbnail morph is the whole point of this gallery, so restore it right
  // after construction — still before init(), which is where the opening
  // animation reads its options.
  function AnimatedPhotoSwipe(options) {
    var pswp = new Core(options);
    pswp.options.showHideAnimationType = 'zoom';
    pswp.options.zoomAnimationDuration = 333;
    return pswp;
  }
  AnimatedPhotoSwipe.prototype = Core.prototype; // so the lightbox accepts it

  var lightbox = new Lightbox({
    gallery: '.gallery',
    children: 'a[data-lightbox]',
    pswpModule: AnimatedPhotoSwipe,

    // Animate the image between the thumbnail rect and the full-screen rect.
    showHideAnimationType: 'zoom',
    bgOpacity: 0.94,

    // Preload neighbours: [before, after] the current image.
    preload: [1, 2],

    wheelToZoom: true,
    paddingFn: function (viewportSize) {
      var edge = viewportSize.x < 640 ? 12 : 48;
      return { top: edge, bottom: edge + CAPTION_PX, left: edge, right: edge };
    },

    closeTitle: 'Fermer',
    zoomTitle: 'Zoomer',
    arrowPrevTitle: 'Image précédente',
    arrowNextTitle: 'Image suivante',
    errorMsg: "L'image n'a pas pu être chargée"
  });

  // Desktop: a mouse must not swipe between images nor drag-to-dismiss. Touch
  // and pen keep the gestures, and dragging a zoomed-in image still pans.
  //
  // Note: `pointerDown` must NOT be default-prevented (that would also suppress
  // PhotoSwipe's tap handling, i.e. click-the-background-to-close and
  // click-the-image-to-zoom), so the drag movement itself is neutralised.
  lightbox.on('afterInit', function () {
    var pswp = lightbox.pswp;

    // Arrow buttons and ←/→ keys go through goTo(), which moves the slide strip
    // with the animate flag omitted — an instant jump. Ask for the animated
    // transition so desktop navigation glides exactly like a swipe.
    pswp.goTo = function (index) {
      this.mainScroll.moveIndexBy(this.getLoopedIndex(index) - this.potentialIndex, true);
    };

    var gestures = pswp.gestures;
    var drag = gestures && gestures.drag;
    var pressedWithMouse = false;

    // Touch devices: no arrows, swipe instead. PhotoSwipe ships a CSS rule for
    // that, but it re-shows the arrows once any mouse event is seen (devtools
    // emulation, hybrid laptops), so pin it ourselves.
    if (gestures && gestures.supportsTouch) pswp.element.classList.add('pswp--no-arrows');

    pswp.on('pointerDown', function (event) {
      var original = event.originalEvent;
      pressedWithMouse = original.pointerType === 'mouse' || original.type === 'mousedown';
    });

    if (drag) {
      var dragChange = drag.change;
      drag.change = function () {
        var slide = pswp.currSlide;
        var zoomed = slide && slide.currZoomLevel > slide.zoomLevels.fit + 0.01;
        if (pressedWithMouse && !zoomed) return; // ignore the drag, keep the tap
        return dragChange.apply(drag, arguments);
      };
    }

    // Touch: tap on the dark background closes. Touches never reach
    // bgClickAction — they go through tapAction, whose default is
    // 'toggle-controls'. Keep that default while the tap is on the photo.
    pswp.on('tapAction', function (event) {
      var target = event.originalEvent.target;
      if (!target || typeof target.closest !== 'function') return;
      if (target.closest('img.pswp__img')) return;
      event.preventDefault();
      pswp.close();
    });
  });

  // Captions: PhotoSwipe 5 has no built-in caption, so add one that follows the
  // current slide and reads `data-caption` off the gallery link. Note that on
  // `change` the fresh index is `pswp.currIndex`; `pswp.currSlide` still points
  // at the previous slide (PhotoSwipe's own counter plugin does the same).
  function currentElement(pswp) {
    var source = pswp.options.dataSource;
    var items = source && source.items;
    var el = items && items[pswp.currIndex];
    if (!el && pswp.currSlide) el = pswp.currSlide.data.element;
    return el || null;
  }

  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'caption',
      className: 'pswp__caption',
      tagName: 'div',
      appendTo: 'root',
      order: 9,
      onInit: function (el, pswp) {
        function update() {
          var link = currentElement(pswp);
          var text = (link && link.getAttribute('data-caption')) || '';
          el.textContent = text;
          el.hidden = text === '';
        }
        pswp.on('change', update);
        update();
      }
    });
  });

  lightbox.init();
}());
