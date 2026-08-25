import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SqlMissionPage } from './SqlMissionPage.jsx'

const workspace = {
  mission: { id: 'mission-010', title: 'Khám phá dữ liệu bán hàng', story: 'Bối cảnh SQL.', objective: 'Xem bảng sales.', estimatedDuration: 15, rewardXp: 100 },
  dataset: { id: 'sql-sales-v1' },
}
const schema = { tables: [{ name: 'sales', columns: [{ name: 'id', type: 'INTEGER', primaryKey: true, nullable: false }], sampleRows: [[1]] }] }

function createEngine() {
  return {
    initialize: vi.fn().mockResolvedValue({ ready: true }),
    loadDataset: vi.fn().mockResolvedValue({}),
    getSchema: vi.fn().mockResolvedValue(schema),
    execute: vi.fn().mockResolvedValue({
      columns: ['id', 'amount'],
      rows: [[1, 100], [2, 250]],
      rowCount: 2,
      truncated: false,
      executionMs: 4,
      errorCode: null,
      message: null,
    }),
    dispose: vi.fn().mockResolvedValue({ disposed: true }),
  }
}

function renderPage(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/missions/mission-010/sql']}>
      <Routes><Route path="/missions/:missionId/sql" element={<SqlMissionPage {...props} />} /></Routes>
    </MemoryRouter>
  )
}

describe('SqlMissionPage', () => {
  it('loads briefing, schema and SqlEditor with ResultViewer idle state', async () => {
    const engine = createEngine()
    renderPage({ workspaceService: { loadWorkspace: vi.fn().mockResolvedValue({ data: workspace, error: null }) }, engineFactory: () => engine })
    expect(screen.getByLabelText('Đang tải SQL mission')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Khám phá dữ liệu bán hàng')).toBeInTheDocument())
    expect(screen.getByTestId('schema-browser')).toBeInTheDocument()
    expect(screen.getByText('sales')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /khung soạn thảo câu lệnh sql/i })).toBeInTheDocument()
    expect(screen.getByText('Chưa có kết quả truy vấn')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nộp bài/i })).not.toBeInTheDocument()
    expect(engine.initialize).toHaveBeenCalledOnce()
    expect(engine.loadDataset).toHaveBeenCalledWith(workspace.dataset)
  })

  it('executes query when clicking Run Query button and displays results', async () => {
    const engine = createEngine()
    renderPage({ workspaceService: { loadWorkspace: vi.fn().mockResolvedValue({ data: workspace, error: null }) }, engineFactory: () => engine })
    await waitFor(() => expect(screen.getByText('Khám phá dữ liệu bán hàng')).toBeInTheDocument())

    const runBtn = screen.getByRole('button', { name: /chạy câu lệnh sql/i })
    fireEvent.click(runBtn)

    await waitFor(() => expect(screen.getByText('Thành công')).toBeInTheDocument())
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(engine.execute).toHaveBeenCalledOnce()
  })

  it('submits query and opens MissionResultModal when answer is correct', async () => {
    const engine = createEngine()
    const subService = {
      submit: vi.fn().mockResolvedValue({
        data: {
          attemptId: 'attempt-001',
          isCorrect: true,
          stepCompleted: true,
          missionCompleted: true,
          potentialXp: 100,
          feedbackCode: 'SUCCESS',
          feedback: 'Kết quả hoàn toàn chính xác!',
        },
        error: null,
      }),
    }

    renderPage({
      workspaceService: { loadWorkspace: vi.fn().mockResolvedValue({ data: workspace, error: null }) },
      engineFactory: () => engine,
      subService,
    })
    await waitFor(() => expect(screen.getByText('Khám phá dữ liệu bán hàng')).toBeInTheDocument())

    // First run the query so submit button is visible
    fireEvent.click(screen.getByRole('button', { name: /chạy câu lệnh sql/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /nộp bài vụ án/i })).toBeInTheDocument())

    // Now click submit button
    fireEvent.click(screen.getByRole('button', { name: /nộp bài vụ án/i }))

    await waitFor(() => expect(screen.getByText('Chúc Mừng Trinh Thám!')).toBeInTheDocument())
    expect(screen.getByText('Phần thưởng dự kiến: +100 XP')).toBeInTheDocument()
    expect(subService.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'submit',
        missionId: 'mission-010',
        tool: 'sql',
      })
    )
  })

  it('displays inline alert feedback when submission is incorrect', async () => {
    const engine = createEngine()
    const subService = {
      submit: vi.fn().mockResolvedValue({
        data: {
          attemptId: 'attempt-002',
          isCorrect: false,
          stepCompleted: false,
          missionCompleted: false,
          potentialXp: 0,
          feedbackCode: 'SQL_MISSING_REQUIRED_CONSTRUCT',
          feedback: 'Câu truy vấn của bạn còn thiếu từ khóa WHERE.',
        },
        error: null,
      }),
    }

    renderPage({
      workspaceService: { loadWorkspace: vi.fn().mockResolvedValue({ data: workspace, error: null }) },
      engineFactory: () => engine,
      subService,
    })
    await waitFor(() => expect(screen.getByText('Khám phá dữ liệu bán hàng')).toBeInTheDocument())

    // Run query
    fireEvent.click(screen.getByRole('button', { name: /chạy câu lệnh sql/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /nộp bài vụ án/i })).toBeInTheDocument())

    // Submit query
    fireEvent.click(screen.getByRole('button', { name: /nộp bài vụ án/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText('Chưa chính xác:')).toBeInTheDocument()
    expect(screen.getByText('Câu truy vấn của bạn còn thiếu từ khóa WHERE.')).toBeInTheDocument()
  })

  it('shows retryable service errors and disposes the engine on unmount', async () => {
    const engine = createEngine()
    const service = { loadWorkspace: vi.fn().mockResolvedValue({ data: null, error: { message: 'Không tải được', retryable: true } }) }
    const view = renderPage({ workspaceService: service, engineFactory: () => engine })
    await waitFor(() => expect(screen.getByText('Không tải được')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
    view.unmount()
    expect(engine.dispose).not.toHaveBeenCalled()
  })

  it('disposes a loaded engine when leaving the mission', async () => {
    const engine = createEngine()
    const view = renderPage({ workspaceService: { loadWorkspace: vi.fn().mockResolvedValue({ data: workspace, error: null }) }, engineFactory: () => engine })
    await waitFor(() => expect(screen.getByTestId('schema-browser')).toBeInTheDocument())
    view.unmount()
    await waitFor(() => expect(engine.dispose).toHaveBeenCalledOnce())
  })

  it('disposes previous engine and initializes fresh dataset when switching missions', async () => {
    const engine1 = createEngine()
    const engine2 = createEngine()
    const engines = [engine1, engine2]

    const workspace2 = {
      mission: { id: 'mission-011', title: 'Phân tích E-commerce', story: 'Bối cảnh Commerce.', objective: 'Xem bảng orders.', estimatedDuration: 20, rewardXp: 150 },
      dataset: { id: 'sql-commerce-v1' },
    }

    const loadWorkspace = vi.fn().mockImplementation((id) => {
      if (id === 'mission-010') return Promise.resolve({ data: workspace, error: null })
      return Promise.resolve({ data: workspace2, error: null })
    })

    const { rerender } = render(
      <MemoryRouter initialEntries={['/missions/mission-010/sql']}>
        <Routes>
          <Route
            path="/missions/:missionId/sql"
            element={<SqlMissionPage workspaceService={{ loadWorkspace }} engineFactory={() => engines.shift()} />}
          />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Khám phá dữ liệu bán hàng')).toBeInTheDocument())
    expect(engine1.loadDataset).toHaveBeenCalledWith(workspace.dataset)

    // Re-render with mission-011 route
    rerender(
      <MemoryRouter key="mission-011" initialEntries={['/missions/mission-011/sql']}>
        <Routes>
          <Route
            path="/missions/:missionId/sql"
            element={<SqlMissionPage workspaceService={{ loadWorkspace }} engineFactory={() => engines.shift()} />}
          />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(engine1.dispose).toHaveBeenCalledOnce())
    await waitFor(() => expect(screen.getByText('Phân tích E-commerce')).toBeInTheDocument())
    expect(engine2.loadDataset).toHaveBeenCalledWith(workspace2.dataset)
  })
})
