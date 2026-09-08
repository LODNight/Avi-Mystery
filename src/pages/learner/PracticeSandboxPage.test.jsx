import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PracticeSandboxPage } from './PracticeSandboxPage.jsx';
import { knowledgeService, datasetService } from '../../services/index.js';

// Mock sqlEngine
vi.mock('../../utils/sql/index.js', () => ({
  createSqlEngine: vi.fn(() => ({
    initialize: vi.fn().mockResolvedValue({ ready: true, dialect: 'sqlite' }),
    loadDataset: vi.fn().mockResolvedValue({
      datasetId: 'sql-sales-v1',
      schema: {
        dialect: 'sqlite',
        tables: [
          {
            name: 'sales',
            columns: [
              { name: 'transaction_id', type: 'TEXT' },
              { name: 'product_name', type: 'TEXT' },
              { name: 'amount', type: 'INTEGER' },
            ],
          },
        ],
      },
    }),
    execute: vi.fn().mockResolvedValue({
      columns: ['transaction_id', 'product_name', 'amount'],
      rows: [['TX01', 'Laptop Pro 16', 28000000]],
      executionTimeMs: 12,
    }),
    dispose: vi.fn().mockResolvedValue(true),
  })),
}));

describe('PracticeSandboxPage Component Tests (Sprint 9.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.innerWidth = 1200;
  });

  const renderSandbox = (initialEntries = ['/sandbox']) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/sandbox" element={<PracticeSandboxPage />} />
          <Route path="/sandbox/:tool" element={<PracticeSandboxPage />} />
          <Route path="/sandbox/topic/:topicId" element={<PracticeSandboxPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('hiển thị đầy đủ thanh công cụ Sandbox, nút đổi công cụ và Cột Lý thuyết/Bảng tính', async () => {
    renderSandbox();

    expect(screen.getByText('Practice Sandbox')).toBeInTheDocument();
    expect(screen.getByText(/Try it Yourself/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Excel Formula/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SQL Query/i })).toBeInTheDocument();

    // Chờ tải danh sách bài học
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Hàm SUM - Tính Tổng/i })).toBeInTheDocument();
    });

    // Cột trái hiển thị bài học & các ví dụ thực hành
    expect(screen.getByText(/Ví dụ thực hành nhanh/i)).toBeInTheDocument();

    // Cột phải hiển thị thanh fx và bảng tính
    expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument();
    expect(screen.getByText(/Laptop Pro 16/i)).toBeInTheDocument();
  });

  it('chạy thử công thức Excel tự do và cập nhật kết quả tính toán', async () => {
    renderSandbox();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument();
    });

    const formulaInput = screen.getByPlaceholderText(/Nhập công thức/i);
    fireEvent.change(formulaInput, { target: { value: '=SUM(D2:D9)' } });

    // Click nút Chạy thử
    const runBtn = screen.getByRole('button', { name: /Chạy thử/i });
    fireEvent.click(runBtn);

    // Kiểm tra kết quả phản hồi thành công
    await waitFor(() => {
      expect(screen.getByText(/Công thức hợp lệ! Kết quả tại ô/i)).toBeInTheDocument();
    });
  });

  it('hỗ trợ chuyển đổi sang chế độ SQL Sandbox và thực thi truy vấn SQLite WASM', async () => {
    const { container } = renderSandbox();

    // Click tab SQL Query
    const sqlTabBtn = screen.getByRole('button', { name: /SQL Query/i });
    fireEvent.click(sqlTabBtn);

    // Trình soạn thảo SQL hiển thị
    const sqlTextarea = container.querySelector('#sql-query-editor');
    expect(sqlTextarea).toBeInTheDocument();

    // Thực thi câu lệnh SQL
    const runBtn = screen.getByRole('button', { name: /Chạy câu lệnh SQL/i });
    fireEvent.click(runBtn);

    // Kiểm tra kết quả trả về từ mock SQLite engine
    await waitFor(() => {
      expect(screen.getByText('Laptop Pro 16')).toBeInTheDocument();
      expect(screen.getByText('TX01')).toBeInTheDocument();
    });
  });

  it('áp dụng ví dụ mẫu ("Thử ngay") lập tức điền công thức/truy vấn vào editor và kích hoạt chạy', async () => {
    renderSandbox();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Hàm SUM - Tính Tổng/i })).toBeInTheDocument();
    });

    // Tìm các nút "Thử ngay" trong danh sách ví dụ mẫu
    const tryItButtons = screen.getAllByRole('button', { name: /Thử ngay/i });
    expect(tryItButtons.length).toBeGreaterThan(0);

    // Bấm nút "Thử ngay" đầu tiên
    fireEvent.click(tryItButtons[0]);

    // Kiểm tra công thức được kích hoạt và hiển thị thông báo thành công
    await waitFor(() => {
      expect(screen.getByText(/Công thức hợp lệ! Kết quả tại ô/i)).toBeInTheDocument();
    });
  });

  it('hỗ trợ đặt lại dữ liệu mẫu (Reset) về trạng thái ban đầu', async () => {
    renderSandbox();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Đặt lại mẫu/i })).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole('button', { name: /Đặt lại mẫu/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đã hoàn tác bảng tính về trạng thái mẫu ban đầu/i)).toBeInTheDocument();
    });
  });

  it('hỗ trợ điều hướng tuần tự qua các bài học với nút Bài tiếp theo', async () => {
    renderSandbox();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Hàm SUM - Tính Tổng/i })).toBeInTheDocument();
    });

    // Tìm nút "Bài tiếp theo"
    const nextBtn = screen.getByRole('button', { name: /Bài tiếp theo/i });
    expect(nextBtn).toBeInTheDocument();

    fireEvent.click(nextBtn);

    // Chuyển sang bài tiếp theo (Hàm AVERAGE & COUNT - Thống Kê Cơ Bản)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^Hàm AVERAGE & COUNT - Thống Kê/i })).toBeInTheDocument();
    });
  });

  describe('Verification Matrix (TC01 - TC20 & Performance)', () => {
    beforeEach(() => {
      Element.prototype.getBoundingClientRect = vi.fn(() => ({
        top: 100,
        left: 100,
        width: 150,
        height: 30,
        bottom: 130,
        right: 250,
      }));
    });

    it('TC01 — Double-click enters EDITING with active cell draft value', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      // Ô F2 có công thức ban đầu =D2*E2
      const f2Cell = container.querySelector('[data-cell-addr="F2"]');
      expect(f2Cell).toBeInTheDocument();

      fireEvent.doubleClick(f2Cell);

      const overlay = screen.getByTestId('cell-editor-overlay');
      expect(overlay).toBeInTheDocument();
      const input = overlay.querySelector('input');
      expect(input.value).toBe('=D2*E2');
    });

    it('TC02 & TC03 — Typing updates draft and synchronizes bidirectionally between Cell Editor and Formula Bar', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const overlay = screen.getByTestId('cell-editor-overlay');
      const cellInput = overlay.querySelector('input');
      const formulaBarInput = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });

      // Gõ từ Cell Editor Overlay
      fireEvent.change(cellInput, { target: { value: '=SUM(D2:D8)' } });
      expect(cellInput.value).toBe('=SUM(D2:D8)');
      expect(formulaBarInput.value).toBe('=SUM(D2:D8)');

      // Gõ tiếp từ Formula Bar
      fireEvent.change(formulaBarInput, { target: { value: '=SUM(D2:D8)+100' } });
      expect(cellInput.value).toBe('=SUM(D2:D8)+100');
      expect(formulaBarInput.value).toBe('=SUM(D2:D8)+100');
    });

    it('TC04, TC13 & TC14 — Enter commits valid formula, closes session, and moves selection downward', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const overlay = screen.getByTestId('cell-editor-overlay');
      const cellInput = overlay.querySelector('input');

      fireEvent.change(cellInput, { target: { value: '=SUM(D2:D4)' } });
      fireEvent.keyDown(cellInput, { key: 'Enter' });

      // Session kết thúc trở về IDLE
      expect(screen.queryByTestId('cell-editor-overlay')).not.toBeInTheDocument();
      expect(screen.getByText(/Công thức hợp lệ! Kết quả tại ô \[D10\]/i)).toBeInTheDocument();

      // TC14: Enter di chuyển selection xuống ô bên dưới (D11)
      const formulaBar = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
      expect(screen.getByText('D11')).toBeInTheDocument();
    });

    it('TC05, TC10, TC11 & TC16 — Escape cancels editing, restores original value, does not move selection', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      const originalText = d10Cell.textContent;

      fireEvent.doubleClick(d10Cell);
      const overlay = screen.getByTestId('cell-editor-overlay');
      const cellInput = overlay.querySelector('input');

      // TC11: Committed value trong cell không bị mutate khi đang gõ draft
      fireEvent.change(cellInput, { target: { value: '=MODIFIED_TEMP_FORMULA()' } });
      expect(d10Cell.textContent).toBe(originalText);

      // Nhấn Escape
      fireEvent.keyDown(cellInput, { key: 'Escape' });

      // TC05 & TC10: Session đóng, giá trị gốc giữ nguyên
      expect(screen.queryByTestId('cell-editor-overlay')).not.toBeInTheDocument();
      expect(d10Cell.textContent).toBe(originalText);

      // TC16: Selection không bị dịch chuyển (vẫn ở D10)
      expect(screen.getByText('D10')).toBeInTheDocument();
    });

    it('TC06 & TC17 — Invalid formula remains in EDITING with error styling, draft and focus preserved', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const overlay = screen.getByTestId('cell-editor-overlay');
      const cellInput = overlay.querySelector('input');

      fireEvent.change(cellInput, { target: { value: '=SUM(' } });
      fireEvent.keyDown(cellInput, { key: 'Enter' });

      // Session vẫn ở EDITING, overlay vẫn hiển thị và viền đỏ
      expect(screen.getByTestId('cell-editor-overlay')).toBeInTheDocument();
      expect(overlay).toHaveClass('border-rose-500');
      expect(cellInput.value).toBe('=SUM(');
      expect(screen.getByText(/Lỗi công thức:/i)).toBeInTheDocument();
    });

    it('TC07 — Clicking another cell commits current cell before switching when valid', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const cellInput = screen.getByTestId('cell-editor-overlay').querySelector('input');
      fireEvent.change(cellInput, { target: { value: '=SUM(D2:D4)' } });

      // Click sang ô A2
      const a2Cell = container.querySelector('[data-cell-addr="A2"]');
      fireEvent.click(a2Cell);

      // D10 được commit thành công, session đóng, A2 trở thành selectedCell
      expect(screen.queryByTestId('cell-editor-overlay')).not.toBeInTheDocument();
      expect(screen.getByText(/Công thức hợp lệ! Kết quả tại ô \[D10\]/i)).toBeInTheDocument();
      expect(screen.getByText('A2')).toBeInTheDocument();
    });

    it('TC08 — Invalid current cell prevents cell switching and keeps editing active', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const cellInput = screen.getByTestId('cell-editor-overlay').querySelector('input');
      fireEvent.change(cellInput, { target: { value: '=SUM(' } });

      // Click sang ô A2
      const a2Cell = container.querySelector('[data-cell-addr="A2"]');
      fireEvent.click(a2Cell);

      // Commit thất bại: ô A2 KHÔNG được chọn, D10 vẫn được chọn và overlay vẫn giữ nguyên
      expect(screen.getByTestId('cell-editor-overlay')).toBeInTheDocument();
      expect(screen.getByText('D10')).toBeInTheDocument();
      expect(cellInput.value).toBe('=SUM(');
    });

    it('TC09 — Formula Bar focus does not terminate editing', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const formulaBarInput = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
      fireEvent.focus(formulaBarInput);

      // Overlay vẫn còn mở
      expect(screen.getByTestId('cell-editor-overlay')).toBeInTheDocument();
    });

    it('TC12 — Editing session starts from selected cell when typing in Formula Bar while IDLE', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      // Chọn ô B2
      const b2Cell = container.querySelector('[data-cell-addr="B2"]');
      fireEvent.click(b2Cell);
      expect(screen.getByText('B2')).toBeInTheDocument();

      const formulaBarInput = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
      fireEvent.change(formulaBarInput, { target: { value: '=TEXT_TEST' } });

      // B2 bước vào EDITING và overlay mở tại B2
      expect(screen.getByTestId('cell-editor-overlay')).toBeInTheDocument();
      const cellInput = screen.getByTestId('cell-editor-overlay').querySelector('input');
      expect(cellInput.value).toBe('=TEXT_TEST');
    });

    it('TC15 — Tab moves selection right after successful commit', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const cellInput = screen.getByTestId('cell-editor-overlay').querySelector('input');
      fireEvent.change(cellInput, { target: { value: '=SUM(D2:D4)' } });
      fireEvent.keyDown(cellInput, { key: 'Tab' });

      // Session kết thúc, selection chuyển từ D10 sang E10
      expect(screen.queryByTestId('cell-editor-overlay')).not.toBeInTheDocument();
      expect(screen.getByText('E10')).toBeInTheDocument();
    });

    it('TC18 — Long formula remains readable with max-content width', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const cellInput = screen.getByTestId('cell-editor-overlay').querySelector('input');
      const longFormula =
        '=IF(AND(SUM(A1:A20)>100,AVERAGE(B1:B20)>50,COUNTIF(C1:C20,"Completed")>5),ROUND(SUM(D1:D20)*1.15,2),"Review")';
      fireEvent.change(cellInput, { target: { value: longFormula } });

      expect(cellInput.value).toBe(longFormula);
      expect(cellInput.style.width).toBe('max-content');
    });

    it('TC19 — CellEditorOverlay is portalled into grid container for synchronized scrolling', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const overlay = screen.getByTestId('cell-editor-overlay');
      const scrollContainer = container.querySelector('.overflow-auto');

      // Overlay được portal vào trong scrollContainer
      expect(scrollContainer).toContainElement(overlay);
    });

    it('Performance Verification — Typing does NOT cause SpreadsheetGrid re-renders', async () => {
      const { container } = renderSandbox();
      await waitFor(() => expect(screen.getByPlaceholderText(/Nhập công thức/i)).toBeInTheDocument());

      // Kích hoạt editing
      const d10Cell = container.querySelector('[data-cell-addr="D10"]');
      fireEvent.doubleClick(d10Cell);

      const initialGridRenders = window.__SPREADSHEET_GRID_RENDER_COUNT__;
      const cellInput = screen.getByTestId('cell-editor-overlay').querySelector('input');

      // Gõ liên tiếp 10 ký tự
      for (let i = 0; i < 10; i++) {
        fireEvent.change(cellInput, { target: { value: `=SUM(D2:D${i})` } });
      }

      const postTypingGridRenders = window.__SPREADSHEET_GRID_RENDER_COUNT__;

      // SpreadsheetGrid KHÔNG re-render thêm bất kỳ lần nào khi gõ draft!
      expect(postTypingGridRenders - initialGridRenders).toBe(0);
    });
  });
});

