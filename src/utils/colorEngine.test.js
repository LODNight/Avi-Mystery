import { describe, it, expect } from 'vitest';
import {
  parseHex,
  getRelativeLuminance,
  calculateContrastRatio,
  analyzeContrast,
  getContrastForeground,
  rgbToHsl,
  hslToHex,
  generateHoverColor,
  generateGlowRgba,
  DETECTIVE_PERSONA_PRESETS,
} from './colorEngine.js';

describe('colorEngine unit tests', () => {
  describe('parseHex', () => {
    it('parses 6-character hex with or without hash', () => {
      expect(parseHex('#f59e0b')).toEqual({ r: 245, g: 158, b: 11, hex: '#F59E0B' });
      expect(parseHex('10b981')).toEqual({ r: 16, g: 185, b: 129, hex: '#10B981' });
    });

    it('parses 3-character hex shorthand', () => {
      expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255, hex: '#FFFFFF' });
      expect(parseHex('000')).toEqual({ r: 0, g: 0, b: 0, hex: '#000000' });
    });

    it('returns null for invalid hex', () => {
      expect(parseHex('not-a-color')).toBeNull();
      expect(parseHex(null)).toBeNull();
      expect(parseHex('#12345')).toBeNull();
    });
  });

  describe('Relative Luminance & Contrast Calculation', () => {
    it('calculates correct luminance for black and white', () => {
      expect(getRelativeLuminance(0, 0, 0)).toBe(0);
      expect(getRelativeLuminance(255, 255, 255)).toBe(1);
    });

    it('calculates contrast ratio correctly', () => {
      // White against black is 21:1
      const ratio = calculateContrastRatio(1, 0);
      expect(Math.round(ratio)).toBe(21);
    });

    it('analyzes contrast for bright yellow and selects dark foreground', () => {
      // Pure bright yellow #facc15 -> high luminance -> text should be dark (#0f172a)
      const res = analyzeContrast('#facc15');
      expect(res.foreground).toBe('#0f172a');
      expect(res.isLight).toBe(true);
      expect(res.isAccessible).toBe(true);
    });

    it('analyzes contrast for deep indigo and selects white foreground', () => {
      // Deep indigo #4338ca -> low luminance -> text should be white (#ffffff)
      const res = analyzeContrast('#4338ca');
      expect(res.foreground).toBe('#ffffff');
      expect(res.isLight).toBe(false);
      expect(res.isAccessible).toBe(true);
    });

    it('getContrastForeground helper returns correct foreground color directly', () => {
      expect(getContrastForeground('#facc15')).toBe('#0f172a');
      expect(getContrastForeground('#4338ca')).toBe('#ffffff');
    });
  });

  describe('Hover and Glow generation', () => {
    it('generates darker hover color for normal light/medium color', () => {
      const hover = generateHoverColor('#f59e0b');
      expect(hover).toMatch(/^#[0-9a-f]{6}$/i);
      expect(hover.toLowerCase()).not.toBe('#f59e0b');
    });

    it('generates glow rgba correctly', () => {
      const glow = generateGlowRgba('#10b981', 0.3);
      expect(glow).toBe('rgba(16, 185, 129, 0.3)');
    });
  });

  describe('DETECTIVE_PERSONA_PRESETS', () => {
    it('contains exactly 7 cohesive detective persona presets', () => {
      expect(DETECTIVE_PERSONA_PRESETS).toHaveLength(7);
      const ids = DETECTIVE_PERSONA_PRESETS.map(p => p.id);
      expect(ids).toEqual(['amber', 'indigo', 'emerald', 'rose', 'cyan', 'purple', 'monochrome']);
    });
  });
});
