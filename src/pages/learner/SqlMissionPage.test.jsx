import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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
  it('loads briefing, schema and SqlEditor without exposing result viewer/submission', async () => {
    const engine = createEngine()
    renderPage({ workspaceService: { loadWorkspace: vi.fn().mockResolvedValue({ data: workspace, error: null }) }, engineFactory: () => engine })
    expect(screen.getByLabelText('Đang tải SQL mission')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Khám phá dữ liệu bán hàng')).toBeInTheDocument())
    expect(screen.getByTestId('schema-browser')).toBeInTheDocument()
    expect(screen.getByText('sales')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /khung soạn thảo câu lệnh sql/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nộp bài/i })).not.toBeInTheDocument()
    expect(engine.initialize).toHaveBeenCalledOnce()
    expect(engine.loadDataset).toHaveBeenCalledWith(workspace.dataset)
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
})
