import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataProcessingWorkspace } from './DataProcessingWorkspace.jsx';
import { FINDING_TYPES } from '../../../domain/investigation/findingModel.js';
import { investigationStateService } from '../../../services/investigationSessionService.js';

describe('DataProcessingWorkspace Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const mockStepConfig = {
    id: 'step-04',
    caseId: 'case-001',
    chapterId: 'chapter-01',
    location: 'Phòng Máy Chủ',
    investigationQuestion: 'Ai đã truy cập kho lúc 17:24 ngày 12/05/2026?',
    context: {
      narrative: 'Hệ thống quẹt thẻ ghi nhận có lượt mở cửa bất thường ngoài giờ làm việc.',
      location: 'Phòng Máy Chủ',
    },
    processor: 'sql',
    dataSources: [
      {
        id: 'src-access-logs',
        tableName: 'access_logs',
        title: 'Nhật Ký Quẹt Thẻ',
        type: 'table',
        dataset: {
          schema: [
            { name: 'id', type: 'integer', isPrimaryKey: true },
            { name: 'employee_name', type: 'string' },
            { name: 'badge_id', type: 'string' },
            { name: 'access_time', type: 'string' },
          ],
          rows: [
            { id: 1, employee_name: 'Bình An', badge_id: 'BDG-042', access_time: '17:24:00' },
            { id: 2, employee_name: 'Lê Hoa', badge_id: 'BDG-019', access_time: '18:05:00' },
          ],
        },
      },
    ],
  };

  const createMockEngine = (overrides = {}) => {
    return () => ({
      initialize: vi.fn().mockResolvedValue({ ready: true, dialect: 'sqlite' }),
      loadDataset: vi.fn().mockResolvedValue({ success: true }),
      getSchema: vi.fn().mockResolvedValue({
        dialect: 'sqlite',
        tables: [
          {
            name: 'access_logs',
            columns: [
              { name: 'id', type: 'INTEGER' },
              { name: 'employee_name', type: 'TEXT' },
              { name: 'badge_id', type: 'TEXT' },
              { name: 'access_time', type: 'TEXT' },
            ],
          },
        ],
      }),
      execute: vi.fn().mockResolvedValue({
        columns: ['id', 'employee_name', 'badge_id', 'access_time'],
        rows: [[1, 'Bình An', 'BDG-042', '17:24:00']],
        rowCount: 1,
        executionTimeMs: 6,
      }),
      dispose: vi.fn().mockResolvedValue(true),
      ...overrides,
    });
  };

  it('1. renders Step context, location, and investigation question prominently', async () => {
    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
      />
    );

    // Question is visible
    expect(screen.getByText('Ai đã truy cập kho lúc 17:24 ngày 12/05/2026?')).toBeInTheDocument();
    // Step tag is visible
    expect(screen.getByText('STEP-04')).toBeInTheDocument();
    // Location is visible
    expect(screen.getByText('Phòng Máy Chủ')).toBeInTheDocument();
    // Context narrative
    expect(screen.getByText(/lượt mở cửa bất thường/i)).toBeInTheDocument();
  });

  it('2. renders Data Explorer with tables, columns and row counts', async () => {
    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
      />
    );

    // Table name is visible in Explorer
    expect(screen.getByRole('button', { name: /access_logs/i })).toBeInTheDocument();
    // Row count badge
    expect(screen.getAllByText(/2 dòng|2 rows/i).length).toBeGreaterThanOrEqual(1);
    // Columns are rendered
    expect(screen.getByText('employee_name')).toBeInTheDocument();
    expect(screen.getByText('badge_id')).toBeInTheDocument();
  });

  it('3. filters tables in Data Explorer when typing in search input', async () => {
    const multiTableStep = {
      ...mockStepConfig,
      dataSources: [
        mockStepConfig.dataSources[0],
        {
          id: 'src-employees',
          tableName: 'employees',
          title: 'Danh Sách Nhân Viên',
          type: 'table',
          dataset: {
            schema: [{ name: 'id', type: 'integer' }, { name: 'dept', type: 'string' }],
            rows: [{ id: 1, dept: 'Security' }],
          },
        },
      ],
    };

    render(
      <DataProcessingWorkspace
        step={multiTableStep}
        engineFactory={createMockEngine()}
      />
    );

    expect(screen.getByRole('button', { name: /access_logs/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /employees/i })).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Tìm bảng|Search tables/i);
    fireEvent.change(searchInput, { target: { value: 'dept' } });

    // employees is visible, access_logs table in Explorer is filtered out
    expect(screen.getByRole('button', { name: /employees/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /access_logs/i })).not.toBeInTheDocument();
  });

  it('4. executes SQL query and renders tabular results in ResultViewer', async () => {
    const mockEngine = createMockEngine();

    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={mockEngine}
      />
    );

    const runBtn = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    expect(runBtn).toBeInTheDocument();

    await waitFor(() => expect(runBtn).not.toBeDisabled());
    fireEvent.click(runBtn);

    await waitFor(() => {
      // Result rows rendered
      expect(screen.getByText('Bình An')).toBeInTheDocument();
      expect(screen.getByText('BDG-042')).toBeInTheDocument();
      expect(screen.getByText('17:24:00')).toBeInTheDocument();
    });

    // Summary bar shows count
    expect(screen.getByText(/Trả về 1 dòng|1 rows returned/i)).toBeInTheDocument();
  });

  it('5. handles SQL errors gracefully without crashing or showing game over', async () => {
    const failingEngine = () => ({
      initialize: vi.fn().mockResolvedValue({ ready: true, dialect: 'sqlite' }),
      loadDataset: vi.fn().mockResolvedValue({ success: true }),
      getSchema: vi.fn().mockResolvedValue({ dialect: 'sqlite', tables: [] }),
      execute: vi.fn().mockResolvedValue({
        errorCode: 'SQL_SYNTAX_ERROR',
        message: 'near "FORM": syntax error',
      }),
      dispose: vi.fn().mockResolvedValue(true),
    });

    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={failingEngine}
      />
    );

    const runBtn = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    await waitFor(() => expect(runBtn).not.toBeDisabled());
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Lỗi thực thi truy vấn|Lỗi truy vấn SQL/i)).toBeInTheDocument();
      expect(screen.getByText('SQL_SYNTAX_ERROR')).toBeInTheDocument();
    });
  });

  it('6. handles empty query result (0 rows returned)', async () => {
    const emptyEngine = () => ({
      initialize: vi.fn().mockResolvedValue({ ready: true, dialect: 'sqlite' }),
      loadDataset: vi.fn().mockResolvedValue({ success: true }),
      getSchema: vi.fn().mockResolvedValue({ dialect: 'sqlite', tables: [] }),
      execute: vi.fn().mockResolvedValue({
        columns: ['id', 'name'],
        rows: [],
        rowCount: 0,
        executionTimeMs: 2,
      }),
      dispose: vi.fn().mockResolvedValue(true),
    });

    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={emptyEngine}
      />
    );

    const runBtn = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    await waitFor(() => expect(runBtn).not.toBeDisabled());
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText(/Không có dòng dữ liệu nào khớp/i)).toBeInTheDocument();
    });
  });

  it('7. selects row in ResultViewer and transfers evidence to RecordFindingPanel', async () => {
    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
      />
    );

    const runBtn = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    await waitFor(() => expect(runBtn).not.toBeDisabled());
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Bình An')).toBeInTheDocument();
    });

    // Click on row to select it
    const rowCell = screen.getByText('Bình An');
    fireEvent.click(rowCell);

    // Selected row badge
    expect(screen.getByText(/Đã chọn dòng #1|Selected row #1/i)).toBeInTheDocument();

    // Evidence Reference panel shows referenced evidence
    expect(screen.getByText(/Dữ liệu tham chiếu|Referenced Evidence/i)).toBeInTheDocument();

    // System does NOT automatically write conclusion into player's finding content
    const textarea = screen.getByPlaceholderText(/Viết dữ kiện|Mô tả dữ kiện|State what the evidence/i);
    expect(textarea.value).toBe('');
  });

  it('8. records a FACT finding without showing immediate correctness or awarding XP', async () => {
    const handleRecord = vi.fn();

    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
        onRecordFinding={handleRecord}
      />
    );

    // Semantic hint is present
    expect(screen.getByText(/HQ sẽ thẩm định|HQ will verify/i)).toBeInTheDocument();

    // Enter finding content
    const textarea = screen.getByPlaceholderText(/Viết dữ kiện|Mô tả dữ kiện|State what the evidence/i);
    fireEvent.change(textarea, {
      target: { value: 'Bình An truy cập kho lúc 17:24 mang thẻ BDG-042' },
    });

    // Save finding button
    const saveBtn = screen.getByRole('button', { name: /Lưu vào Sổ tay|Save to Investigation/i });
    fireEvent.click(saveBtn);

    expect(handleRecord).toHaveBeenCalledTimes(1);
    const recordedPayload = handleRecord.mock.calls[0][0];

    expect(recordedPayload.type).toBe(FINDING_TYPES.FACT);
    expect(recordedPayload.content).toBe('Bình An truy cập kho lúc 17:24 mang thẻ BDG-042');
    expect(recordedPayload.caseId).toBe('case-001');
    expect(recordedPayload.chapterId).toBe('chapter-01');
    expect(recordedPayload.stepId).toBe('step-04');
    expect(recordedPayload.source.tableId).toBe('access_logs');

    // NO "Correct!" or "Chính xác!" or XP alerts
    expect(screen.queryByText(/Correct!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\+.*XP/i)).not.toBeInTheDocument();
  });

  it('9. supports INTERPRETATION finding type as distinct from FACT', async () => {
    const handleRecord = vi.fn();

    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
        onRecordFinding={handleRecord}
      />
    );

    // Click INTERPRETATION type
    const interpBtn = screen.getByText(/SUY ĐOÁN|INTERPRETATION/i);
    fireEvent.click(interpBtn);

    const textarea = screen.getByPlaceholderText(/Viết dữ kiện|Mô tả dữ kiện|State what the evidence/i);
    fireEvent.change(textarea, {
      target: { value: 'Bình An có thể là nghi phạm lấy cắp chìa khóa' },
    });

    const saveBtn = screen.getByRole('button', { name: /Lưu vào Sổ tay|Save to Investigation/i });
    fireEvent.click(saveBtn);

    expect(handleRecord).toHaveBeenCalledTimes(1);
    expect(handleRecord.mock.calls[0][0].type).toBe(FINDING_TYPES.INTERPRETATION);
  });

  it('10. integrates Finding -> Note persistence when default investigationStateService is used', async () => {
    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
        userId="user-test-agent"
      />
    );

    const textarea = screen.getByPlaceholderText(/Viết dữ kiện|Mô tả dữ kiện|State what the evidence/i);
    fireEvent.change(textarea, {
      target: { value: 'Dữ kiện kiểm tra đối soát tự động tạo Note' },
    });

    const saveBtn = screen.getByRole('button', { name: /Lưu vào Sổ tay|Save to Investigation/i });
    fireEvent.click(saveBtn);

    // Verify persistence in investigationStateService
    const storedState = investigationStateService.getState('case-001', 'user-test-agent');
    expect(storedState.findings.length).toBeGreaterThan(0);
    expect(storedState.notes.length).toBeGreaterThan(0);

    const createdNote = storedState.notes[0];
    expect(createdNote.caseId).toBe('case-001');
    expect(createdNote.chapterId).toBe('chapter-01');
    expect(createdNote.stepId).toBe('step-04');
    expect(createdNote.findingId).toBe(storedState.findings[0].id);
    expect(createdNote.source.tableId).toBe('access_logs');
    // Ensure 500 rows are NOT stored in the note
    expect(createdNote.rows).toBeUndefined();
  });

  it('11. renders ExcelProcessor when processor is "excel"', async () => {
    const excelStep = {
      ...mockStepConfig,
      processor: 'excel',
    };

    render(
      <DataProcessingWorkspace
        step={excelStep}
        engineFactory={createMockEngine()}
      />
    );

    // Excel processor elements
    expect(screen.getByText(/Công thức Excel|Excel Formula/i)).toBeInTheDocument();
    // FormulaBar fx symbol
    expect(screen.getByText('fx')).toBeInTheDocument();
  });

  it('12. integration flow: Step -> Query -> Result -> Record Finding -> Note -> Back', async () => {
    const handleBack = vi.fn();

    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
        onBack={handleBack}
        userId="user-integration-01"
      />
    );

    // 1. Wait for engine ready and Run Query
    const runBtn = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    await waitFor(() => expect(runBtn).not.toBeDisabled());
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Bình An')).toBeInTheDocument();
    });

    // 2. Select evidence
    fireEvent.click(screen.getByText('Bình An'));

    // 3. Record Finding
    const textarea = screen.getByPlaceholderText(/Viết dữ kiện|Mô tả dữ kiện|State what the evidence/i);
    fireEvent.change(textarea, {
      target: { value: 'Bình An có mặt ở kho lúc 17:24' },
    });

    const saveBtn = screen.getByRole('button', { name: /Lưu vào Sổ tay|Save to Investigation/i });
    fireEvent.click(saveBtn);

    // 4. Verify Finding & Note were persisted
    const state = investigationStateService.getState('case-001', 'user-integration-01');
    expect(state.findings[0].content).toBe('Bình An có mặt ở kho lúc 17:24');
    expect(state.notes[0].text).toContain('Bình An có mặt ở kho lúc 17:24');

    // 5. Back button triggers onBack callback
    const backBtn = screen.getByRole('button', { name: /Quay lại Hồ sơ|Back to Case/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('13. adjusts "Reference Evidence" action: pre-fills reference ONLY without auto-generating conclusion', async () => {
    const handleRecord = vi.fn();

    render(
      <DataProcessingWorkspace
        step={mockStepConfig}
        engineFactory={createMockEngine()}
        onRecordFinding={handleRecord}
      />
    );

    const runBtn = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    await waitFor(() => expect(runBtn).not.toBeDisabled());
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Bình An')).toBeInTheDocument();
    });

    // Find the Reference Evidence button in the table row
    const refBtn = screen.getByTitle(/Đính kèm tham chiếu|Reference as Evidence/i);
    expect(refBtn).toBeInTheDocument();
    fireEvent.click(refBtn);

    // 1. Evidence Reference card is shown
    expect(screen.getByText(/Dữ liệu tham chiếu|Referenced Evidence/i)).toBeInTheDocument();

    // 2. Textarea remains empty: the system does NOT invent the conclusion
    const textarea = screen.getByPlaceholderText(/Viết dữ kiện|Mô tả dữ kiện|State what the evidence/i);
    expect(textarea.value).toBe('');

    // 3. Optional "+ Chèn giá trị" button works if player wants to insert the value
    const insertBtn = screen.getByRole('button', { name: /\+.*Chèn giá trị|\+.*Insert value/i });
    fireEvent.click(insertBtn);
    expect(textarea.value).toContain('1');

    // 4. Player formulates their own finding
    fireEvent.change(textarea, {
      target: { value: 'Bình An truy cập khu vực quỹ lúc 17:24.' },
    });

    const saveBtn = screen.getByRole('button', { name: /Lưu vào Sổ tay|Save to Investigation/i });
    fireEvent.click(saveBtn);

    expect(handleRecord).toHaveBeenCalledTimes(1);
    expect(handleRecord.mock.calls[0][0].content).toBe('Bình An truy cập khu vực quỹ lúc 17:24.');
    expect(handleRecord.mock.calls[0][0].type).toBe(FINDING_TYPES.FACT);
  });

  it('14. restricts Data Sources strictly to those provided by current Step configuration', async () => {
    // Step configuration with restricted availableSources: only camera_logs allowed
    const restrictedStep = {
      id: 'step-01',
      caseId: 'case-001',
      availableSources: ['camera_logs'],
      dataSources: [
        {
          id: 'camera_logs',
          tableName: 'camera_logs',
          title: 'Nhật Ký Camera',
          dataset: {
            schema: [{ name: 'id', type: 'integer' }, { name: 'camera_id', type: 'string' }],
            rows: [{ id: 1, camera_id: 'CAM-01' }],
          },
        },
        {
          id: 'unauthorized_salary_records',
          tableName: 'unauthorized_salary_records',
          title: 'Hồ Sơ Lương (Tuyệt Mật Bước Sau)',
          dataset: {
            schema: [{ name: 'id', type: 'integer' }, { name: 'salary', type: 'integer' }],
            rows: [{ id: 1, salary: 99999999 }],
          },
        },
      ],
    };

    render(
      <DataProcessingWorkspace
        step={restrictedStep}
        engineFactory={createMockEngine()}
      />
    );

    // Only camera_logs is exposed in DataSourceSelector and DataExplorer
    expect(screen.getAllByRole('button', { name: /Nhật Ký Camera|camera_logs/i }).length).toBeGreaterThanOrEqual(1);

    // Unauthorized/future step table is NOT exposed
    expect(screen.queryByText(/Hồ Sơ Lương/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/unauthorized_salary_records/i)).not.toBeInTheDocument();
  });

  it('15. hidden dataset cannot be queried manually even when the player knows its table name', async () => {
    // Current Step: only camera_logs allowed
    // Hidden/future source: transactions
    const stepWithHiddenDataset = {
      id: 'step-01',
      caseId: 'case-001',
      availableSources: ['camera_logs'],
      dataSources: [
        {
          id: 'camera_logs',
          tableName: 'camera_logs',
          title: 'Nhật Ký Camera',
          dataset: {
            schema: [{ name: 'id', type: 'integer' }, { name: 'camera_id', type: 'string' }],
            rows: [{ id: 1, camera_id: 'CAM-01' }],
          },
        },
        {
          id: 'transactions',
          tableName: 'transactions',
          title: 'Giao Dịch Ngân Hàng (Tương Lai)',
          dataset: {
            schema: [{ name: 'id', type: 'integer' }, { name: 'amount', type: 'integer' }],
            rows: [{ id: 99, amount: 120000000 }],
          },
        },
      ],
    };

    render(
      <DataProcessingWorkspace
        step={stepWithHiddenDataset}
        engineFactory={createMockEngine()}
      />
    );

    const runBtn = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    await waitFor(() => expect(runBtn).not.toBeDisabled());

    // Player attempts to manually bypass step restriction by typing a query for hidden table
    const editor = screen.getByLabelText(/Khung soạn thảo câu lệnh SQL/i);
    fireEvent.change(editor, { target: { value: 'SELECT * FROM transactions;' } });

    const runBtnAfter = screen.getByRole('button', { name: /Chạy truy vấn|Run Query/i });
    fireEvent.click(runBtnAfter);

    // Query MUST be blocked / table MUST be unavailable
    await waitFor(() => {
      expect(screen.getByText(/Lỗi thực thi truy vấn/i)).toBeInTheDocument();
      expect(screen.getByText(/không khả dụng hoặc chưa được mở khóa/i)).toBeInTheDocument();
      expect(screen.getByText(/transactions/i)).toBeInTheDocument();
    });

    // The unauthorized data (amount 120000000) must NEVER be rendered
    expect(screen.queryByText('120000000')).not.toBeInTheDocument();
  });
});
