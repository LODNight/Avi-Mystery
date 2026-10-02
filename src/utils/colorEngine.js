/**
 * Color Engine — Tính toán sắc độ, độ tương phản tự động (WCAG 2.1)
 * và tạo các biến thể màu hài hòa (Hover, Glow, Shadows) cho Avi-Mystery.
 */

/**
 * Chuẩn hóa và parse mã màu HEX sang RGB (hỗ trợ cả 3 ký tự và 6 ký tự)
 */
export function parseHex(hexColor) {
  if (!hexColor || typeof hexColor !== 'string') return null;
  let clean = hexColor.trim();
  if (clean.startsWith('#')) clean = clean.slice(1);
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
    hex: `#${clean.toUpperCase()}`,
  };
}

/**
 * Tính toán độ sáng tương đối (Relative Luminance theo công thức WCAG 2.1)
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(r, g, b) {
  const toLinear = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Tính tỷ lệ tương phản giữa 2 độ sáng tương đối
 */
export function calculateContrastRatio(lum1, lum2) {
  const l1 = Math.max(lum1, lum2);
  const l2 = Math.min(lum1, lum2);
  return (l1 + 0.05) / (l2 + 0.05);
}

const DARK_TEXT_RGB = { r: 15, g: 23, b: 42 }; // #0f172a (Slate 900)
const DARK_TEXT_LUM = getRelativeLuminance(DARK_TEXT_RGB.r, DARK_TEXT_RGB.g, DARK_TEXT_RGB.b);
const WHITE_TEXT_LUM = 1.0; // #ffffff

/**
 * Phân tích độ tương phản và tự động chọn màu chữ tối ưu theo chuẩn WCAG
 */
export function analyzeContrast(hexColor) {
  const parsed = parseHex(hexColor);
  if (!parsed) {
    return {
      foreground: '#ffffff',
      ratio: 4.5,
      score: '4.5:1',
      wcagLevel: 'AA',
      isAccessible: true,
      isLight: false,
    };
  }

  const bgLum = getRelativeLuminance(parsed.r, parsed.g, parsed.b);
  const ratioWithWhite = calculateContrastRatio(bgLum, WHITE_TEXT_LUM);
  const ratioWithDark = calculateContrastRatio(bgLum, DARK_TEXT_LUM);

  // Chọn màu chữ mang lại độ tương phản cao nhất
  const preferDark = ratioWithDark > ratioWithWhite;
  const bestRatio = preferDark ? ratioWithDark : ratioWithWhite;
  const roundedRatio = Math.round(bestRatio * 10) / 10;

  let wcagLevel = 'Fail';
  if (roundedRatio >= 7.0) {
    wcagLevel = 'AAA';
  } else if (roundedRatio >= 4.5) {
    wcagLevel = 'AA';
  } else if (roundedRatio >= 3.0) {
    wcagLevel = 'AA Large';
  }

  return {
    foreground: preferDark ? '#0f172a' : '#ffffff',
    ratio: roundedRatio,
    score: `${roundedRatio}:1`,
    wcagLevel,
    isAccessible: roundedRatio >= 4.5,
    isLight: bgLum > 0.55,
  };
}

/**
 * Trả về màu chữ tương phản tối ưu (#0f172a hoặc #ffffff) cho một màu nền HEX
 */
export function getContrastForeground(hexColor) {
  return analyzeContrast(hexColor).foreground;
}

/**
 * Chuyển RGB sang HSL để dễ dàng điều chỉnh sắc độ và độ sáng
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Chuyển HSL sang mã HEX
 */
export function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Tự động tạo màu hover hài hòa (làm tối 10-15% nếu màu sáng, làm sáng 10-15% nếu màu tối)
 */
export function generateHoverColor(hexColor) {
  const parsed = parseHex(hexColor);
  if (!parsed) return hexColor;
  const [h, s, l] = rgbToHsl(parsed.r, parsed.g, parsed.b);

  // Nếu màu quá tối (L < 20), làm sáng lên; nếu không làm tối đi
  const newL = l < 25 ? Math.min(100, l + 14) : Math.max(0, l - 10);
  return hslToHex(h, s, newL);
}

/**
 * Tạo màu Glow với alpha trong suốt
 */
export function generateGlowRgba(hexColor, alpha = 0.25) {
  const parsed = parseHex(hexColor);
  if (!parsed) return `rgba(217, 119, 6, ${alpha})`;
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
}

/**
 * 7 Bộ Màu Phong Cách Thám Tử (Detective Persona Palettes)
 */
export const DETECTIVE_PERSONA_PRESETS = [
  {
    id: 'amber',
    css: '#f59e0b',
    name: 'Amber Noir',
    label: 'Amber Noir (Mặc định)',
    tagline: 'Cổ điển & Hồ sơ giấy da',
    description: 'Đèn bàn trinh thám cổ điển, hồ sơ vụ án giấy da, ấm áp và tập trung tuyệt đối.',
    badge: 'Mặc định',
  },
  {
    id: 'indigo',
    css: '#6366f1',
    name: 'Cyber Forensics',
    label: 'Cyber Forensics',
    tagline: 'Điều tra số & Khai phá dữ liệu',
    description: 'Chuyên gia trích xuất dữ liệu số, màn hình terminal phân tích logic hiện đại.',
  },
  {
    id: 'emerald',
    css: '#10b981',
    name: 'Emerald Evidence',
    label: 'Emerald Evidence',
    tagline: 'Phòng giám định & Vật chứng',
    description: 'Phòng pháp y khoa học, tài liệu giám định đã xác thực, sắc bén và chính xác.',
  },
  {
    id: 'rose',
    css: '#f43f5e',
    name: 'Crimson Dossier',
    label: 'Crimson Dossier',
    tagline: 'Hồ sơ Tuyệt mật mức độ Đỏ',
    description: 'Hồ sơ mức độ khẩn cấp, cảnh báo nghi can trọng phạm, hành động quyết đoán.',
  },
  {
    id: 'cyan',
    css: '#06b6d4',
    name: 'Cyan Protocol',
    label: 'Cyan Protocol',
    tagline: 'Mạng lưới tình báo & Radar',
    description: 'Mạng lưới tình báo viễn thông, sóng tín hiệu radar và dữ liệu đa chiều.',
  },
  {
    id: 'purple',
    css: '#a855f7',
    name: 'Shadow Amethyst',
    label: 'Shadow Amethyst',
    tagline: 'Điệp viên ngầm tác chiến',
    description: 'Tác chiến ban đêm, điệp viên bí mật ẩn mình, phong cách tối giản huyền bí.',
  },
  {
    id: 'monochrome',
    css: '#52525b',
    name: 'Monochrome Agent',
    label: 'Monochrome Agent',
    tagline: 'Tối giản tuyệt đối & Dữ liệu thuần',
    description: 'Phong cách tối giản Slate xám thép, loại bỏ xao nhãng để tập trung 100% vào số liệu.',
  },
];
