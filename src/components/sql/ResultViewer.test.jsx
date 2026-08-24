import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultViewer, mapSqlErrorMessage } from './ResultViewer.jsx';

describe('ResultViewer Component', () => {
  it('1. Hiển thị trạng thái chờ (Idle state) khi chưa có kết quả', () => {
    render(<ResultViewer result={null} isExecuting={false} />);
    expect(screen.getByText('Chưa có kết quả truy vấn')).toBeInTheDocument();
    expect(screen.getByText(/Ctrl \+ Enter/i)).toBeInTheDocument();
  });

  it('2. Hiển thị trạng thái đang thực thi (Loading state) khi isExecuting = true', () => {
    render(<ResultViewer result={null} isExecuting={true} />);
    const busyContainer = screen.getByLabelText('Đang thực thi câu lệnh SQL');
    expect(busyContainer).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Đang thực thi truy vấn SQL...')).toBeInTheDocument();
  });

  it('3. Hiển thị thông báo lỗi khi result chứa errorCode', () => {
    const errorResult = {
      columns: [],
      rows: [],
      rowCount: 0,
      executionMs: 12,
      errorCode: 'SQL_SYNTAX_ERROR',
      message: 'near "FORM": syntax error',
    };

    render(<ResultViewer result={errorResult} isExecuting={false} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('SQL_SYNTAX_ERROR')).toBeInTheDocument();
    expect(
      screen.getByText(/Cú pháp câu lệnh SQL chưa chính xác/i)
    ).toBeInTheDocument();
  });

  it('4. Map các mã lỗi chuẩn sang tiếng Việt chính xác', () => {
    expect(mapSqlErrorMessage('SQL_READ_ONLY_VIOLATION')).toContain('chỉ hỗ trợ câu lệnh đọc dữ liệu');
    expect(mapSqlErrorMessage('SQL_MULTIPLE_STATEMENTS')).toContain('chỉ nhập và thực thi một câu lệnh');
    expect(mapSqlErrorMessage('SQL_TIMEOUT')).toContain('Thời gian thực thi quá 2000ms');
  });

  it('5. Hiển thị bảng dữ liệu thành công với các cột, dòng và thời gian thực thi', () => {
    const successResult = {
      columns: ['id', 'name', 'status'],
      rows: [
        [1, 'Alice', 'active'],
        [2, 'Bob', 'pending'],
      ],
      rowCount: 2,
      truncated: false,
      executionMs: 5,
    };

    render(<ResultViewer result={successResult} isExecuting={false} />);
    expect(screen.getByText('Thành công')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // rowCount
    expect(screen.getByText(/5 ms/i)).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('6. Định dạng ô NULL chính xác với văn bản nghiêng', () => {
    const nullResult = {
      columns: ['id', 'email'],
      rows: [[1, null]],
      rowCount: 1,
      executionMs: 3,
    };

    render(<ResultViewer result={nullResult} isExecuting={false} />);
    const nullBadge = screen.getByText('NULL');
    expect(nullBadge).toBeInTheDocument();
    expect(nullBadge.tagName.toLowerCase()).toBe('span');
  });

  it('7. Hiển thị badge cảnh báo khi kết quả bị cắt bớt (truncated)', () => {
    const truncatedResult = {
      columns: ['id'],
      rows: Array.from({ length: 500 }, (_, i) => [i + 1]),
      rowCount: 500,
      truncated: true,
      executionMs: 45,
    };

    render(<ResultViewer result={truncatedResult} isExecuting={false} />);
    expect(screen.getByText('Đã giới hạn 500 dòng')).toBeInTheDocument();
  });

  it('8. Hiển thị màn hình rỗng khi truy vấn thành công nhưng không có dòng dữ liệu nào', () => {
    const emptyResult = {
      columns: ['id', 'name'],
      rows: [],
      rowCount: 0,
      executionMs: 2,
    };

    render(<ResultViewer result={emptyResult} isExecuting={false} />);
    expect(screen.getByText('Không có dữ liệu trả về')).toBeInTheDocument();
  });

  it('9. Hỗ trợ phân trang khi số lượng dòng vượt quá 50', () => {
    const manyRowsResult = {
      columns: ['id'],
      rows: Array.from({ length: 60 }, (_, i) => [`Row ${i + 1}`]),
      rowCount: 60,
      executionMs: 10,
    };

    render(<ResultViewer result={manyRowsResult} isExecuting={false} />);
    expect(screen.getByText('Row 1')).toBeInTheDocument();
    expect(screen.queryByText('Row 55')).not.toBeInTheDocument();

    // Chuyển sang trang 2
    const nextBtn = screen.getByRole('button', { name: /Sau/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Row 55')).toBeInTheDocument();
    expect(screen.getByText('Trang 2 / 2')).toBeInTheDocument();
  });

  it('10. Hiển thị nút "Nộp bài vụ án" và gọi callback onSubmit khi người dùng click', () => {
    const onSubmitMock = vi.fn();
    const successResult = {
      columns: ['id'],
      rows: [[1]],
      rowCount: 1,
      executionMs: 3,
    };

    render(<ResultViewer result={successResult} isExecuting={false} onSubmit={onSubmitMock} />);
    const submitBtn = screen.getByRole('button', { name: /Nộp bài vụ án/i });
    expect(submitBtn).toBeInTheDocument();

    fireEvent.click(submitBtn);
    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('11. Căn phải dữ liệu số và định dạng dấu phân cách hàng nghìn (12,500,000)', () => {
    const numberResult = {
      columns: ['order_id', 'revenue'],
      rows: [[101, 12500000]],
      rowCount: 1,
      executionMs: 4,
    };

    render(<ResultViewer result={numberResult} isExecuting={false} />);
    const formattedNumCell = screen.getByText('12,500,000');
    expect(formattedNumCell).toBeInTheDocument();
    expect(formattedNumCell.closest('td')).toHaveClass('text-right');
  });

  it('12. Giữ nguyên hoa/thường (casing) của tên cột header', () => {
    const mixedCaseResult = {
      columns: ['order_id', 'REVENUE', 'CustomerName'],
      rows: [[1, 500, 'Alice']],
      rowCount: 1,
      executionMs: 2,
    };

    render(<ResultViewer result={mixedCaseResult} isExecuting={false} />);
    expect(screen.getByText('order_id')).toBeInTheDocument();
    expect(screen.getByText('REVENUE')).toBeInTheDocument();
    expect(screen.getByText('CustomerName')).toBeInTheDocument();
  });
});

