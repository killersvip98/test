/* ═══════════════════════════════════════
   KILLERS VIP — Source Code Protection
   Safe version — No false triggers on mobile/Safari
   ═══════════════════════════════════════ */

(function () {
  'use strict';

  /* 1. Block Right-Click Context Menu */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  /* 2. Block Keyboard Shortcuts */
  document.addEventListener('keydown', function (e) {
    // F12 — DevTools
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault(); return false;
    }
    // Ctrl+Shift+I — DevTools Inspector
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault(); return false;
    }
    // Ctrl+Shift+J — DevTools Console
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault(); return false;
    }
    // Ctrl+Shift+C — DevTools Element Inspector
    if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
      e.preventDefault(); return false;
    }
    // Ctrl+U — View Page Source
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault(); return false;
    }
    // Ctrl+S — Save Page
    if (e.ctrlKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault(); return false;
    }
    // Ctrl+A — Select All
    if (e.ctrlKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault(); return false;
    }
    // Ctrl+P — Print
    if (e.ctrlKey && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault(); return false;
    }
    // Ctrl+Shift+K — Firefox DevTools
    if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
      e.preventDefault(); return false;
    }
  });

  /* 3. Block Text Selection (Desktop only — skip mobile/touch) */
  if (!('ontouchstart' in window)) {
    document.addEventListener('selectstart', function (e) {
      // Allow selection inside input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault(); return false;
    });
  }

  /* 4. Block Drag (prevents image/text drag-copy) */
  document.addEventListener('dragstart', function (e) {
    e.preventDefault(); return false;
  });

  /* 5. Console Warning Message */
  setTimeout(function () {
    console.clear();
    console.log(
      '%c⚠ STOP!',
      'color:#f7931a;font-size:2rem;font-weight:bold;'
    );
    console.log(
      '%c This is a protected website. Unauthorized copying is prohibited.',
      'color:#fff;font-size:1rem;'
    );
    console.log(
      '%cIf someone told you to paste something here, it is a scam!',
      'color:#e53935;font-size:0.9rem;'
    );
  }, 500);

  /* 6. Disable CSS user-select (Desktop only) */
  if (!('ontouchstart' in window)) {
    document.documentElement.style.webkitUserSelect = 'none';
    document.documentElement.style.MozUserSelect    = 'none';
    document.documentElement.style.msUserSelect     = 'none';
    document.documentElement.style.userSelect       = 'none';
  }

})();
