import type { GameState } from './state';

/** Single source of truth for turning saved fx settings into DOM classes. */
export function applyFx(fx: GameState['fx']) {
  document.body.classList.toggle('fx-scanlines-on', fx.scanlines);
  document.body.classList.toggle('fx-crt-glow-on', fx.crtGlow);
  document.body.classList.toggle('fx-rgb-split-on', fx.rgbSplit);
}
