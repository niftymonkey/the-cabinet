// The button's one power: the sound it was handed.

import type { ICanvas, ICanvasRenderingContext2D } from 'pixi.js';
import { BrowserAdapter, Cache, DOMAdapter, Texture } from 'pixi.js';
import { describe, expect, it } from 'vitest';

import { Button } from '../Button';

/**
 * The browser a widget expects, in the three places a button touches it: a
 * frame clock for its hover animation, a canvas that can measure a string, and
 * the artwork its nine-slice is cut from. None of them decide anything, and
 * that a button can be built out of three stand-ins at all is what the fence
 * over src/app/ui buys.
 */
globalThis.requestAnimationFrame ??= (() => 0) as typeof requestAnimationFrame;

const measuringContext = {
  font: '',
  measureText: (text: string) => ({
    width: text.length * 8,
    actualBoundingBoxAscent: 8,
    actualBoundingBoxDescent: 2,
  }),
};

const measuringCanvas = {
  width: 0,
  height: 0,
  getContext: () => measuringContext,
};

DOMAdapter.set({
  ...BrowserAdapter,
  createCanvas: () => measuringCanvas as unknown as ICanvas,
  getCanvasRenderingContext2D: () => ({
    prototype: {} as ICanvasRenderingContext2D,
  }),
});

Cache.set('button.png', Texture.EMPTY);

describe('the button', () => {
  it('plays the sound it is given', () => {
    // A widget under src/app/ui reaches nothing in the app, so the only thing
    // that can make a noise here is the power handed in at construction. The
    // fake is the input; what it recorded is read back.
    const played: string[] = [];
    const button = new Button({
      text: 'RISE',
      playSound: (alias) => played.push(alias),
    });

    button.onHover.emit();
    expect(played).toHaveLength(1);

    button.onDown.emit();
    expect(played).toHaveLength(2);

    // Hovering and pressing never sound the same.
    expect(new Set(played).size).toBe(2);
  });
});
