import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const submitMock = vi.hoisted(() => vi.fn());

vi.mock('../../services/index.js', async () => {
  const actual = await vi.importActual('../../services/index.js');
  return {
    ...actual,
    submissionService: {
      submit: submitMock,
      getSubmissionHistory: vi.fn(),
    },
  };
});

import { ExcelMissionPage } from './ExcelMissionPage.jsx';

const successResponse = {
  data: {
    attemptId: 'attempt-ui-001',
    isCorrect: true,
    score: 100,
    stepCompleted: true,
    missionCompleted: true,
    potentialXp: 100,
    feedbackCode: 'CORRECT_ANSWER',
    feedback: 'Chính xác! Công thức hợp lệ.',
  },
  error: null,
};

function renderMissionPage(missionId = 'mission-001') {
  return render(
    <MemoryRouter initialEntries={[`/missions/${missionId}/workspace`]}>
      <Routes>
        <Route path="/missions/:missionId/workspace" element={<ExcelMissionPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ExcelMissionPage Component Tests (LRN-EXCEL-002)', () => {
  beforeEach(() => {
    submitMock.mockReset();
    submitMock.mockResolvedValue(successResponse);
  });

  it('hiển thị thông tin vụ án, FormulaBar và bảng tính SpreadsheetGrid sau khi load thành công', async () => {
    renderMissionPage();

    // Kiểm tra loading state
    expect(screen.getByLabelText(/đang tải dữ liệu bài học/i)).toBeInTheDocument();

    // Chờ load thành công
    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Mã vụ án: mission-001/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bảng dữ liệu Doanh thu Bán hàng/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i })).toBeInTheDocument();
    expect(screen.getByText('Chuột máy tính không dây')).toBeInTheDocument();
  });

  it('tự động tính toán kết quả khi người dùng gõ công thức =C2*D2 vào FormulaBar', async () => {
    renderMissionPage();

    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.change(input, { target: { value: '=C2*D2' } });

    // Kiểm tra ô E2 tự động hiển thị kết quả 450.000 ₫
    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('450')).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('bật/tắt thanh gợi ý và thực hiện đặt lại bảng tính qua ActionToolbar (Step 3.3)', async () => {
    renderMissionPage();

    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Bấm mở bảng Gợi ý
    const hintBtn = screen.getByRole('button', { name: /Gợi ý/i });
    fireEvent.click(hintBtn);

    expect(screen.getByText(/Hệ thống Gợi ý Trinh thám/i)).toBeInTheDocument();

    // Bấm Đặt lại
    const resetBtn = screen.getByRole('button', { name: /Đặt lại/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText(/Đã đặt lại toàn bộ bảng tính/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('hiển thị ErrorState khi không tìm thấy missionId', async () => {
    renderMissionPage('invalid-id');

    await waitFor(() => {
      expect(screen.getByText(/Không tìm thấy mission "invalid-id"/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
  });

  it('submit đúng hiển thị success modal với potentialXp chưa được trao', async () => {
    renderMissionPage();

    await waitFor(() => {
      expect(screen.getByText(/Vì sao doanh thu tháng 3 giảm\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Chuột máy tính không dây/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Nhập công thức đúng
    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.change(input, { target: { value: '=C2*D2' } });

    await waitFor(() => {
      expect(input).toHaveValue('=C2*D2');
    });

    const submitBtn = screen.getByRole('button', { name: /Nộp bài vụ án/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Phá Án Thành Công/i)).toBeInTheDocument();
    expect(screen.getByText(/Chúc Mừng Trinh Thám!/i)).toBeInTheDocument();
    expect(screen.getByText(/Phần thưởng dự kiến: \+100 XP/i)).toBeInTheDocument();
    expect(submitMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'submit',
      missionId: 'mission-001',
      tool: 'excel',
    }));
  });

  it('validation rỗng hiển thị inline và không gọi service', async () => {
    renderMissionPage();
    await screen.findByText(/Vì sao doanh thu tháng 3 giảm\?/i);

    fireEvent.click(screen.getByRole('button', { name: /Nộp bài vụ án/i }));

    expect(screen.getByRole('status')).toHaveTextContent(/chưa nhập công thức/i);
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('incorrect answer hiển thị inline, giữ answer và không mở modal', async () => {
    submitMock.mockResolvedValueOnce({
      data: {
        attemptId: 'attempt-wrong',
        isCorrect: false,
        score: 0,
        stepCompleted: false,
        missionCompleted: false,
        potentialXp: 0,
        feedbackCode: 'INCORRECT_ANSWER',
        feedback: 'Công thức chưa chính xác.',
      },
      error: null,
    });
    renderMissionPage();
    await screen.findByText(/Vì sao doanh thu tháng 3 giảm\?/i);
    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.change(input, { target: { value: '=C2+D2' } });

    fireEvent.click(screen.getByRole('button', { name: /Nộp bài vụ án/i }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/chưa chính xác/i));
    expect(input).toHaveValue('=C2+D2');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('service error hiển thị Retry và retry thành công mà không mất answer', async () => {
    submitMock
      .mockResolvedValueOnce({
        data: null,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Dịch vụ tạm thời không khả dụng.',
          retryable: true,
        },
      })
      .mockResolvedValueOnce(successResponse);
    renderMissionPage();
    await screen.findByText(/Vì sao doanh thu tháng 3 giảm\?/i);
    const input = screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i });
    fireEvent.change(input, { target: { value: '=C2*D2' } });

    fireEvent.click(screen.getByRole('button', { name: /Nộp bài vụ án/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/tạm thời không khả dụng/i);
    expect(input).toHaveValue('=C2*D2');

    fireEvent.click(screen.getByRole('button', { name: /Thử nộp lại/i }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(submitMock).toHaveBeenCalledTimes(2);
  });

  it('chặn double submit trong khi request đang chạy', async () => {
    let resolveSubmit;
    submitMock.mockReturnValueOnce(new Promise((resolve) => {
      resolveSubmit = resolve;
    }));
    renderMissionPage();
    await screen.findByText(/Vì sao doanh thu tháng 3 giảm\?/i);
    fireEvent.change(
      screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i }),
      { target: { value: '=C2*D2' } }
    );
    const submitButton = screen.getByRole('button', { name: /Nộp bài vụ án/i });

    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    expect(submitMock).toHaveBeenCalledTimes(1);

    await act(async () => resolveSubmit(successResponse));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('không update state khi unmount giữa request', async () => {
    let resolveSubmit;
    submitMock.mockReturnValueOnce(new Promise((resolve) => {
      resolveSubmit = resolve;
    }));
    const { unmount } = renderMissionPage();
    await screen.findByText(/Vì sao doanh thu tháng 3 giảm\?/i);
    fireEvent.change(
      screen.getByRole('textbox', { name: /Thanh nhập công thức Excel/i }),
      { target: { value: '=C2*D2' } }
    );
    fireEvent.click(screen.getByRole('button', { name: /Nộp bài vụ án/i }));

    unmount();
    await act(async () => resolveSubmit(successResponse));
    expect(submitMock).toHaveBeenCalledTimes(1);
  });
});
