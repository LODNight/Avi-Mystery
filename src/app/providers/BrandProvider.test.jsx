import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { BrandProvider, useBrand, BrandLogoIcon } from './BrandProvider.jsx';

function TestBrandConsumer() {
  const { brand, updateBrand, resetBrand } = useBrand();

  return (
    <div>
      <h1 data-testid="brand-name">{brand.brandName}</h1>
      <p data-testid="brand-logo">{brand.brandLogo}</p>
      <BrandLogoIcon data-testid="brand-icon" />

      <button
        onClick={() =>
          updateBrand({ brandName: 'Custom Brand', brandLogo: 'zap' })
        }
      >
        Update Brand
      </button>
      <button onClick={resetBrand}>Reset Brand</button>
    </div>
  );
}

describe('BrandProvider & Favicon Sync Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('cung cấp giá trị mặc định cho brand và hiển thị đúng thông tin', () => {
    render(
      <BrandProvider>
        <TestBrandConsumer />
      </BrandProvider>
    );

    expect(screen.getByTestId('brand-name')).toHaveTextContent('Avi-Mystery');
    expect(screen.getByTestId('brand-logo')).toHaveTextContent('search');
    expect(document.title).toBe('Avi-Mystery');
  });

  it('cập nhật tên thương hiệu, logo và favicon khi gọi updateBrand', async () => {
    render(
      <BrandProvider>
        <TestBrandConsumer />
      </BrandProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Update Brand/i }));

    await waitFor(() => {
      expect(screen.getByTestId('brand-name')).toHaveTextContent('Custom Brand');
      expect(screen.getByTestId('brand-logo')).toHaveTextContent('zap');
      expect(document.title).toBe('Custom Brand');
    });

    const favicon = document.querySelector("link[rel*='icon']");
    expect(favicon).not.toBeNull();
    expect(favicon.href).toContain('data:image/svg+xml');
  });
});
