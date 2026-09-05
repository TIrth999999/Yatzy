/**
 * Typing Fighter - Robust Keyboard & Mobile Input Manager
 * Handles desktop keystrokes, mobile virtual input, anti-frustration checks, and key visualization.
 */
class InputManager {
  constructor() {
    this.hiddenInput = null;
    this.virtualKeys = {};
    this.isEnabled = false;
    this.onCharTyped = null; // callback(char)

    this.setupListeners();
  }

  init(hiddenInputEl) {
    this.hiddenInput = hiddenInputEl;
    if (this.hiddenInput) {
      // Keep mobile keyboard open when tapped anywhere in the typing area
      this.hiddenInput.addEventListener('input', (e) => this.handleMobileInput(e));
      this.hiddenInput.addEventListener('blur', () => {
        if (this.isEnabled) {
          setTimeout(() => {
            if (this.isEnabled && this.hiddenInput) {
              this.hiddenInput.focus();
            }
          }, 100);
        }
      });
    }

    this.bindVirtualKeys();
  }

  bindVirtualKeys() {
    this.virtualKeys = {};
    document.querySelectorAll('.vkey, .mvkey').forEach(el => {
      const k = el.getAttribute('data-key');
      if (k) {
        const upperK = k.toUpperCase();
        if (!this.virtualKeys[upperK]) {
          this.virtualKeys[upperK] = [];
        }
        this.virtualKeys[upperK].push(el);

        if (!el._hasPointerListener) {
          el._hasPointerListener = true;
          // Enable direct clicking/tapping on virtual keys
          el.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (!this.isEnabled) return;
            this.highlightVirtualKey(upperK);
            if (k === 'Backspace') {
              return;
            }
            if (this.onCharTyped) {
              this.onCharTyped(k);
            }
          });
        }
      }
    });
  }

  enable() {
    this.isEnabled = true;
    if (this.hiddenInput) {
      this.hiddenInput.value = '';
      this.hiddenInput.focus();
    }
  }

  disable() {
    this.isEnabled = false;
    if (this.hiddenInput) {
      this.hiddenInput.blur();
    }
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;

      // Prevent scrolling on Space or Tab during battle
      if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
      }

      // Ignore modifier combinations (e.g. Ctrl+R, Alt+Tab, F5, F12)
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.startsWith('F')) {
        return;
      }

      // We only care about single characters
      if (e.key.length === 1) {
        // PREVENT DEFAULT so hiddenInput doesn't receive duplicate character event on desktop!
        e.preventDefault();

        this.highlightVirtualKey(e.key.toUpperCase());
        if (this.onCharTyped) {
          this.onCharTyped(e.key);
        }
      }
    });

    this.bindVirtualKeys();
  }

  handleMobileInput(e) {
    if (!this.isEnabled) return;
    const val = this.hiddenInput.value;
    if (val.length > 0) {
      // Extract latest character from mobile virtual keyboard
      const char = val[val.length - 1];
      this.highlightVirtualKey(char.toUpperCase());
      if (this.onCharTyped) {
        this.onCharTyped(char);
      }
      this.hiddenInput.value = ''; // Keep buffer clean
    }
  }

  highlightVirtualKey(key) {
    const els = this.virtualKeys[key];
    if (els && Array.isArray(els)) {
      els.forEach(el => {
        el.classList.add('active');
        setTimeout(() => {
          el.classList.remove('active');
        }, 120);
      });
    }
  }
}

window.inputManager = new InputManager();
