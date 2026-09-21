import { describe, it, expect } from 'vitest';
import { caseLocalizationService } from './caseLocalizationService.js';

describe('caseLocalizationService Unit Tests', () => {
  const sampleData = {
    title: {
      en: 'The Coffee Smuggling Ring',
      vi: 'Đường Dây Buôn Lậu Cà Phê'
    },
    clues: [
      {
        id: 'c1',
        text: {
          en: 'A suspicious ledger entry',
          vi: 'Một dòng sổ kế toán đáng ngờ'
        }
      }
    ]
  };

  it('giải mã đúng ngôn ngữ tiếng Việt khi truyền "vi"', () => {
    const res = caseLocalizationService.getLocalizedData(sampleData, 'vi');
    expect(res.title).toBe('Đường Dây Buôn Lậu Cà Phê');
    expect(res.clues[0].text).toBe('Một dòng sổ kế toán đáng ngờ');
  });

  it('giải mã đúng ngôn ngữ tiếng Việt khi truyền locale "vi-VN"', () => {
    const res = caseLocalizationService.getLocalizedData(sampleData, 'vi-VN');
    expect(res.title).toBe('Đường Dây Buôn Lậu Cà Phê');
    expect(res.clues[0].text).toBe('Một dòng sổ kế toán đáng ngờ');
  });

  it('giải mã đúng ngôn ngữ tiếng Anh khi truyền "en"', () => {
    const res = caseLocalizationService.getLocalizedData(sampleData, 'en');
    expect(res.title).toBe('The Coffee Smuggling Ring');
    expect(res.clues[0].text).toBe('A suspicious ledger entry');
  });

  it('giải mã đúng ngôn ngữ tiếng Anh khi truyền locale "en-US"', () => {
    const res = caseLocalizationService.getLocalizedData(sampleData, 'en-US');
    expect(res.title).toBe('The Coffee Smuggling Ring');
    expect(res.clues[0].text).toBe('A suspicious ledger entry');
  });

  it('fallback về tiếng Việt khi giá trị ngôn ngữ rỗng hoặc không xác định', () => {
    const res = caseLocalizationService.getLocalizedData(sampleData, null);
    expect(res.title).toBe('Đường Dây Buôn Lậu Cà Phê');
  });
});
