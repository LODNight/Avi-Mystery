import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AcademyExamPage } from './AcademyExamPage.jsx';
import { academyExamService } from '../../services/index.js';
import { storage } from '../../utils/storage.js';

// Mock useAuth
vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-learner-1', uid: 'test-learner-1', name: 'Thám Tử Sherlock', displayName: 'Thám Tử Sherlock' },
  })),
}));

describe('AcademyExamPage Tests (Sprint 9.5 — Step 9.5.3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    storage.clear();
  });

  const renderExam = (courseSlug = 'excel-academy') => {
    return render(
      <MemoryRouter initialEntries={[`/academy/${courseSlug}/exam`]}>
        <Routes>
          <Route path="/academy/:courseSlug/exam" element={<AcademyExamPage />} />
          <Route path="/academy/:courseSlug" element={<div>Trang Khóa Học</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('1. Hiển thị đúng màn hình giới thiệu kỳ thi, quy chế và nút bắt đầu', () => {
    renderExam('excel-academy');

    expect(screen.getByRole('heading', { level: 1, name: /Kỳ Thi Sát Hạch & Cấp Chứng Chỉ Tốt Nghiệp/i })).toBeInTheDocument();
    expect(screen.getByText(/10 câu/i)).toBeInTheDocument();
    expect(screen.getByText(/15 phút/i)).toBeInTheDocument();
    expect(screen.getByText(/≥ 80%/i)).toBeInTheDocument();
    expect(screen.getByText(/\+100 XP/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bắt đầu làm bài thi/i })).toBeInTheDocument();
  });

  it('2. Bắt đầu làm bài thi và chuyển câu hỏi bằng nút điều hướng & thanh chuyển câu', () => {
    renderExam('excel-academy');

    // Click Bắt đầu làm bài thi
    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu làm bài thi/i }));

    // Hiển thị câu hỏi 1
    expect(screen.getByText(/Câu 1 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/Trong Excel, công thức nào dưới đây tính tổng các ô từ A2 đến A10/i)).toBeInTheDocument();

    // Chọn đáp án A: =SUM(A2:A10)
    const optionA = screen.getByRole('button', { name: /A =SUM\(A2:A10\)/i });
    fireEvent.click(optionA);

    // Chuyển sang câu tiếp
    const nextBtn = screen.getByRole('button', { name: /Câu tiếp/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Câu 2 \/ 10/i)).toBeInTheDocument();

    // Dùng thanh chuyển câu (jumper) bấm quay lại câu 1
    const chip1 = screen.getByRole('button', { name: '1' });
    fireEvent.click(chip1);

    expect(screen.getByText(/Câu 1 \/ 10/i)).toBeInTheDocument();
  });

  it('3. Nộp bài thi đạt chuẩn (≥ 80%) hiển thị chúc mừng và mở chứng chỉ tốt nghiệp', async () => {
    const exam = academyExamService.getExam('excel-academy').data;
    
    // Đáp án chuẩn 10/10
    const perfectAnswers = {};
    exam.questions.forEach((q) => {
      perfectAnswers[q.id] = q.correctIndex;
    });

    const submitSpy = vi.spyOn(academyExamService, 'submitExam').mockResolvedValue({
      data: {
        courseSlug: 'excel-academy',
        learnerId: 'test-learner-1',
        scorePercent: 100,
        totalCorrect: 10,
        totalQuestions: 10,
        isPassed: true,
        grade: 'Xuất Sắc (High Distinction)',
        timeSpentSeconds: 120,
        rewardXp: 100,
        certificate: {
          id: 'AVI-EXCEL-CERT-TEST',
          certificateId: 'AVI-EXCEL-CERT-TEST',
          courseSlug: 'excel-academy',
          courseTitle: 'Excel Chuyên Sâu Cho Phân Tích Dữ Liệu',
          learnerName: 'Thám Tử Sherlock',
          scorePercent: 100,
          grade: 'Xuất Sắc (High Distinction)',
          issuedAt: new Date().toISOString(),
        },
        questionResults: exam.questions.map((q) => ({
          questionId: q.id,
          category: q.category,
          text: q.text,
          options: q.options,
          selectedIndex: q.correctIndex,
          correctIndex: q.correctIndex,
          isCorrect: true,
          explanation: q.explanation,
        })),
      },
      error: null,
    });

    renderExam('excel-academy');

    // Bắt đầu thi
    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu làm bài thi/i }));

    // Bấm Nộp bài thi
    fireEvent.click(screen.getByRole('button', { name: /Nộp bài thi/i }));

    // Hộp thoại xác nhận xuất hiện
    expect(screen.getByText(/Xác nhận nộp bài thi/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận nộp bài/i });
    fireEvent.click(confirmBtn);

    // Chờ màn hình kết quả
    await waitFor(() => {
      expect(screen.getByText(/🎉 Chúc Mừng! Bạn Đã Xuất Sắc Vượt Qua Kỳ Thi/i)).toBeInTheDocument();
      expect(screen.getAllByText(/100%/i).length).toBeGreaterThanOrEqual(1);
    });

    // Màn hình chứng chỉ mở tự động hoặc khi bấm nút
    await waitFor(() => {
      expect(screen.getAllByText(/Chứng Nhận Tốt Nghiệp/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Thám Tử Sherlock/i)).toBeInTheDocument();
      expect(screen.getByText(/AVI-EXCEL-CERT-TEST/i)).toBeInTheDocument();
    });
  });

  it('4. Nộp bài thi không đạt chuẩn (< 80%) hiển thị thông báo thi lại và giải thích', async () => {
    const exam = academyExamService.getExam('excel-academy').data;

    vi.spyOn(academyExamService, 'submitExam').mockResolvedValue({
      data: {
        courseSlug: 'excel-academy',
        learnerId: 'test-learner-1',
        scorePercent: 50,
        totalCorrect: 5,
        totalQuestions: 10,
        isPassed: false,
        grade: 'Chưa Đạt',
        timeSpentSeconds: 150,
        rewardXp: 0,
        certificate: null,
        questionResults: exam.questions.map((q, idx) => ({
          questionId: q.id,
          category: q.category,
          text: q.text,
          options: q.options,
          selectedIndex: idx < 5 ? q.correctIndex : (q.correctIndex === 0 ? 1 : 0),
          correctIndex: q.correctIndex,
          isCorrect: idx < 5,
          explanation: q.explanation,
        })),
      },
      error: null,
    });

    renderExam('excel-academy');

    fireEvent.click(screen.getByRole('button', { name: /Bắt đầu làm bài thi/i }));
    fireEvent.click(screen.getByRole('button', { name: /Nộp bài thi/i }));
    fireEvent.click(screen.getByRole('button', { name: /Xác nhận nộp bài/i }));

    await waitFor(() => {
      expect(screen.getByText(/Rất Tiếc! Bạn Chưa Đạt Điểm Chuẩn/i)).toBeInTheDocument();
      expect(screen.getAllByText(/50%/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByRole('button', { name: /Thi lại bài này/i })).toBeInTheDocument();
      expect(screen.getByText(/Chi Tiết Đáp Án & Giải Thích Từng Câu/i)).toBeInTheDocument();
    });
  });

  it('5. academyExamService xử lý chấm điểm, lưu storage và cấp chứng chỉ chuẩn xác', async () => {
    const exam = academyExamService.getExam('sql-academy').data;
    expect(exam).toBeDefined();
    expect(exam.questions.length).toBe(10);

    const answers = {};
    // 8 câu đúng -> 80% (Pass)
    exam.questions.forEach((q, idx) => {
      answers[q.id] = idx < 8 ? q.correctIndex : (q.correctIndex === 0 ? 1 : 0);
    });

    const result = await academyExamService.submitExam({
      learnerId: 'test-learner-sql',
      learnerName: 'Nguyễn Văn SQL',
      courseSlug: 'sql-academy',
      answers,
      timeSpentSeconds: 200,
    });

    expect(result.data.isPassed).toBe(true);
    expect(result.data.scorePercent).toBe(80);
    expect(result.data.totalCorrect).toBe(8);
    expect(result.data.certificate).toBeDefined();
    expect(result.data.certificate.certificateId).toMatch(/^AVI-SQL-CERT-/);

    // Kiểm tra lưu vào storage
    const storedCerts = academyExamService.getLearnerCertificates('test-learner-sql').data;
    expect(storedCerts.length).toBe(1);
    expect(storedCerts[0].learnerName).toBe('Nguyễn Văn SQL');
    expect(storedCerts[0].scorePercent).toBe(80);
  });
});
