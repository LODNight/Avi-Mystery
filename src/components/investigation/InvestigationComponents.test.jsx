import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InvestigationStamp from './InvestigationStamp';
import EvidenceCard from './EvidenceCard';

describe('InvestigationStamp Component', () => {
  it('renders default solved stamp with accessible role', () => {
    render(<InvestigationStamp />);
    const stamp = screen.getByTestId('investigation-stamp');
    expect(stamp).toBeInTheDocument();
    expect(stamp).toHaveAttribute('role', 'status');
    expect(screen.getByText('ÁN ĐÃ PHÁ')).toBeInTheDocument();
    expect(screen.getByText(/CASE CLOSED/)).toBeInTheDocument();
  });

  it('renders custom label and sublabel', () => {
    render(
      <InvestigationStamp
        label="ÁN ĐÃ XONG"
        sublabel="BẰNG CHỨNG HỢP LỆ"
        variant="verified"
      />
    );
    expect(screen.getByText('ÁN ĐÃ XONG')).toBeInTheDocument();
    expect(screen.getByText(/BẰNG CHỨNG HỢP LỆ/)).toBeInTheDocument();
  });

  it('renders confidential variant correctly', () => {
    render(<InvestigationStamp variant="confidential" />);
    expect(screen.getByText('HỒ SƠ TUYỆT MẬT')).toBeInTheDocument();
    expect(screen.getByText(/CONFIDENTIAL/)).toBeInTheDocument();
  });

  it('disables animation when animated is false', () => {
    render(<InvestigationStamp animated={false} />);
    const stamp = screen.getByTestId('investigation-stamp');
    expect(stamp.className).not.toContain('animate-stamp');
  });
});

describe('EvidenceCard Component', () => {
  it('renders locked state correctly', () => {
    render(
      <EvidenceCard
        title="Dữ liệu giao dịch ngân hàng"
        status="locked"
        clueId="CLUE-04"
      />
    );
    expect(screen.getByText(/CLUE-04 • NIÊM PHONG/)).toBeInTheDocument();
    expect(screen.getByText('Chưa giải mật')).toBeInTheDocument();
  });

  it('renders verified state with clue details and tags', () => {
    render(
      <EvidenceCard
        title="Nhật ký giao dịch nghi vấn"
        clueId="EVID-09"
        status="verified"
        description="Phát hiện lệnh chuyển tiền 500 triệu lúc 02:00 sáng."
        tags={['Ngân Hàng', 'Giao Dịch Đêm']}
        dataSnippet="SELECT * FROM transactions WHERE amount > 500000000;"
      />
    );

    expect(screen.getByText(/EVID-09 • VẬT CHỨNG/)).toBeInTheDocument();
    expect(screen.getByText('Nhật ký giao dịch nghi vấn')).toBeInTheDocument();
    expect(screen.getByText(/500 triệu lúc 02:00 sáng/)).toBeInTheDocument();
    expect(screen.getByText('Ngân Hàng')).toBeInTheDocument();
    expect(screen.getByText('Giao Dịch Đêm')).toBeInTheDocument();
    expect(screen.getByText(/SELECT \* FROM transactions/)).toBeInTheDocument();
  });
});
