import React, { createContext, useContext, useState, useEffect } from 'react';
import { Search, Zap, Database, Shield, FileText, Sparkles } from 'lucide-react';

const BRAND_STORAGE_KEY = 'avimystery_site_branding';

export const PRESET_LOGOS = [
  { id: 'search', name: 'Kính lúp Trinh thám', icon: Search },
  { id: 'zap', name: 'Tia chớp Năng lượng', icon: Zap },
  { id: 'database', name: 'Cơ sở dữ liệu', icon: Database },
  { id: 'shield', name: 'Khiên Bảo mật', icon: Shield },
  { id: 'file-text', name: 'Hồ sơ Vụ án', icon: FileText },
  { id: 'sparkles', name: 'Tỏa sáng Bí ẩn', icon: Sparkles },
];

export const DEFAULT_BRAND = {
  brandName: 'Avi-Mystery',
  brandTagline: 'Nền tảng học phân tích dữ liệu qua các nhiệm vụ điều tra kinh doanh thực tế',
  brandLogo: 'search',
};

const BrandContext = createContext({
  brand: DEFAULT_BRAND,
  updateBrand: () => {},
  resetBrand: () => {},
});

/**
 * Cập nhật Favicon (<link rel="icon">) trên thẻ <head> trình duyệt
 */
export function updateFavicon(logoKeyOrUrl) {
  if (typeof document === 'undefined') return;

  const presetSvgs = {
    search: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f59e0b"/><circle cx="44" cy="44" r="18" fill="none" stroke="%2378350f" stroke-width="8"/><line x1="57" y1="57" x2="77" y2="77" stroke="%2378350f" stroke-width="8" stroke-linecap="round"/></svg>`,
    zap: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f59e0b"/><path d="M55 15 L25 55 L48 55 L42 85 L75 45 L52 45 Z" fill="%2378350f"/></svg>`,
    database: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f59e0b"/><ellipse cx="50" cy="35" rx="22" ry="9" fill="none" stroke="%2378350f" stroke-width="6"/><path d="M28 35 v16 c0 5 10 9 22 9 s22 -4 22 -9 v-16" fill="none" stroke="%2378350f" stroke-width="6"/><path d="M28 51 v16 c0 5 10 9 22 9 s22 -4 22 -9 v-16" fill="none" stroke="%2378350f" stroke-width="6"/></svg>`,
    shield: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f59e0b"/><path d="M50 20 L72 30 V48 C72 65 50 78 50 78 C50 78 28 65 28 48 V30 Z" fill="none" stroke="%2378350f" stroke-width="6"/></svg>`,
    'file-text': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f59e0b"/><path d="M30 20 h30 l15 15 v45 h-45 Z" fill="none" stroke="%2378350f" stroke-width="6"/><line x1="40" y1="45" x2="60" y2="45" stroke="%2378350f" stroke-width="6"/><line x1="40" y1="60" x2="60" y2="60" stroke="%2378350f" stroke-width="6"/></svg>`,
    sparkles: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%23f59e0b"/><path d="M50 20 L56 40 L76 46 L56 52 L50 72 L44 52 L24 46 L44 40 Z" fill="%2378350f"/></svg>`,
  };

  const faviconHref = presetSvgs[logoKeyOrUrl] || logoKeyOrUrl;

  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = faviconHref;
}

export function BrandProvider({ children }) {
  const [brand, setBrand] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(BRAND_STORAGE_KEY);
        if (saved) return { ...DEFAULT_BRAND, ...JSON.parse(saved) };
      } catch (err) {
        console.error('Error reading brand config:', err);
      }
    }
    return DEFAULT_BRAND;
  });

  // Tự động đồng bộ Favicon và Title tab trình duyệt
  useEffect(() => {
    updateFavicon(brand.brandLogo);

    if (typeof document !== 'undefined') {
      document.title = brand.brandName || 'Avi-Mystery';
    }

    try {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brand));
    } catch (err) {
      console.error('Error saving brand config:', err);
    }
  }, [brand]);

  const updateBrand = (newSettings) => {
    setBrand((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  const resetBrand = () => {
    setBrand(DEFAULT_BRAND);
  };

  return (
    <BrandContext.Provider value={{ brand, updateBrand, resetBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}

/**
 * Component hiển thị Logo biểu tượng theo cấu hình thương hiệu động
 */
export function BrandLogoIcon({ logoKey, className = "size-5" }) {
  const { brand } = useBrand();
  const activeLogo = logoKey || brand?.brandLogo || 'search';

  if (activeLogo === 'zap') return <Zap className={className} />;
  if (activeLogo === 'database') return <Database className={className} />;
  if (activeLogo === 'shield') return <Shield className={className} />;
  if (activeLogo === 'file-text') return <FileText className={className} />;
  if (activeLogo === 'sparkles') return <Sparkles className={className} />;
  if (activeLogo === 'search') return <Search className={className} />;

  // Nếu là URL hình ảnh
  return <img src={activeLogo} alt="Logo" className={`${className} object-contain`} />;
}
