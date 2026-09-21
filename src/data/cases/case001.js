/**
 * Case Content: case-001 — Đường Dây Buôn Lậu Cà Phê (Illegal Coffee Delivery)
 *
 * Structure:
 *   case → phases (with investigationQuestion + clues)
 *        → sources → datasets
 *        → reportDefinitions → verificationRules
 *
 * Design principles:
 *   - Case is the product. Excel is an investigation tool.
 *   - Clues are investigation leads, not exercise tasks.
 *   - Findings are distinct from notebook notes.
 *   - "unauthorized excess" ≠ stolen/missing — semantics matter.
 */

export const CASE_001 = {
  id: 'case-001',
  title: {
    en: 'Illegal Coffee Delivery',
    vi: 'Đường Dây Buôn Lậu Cà Phê'
  },
  caseNumber: '#001',
  tool: 'excel',
  difficulty: 'tutorial',
  estimatedMinutes: 20,
  status: 'published',

  // ── Case Brief ──────────────────────────────────────────────────────────────
  briefing: {
    narrative: {
      en: `The warehouse supervisor filed an internal report stating that 18,420 kg of robusta coffee was shipped from Warehouse A during May 2026. However, the monthly procurement authorization records show only 14,210 kg was approved for outbound delivery.\n\nThe 4,210 kg discrepancy has not been explained by any documented exception request. The assistant manager flagged it for investigation three days ago. No one has reviewed it since.`,
      vi: `Quản đốc kho vừa nộp một báo cáo nội bộ cho thấy 18.420 kg cà phê Robusta đã được xuất từ Kho A trong tháng 5/2026. Tuy nhiên, hồ sơ ủy quyền xuất kho hàng tháng chỉ phê duyệt 14.210 kg cho việc xuất hàng.\n\nSự chênh lệch 4.210 kg này không có bất kỳ yêu cầu ngoại lệ nào được ghi nhận. Trợ lý giám đốc đã đánh dấu sự việc này để điều tra từ 3 ngày trước. Kể từ đó chưa có ai xem xét lại.`
    },
    objective: {
      en: `Determine the extent of the unauthorized quantity, identify which shipment order is responsible, and confirm who processed it.`,
      vi: `Xác định chính xác số lượng hàng xuất trái phép, tìm ra đơn hàng nào chịu trách nhiệm và xác nhận ai là người đã xử lý đơn hàng đó.`
    }
  },

  // ── Investigation Phases ─────────────────────────────────────────────────────
  phases: [
    {
      id: 'phase-1',
      order: 1,
      title: {
        en: 'Find the Unauthorized Shipment',
        vi: 'Tìm Chuyến Hàng Trái Phép'
      },
      description: {
        en: 'Locate the specific shipment order that does not match the approved quantity.',
        vi: 'Xác định đơn xuất hàng không khớp với số lượng đã được phê duyệt.'
      },
      status: 'unlocked',

      // Investigation Question — frames the investigative goal for this phase
      investigationQuestion: {
        id: 'iq-phase1',
        question: {
          en: 'Which shipment(s) in May 2026 exceed the authorized quantity, and by how much?',
          vi: 'Chuyến hàng nào trong tháng 5/2026 đã vượt quá số lượng ủy quyền, và vượt bao nhiêu?'
        },
        context: {
          en: `The warehouse records show total outbound volume for the month. The procurement authorization sets the approved limit. Your task is to verify whether the discrepancy is real and identify the responsible order.`,
          vi: `Báo cáo kho cho thấy tổng lượng hàng xuất trong tháng. Trong khi đó, giấy ủy quyền mua hàng ấn định giới hạn được phép. Nhiệm vụ của bạn là xác minh xem sự chênh lệch có thật hay không và chỉ đích danh đơn hàng vi phạm.`
        }
      },

      // Clues — micro-investigation leads (not exercise tasks)
      clues: [
        {
          clueId: 'clue-p1-volume',
          order: 1,
          title: {
            en: 'LEAD — SHIPMENT VOLUME',
            vi: 'MANH MỐI — KHỐI LƯỢNG XUẤT KHO'
          },
          narrative: {
            en: `The warehouse report logs the total shipped volume for May.\nThe Regional Director's authorization specifies the approved limit.\nThese two numbers appear to mismatch.\n\nCan you verify the discrepancy?`,
            vi: `Báo cáo kho ghi nhận tổng lượng hàng xuất trong tháng 5.\nQuyết định phê duyệt của Giám đốc khu vực ghi rõ hạn mức cho phép.\nHai con số này có vẻ không khớp.\n\nBạn có thể xác minh mức chênh lệch này không?`
          },
          type: 'excel_calculate',
          relevantSourceIds: ['src-warehouse-records', 'src-procurement-auth'],
          verificationCondition: {
            type: 'expected_finding',
            description: 'Calculate total shipped vs authorized and derive the unauthorized excess',
            // Not shown to investigator — used by clue completion tracking only
            _expectedValue: 4210,
          },
        },
        {
          clueId: 'clue-p1-auth',
          order: 2,
          title: {
            en: 'LEAD — AUTHORIZATION ANOMALY',
            vi: 'MANH MỐI — BẤT THƯỜNG TRONG ỦY QUYỀN'
          },
          narrative: {
            en: `Most orders have a proper authorization form code (OUT-xx).\nOne order only says "YES" without a form code.\n\nReview the authorization column carefully.`,
            vi: `Hầu hết các đơn hàng đều có mã ủy quyền Form OUT-xx.\nMột đơn hàng chỉ ghi "YES" mà không có mã form.\n\nHãy kiểm tra kỹ cột ủy quyền (Authorization).`
          },
          type: 'excel_filter',
          relevantSourceIds: ['src-warehouse-records'],
          verificationCondition: {
            type: 'expected_finding',
            description: 'Identify the order with incomplete authorization documentation',
            _expectedValue: 'ORD-1842',
          },
        },
      ],
    },
    {
      id: 'phase-2',
      order: 2,
      title: {
        en: 'Trace the Destination',
        vi: 'Truy Vết Điểm Đến'
      },
      description: {
        en: 'Determine where the unauthorized shipment was sent and who received it.',
        vi: 'Xác định xem chuyến hàng trái phép đã được chuyển đi đâu và ai là người nhận.'
      },
      status: 'locked',

      investigationQuestion: {
        id: 'iq-phase2',
        question: {
          en: 'Where did order ORD-1842 go, and who was responsible for receiving it?',
          vi: 'Đơn hàng ORD-1842 đã đi đâu và ai là người chịu trách nhiệm tiếp nhận?'
        },
        context: {
          en: `A new lead has been attached: the detailed movement audit trail for ORD-1842. This record documents the complete chain of custody from loading through final storage. Examine it carefully.`,
          vi: `Một manh mối mới vừa được đính kèm: Nhật ký di chuyển chi tiết của đơn hàng ORD-1842. Hồ sơ này ghi nhận toàn bộ chuỗi hành trình từ lúc bốc hàng đến khi lưu trữ cuối cùng. Hãy kiểm tra thật kỹ.`
        }
      },

      clues: [
        {
          clueId: 'clue-p2-destination',
          order: 1,
          title: {
            en: 'LEAD — FINAL DESTINATION',
            vi: 'MANH MỐI — ĐIỂM ĐẾN CUỐI CÙNG'
          },
          narrative: {
            en: `The log records the full journey of shipment ORD-1842.\nWhere did the goods arrive? Who received them?\nWhich storage section were they placed in?\n\nTrace the shipment to its final location.`,
            vi: `Nhật ký ghi nhận đầy đủ hành trình của lô hàng ORD-1842.\nHàng hóa đã đến đâu? Ai là người tiếp nhận?\nĐược lưu trữ ở khu vực nào?\n\nHãy truy vết lô hàng đến điểm cuối cùng.`
          },
          type: 'excel_filter',
          relevantSourceIds: ['src-detailed-log'],
          verificationCondition: {
            type: 'expected_finding',
            description: 'Find the destination warehouse, the person who received the goods, and the storage location',
          },
        },
      ],
    },
  ],

  // ── Sources ─────────────────────────────────────────────────────────────────
  sources: [
    {
      id: 'src-warehouse-records',
      type: 'table',
      title: {
        en: 'Warehouse Shipping Records',
        vi: 'Báo Cáo Xuất Kho'
      },
      description: {
        en: 'Official outbound shipment log for May 2026. Contains all orders processed by Warehouse A.',
        vi: 'Nhật ký xuất hàng chính thức tháng 5/2026. Chứa tất cả các đơn hàng do Kho A xử lý.'
      },
      datasetId: 'ds-coffee-warehouse-may',
      isUnlocked: true,
      unlockedAtPhase: 'phase-1',
    },
    {
      id: 'src-procurement-auth',
      type: 'document',
      title: 'Monthly Procurement Authorization',
      description: 'Approved outbound quantities for May 2026, signed by regional director.',
      content: `PROCUREMENT AUTHORIZATION — MAY 2026
Regional Director: Trần Minh Khoa
Authorized: 14,210 kg Robusta Coffee (Outbound)
Approved destinations: Warehouse B, Distribution Hub C
Note: Any quantity exceeding 14,210 kg requires a separate authorization form (Form OUT-07).

Signed: 28/04/2026`,
      isUnlocked: true,
      unlockedAtPhase: 'phase-1',
    },
    {
      id: 'src-supervisor-statement',
      type: 'witness',
      title: 'Warehouse Supervisor Statement',
      description: 'Initial statement from the warehouse supervisor who filed the discrepancy report.',
      content: `WITNESS STATEMENT

Name: Lê Thị Hoa
Role: Warehouse Supervisor, Warehouse A
Date: 15/06/2026

"I noticed the discrepancy when running our end-of-month reconciliation. The system showed 18,420 kg shipped, but I only had authorization paperwork for 14,210 kg. I checked all the orders and could not find a Form OUT-07 for the additional quantity.

I reported this to the assistant manager three days ago. I was told it would be investigated, but I have not heard back since then.

I do not know who authorized the additional shipment or where it went."`,
      isUnlocked: true,
      unlockedAtPhase: 'phase-1',
    },
    {
      id: 'src-detailed-log',
      type: 'table',
      title: 'Detailed Shipment Log — ORD-1842',
      description: 'Full movement audit trail for order ORD-1842. Unlocked after Phase 1 report is verified.',
      datasetId: 'ds-coffee-order-detail',
      isUnlocked: false,
      unlockedAtPhase: 'phase-2',
    },
  ],

  // ── Datasets ─────────────────────────────────────────────────────────────────
  datasets: {
    'ds-coffee-warehouse-may': {
      id: 'ds-coffee-warehouse-may',
      title: 'Warehouse Shipping Records — May 2026',
      description: 'Outbound shipment log for Warehouse A, May 2026.',
      // actual_shipped_kg = SUM(quantity_kg) = 18,420
      // authorized_kg = 14,210 (from procurement authorization)
      // unauthorized_excess_kg = 18,420 - 14,210 = 4,210
      schema: [
        { name: 'order_id',    label: 'Order ID',       type: 'string', excelColumn: 'A' },
        { name: 'date',        label: 'Date',           type: 'date',   excelColumn: 'B' },
        { name: 'product',     label: 'Product',        type: 'string', excelColumn: 'C' },
        { name: 'quantity_kg', label: 'Quantity (kg)',  type: 'number', excelColumn: 'D' },
        { name: 'destination', label: 'Destination',    type: 'string', excelColumn: 'E' },
        { name: 'authorized',  label: 'Authorization',  type: 'string', excelColumn: 'F' },
        { name: 'manager',     label: 'Manager',        type: 'string', excelColumn: 'G' },
      ],
      rows: [
        { order_id: 'ORD-1835', date: '02/05/2026', product: 'Robusta Coffee', quantity_kg: 2100, destination: 'Warehouse B',        authorized: 'YES — Form OUT-04', manager: 'Phạm Thu Hà'    },
        { order_id: 'ORD-1836', date: '05/05/2026', product: 'Robusta Coffee', quantity_kg: 3500, destination: 'Warehouse B',        authorized: 'YES — Form OUT-04', manager: 'Phạm Thu Hà'    },
        { order_id: 'ORD-1839', date: '08/05/2026', product: 'Robusta Coffee', quantity_kg: 1890, destination: 'Distribution Hub C', authorized: 'YES — Form OUT-05', manager: 'Trần Đức Long'  },
        { order_id: 'ORD-1842', date: '14/05/2026', product: 'Robusta Coffee', quantity_kg: 4210, destination: '—',                  authorized: 'YES',               manager: 'Nguyễn Văn Tâm' },
        { order_id: 'ORD-1847', date: '19/05/2026', product: 'Robusta Coffee', quantity_kg: 2800, destination: 'Distribution Hub C', authorized: 'YES — Form OUT-05', manager: 'Trần Đức Long'  },
        { order_id: 'ORD-1851', date: '23/05/2026', product: 'Robusta Coffee', quantity_kg: 2320, destination: 'Warehouse B',        authorized: 'YES — Form OUT-06', manager: 'Phạm Thu Hà'    },
        { order_id: 'ORD-1858', date: '28/05/2026', product: 'Robusta Coffee', quantity_kg: 1600, destination: 'Distribution Hub C', authorized: 'YES — Form OUT-06', manager: 'Trần Đức Long'  },
      ],
    },

    'ds-coffee-order-detail': {
      id: 'ds-coffee-order-detail',
      title: 'Detailed Record — Order ORD-1842',
      description: 'Full movement audit trail for the flagged order.',
      schema: [
        { name: 'timestamp',   label: 'Timestamp',    type: 'datetime', excelColumn: 'A' },
        { name: 'action',      label: 'Action',       type: 'string',   excelColumn: 'B' },
        { name: 'quantity_kg', label: 'Quantity (kg)', type: 'number',  excelColumn: 'C' },
        { name: 'location',    label: 'Location',     type: 'string',   excelColumn: 'D' },
        { name: 'recorded_by', label: 'Recorded By',  type: 'string',   excelColumn: 'E' },
      ],
      rows: [
        { timestamp: '14/05/2026 07:12', action: 'Loading started',    quantity_kg: 4210, location: 'Warehouse A — Dock 3',    recorded_by: 'System'          },
        { timestamp: '14/05/2026 09:45', action: 'Loading completed',  quantity_kg: 4210, location: 'Warehouse A — Dock 3',    recorded_by: 'Nguyễn Văn Tâm' },
        { timestamp: '14/05/2026 10:03', action: 'Departed',           quantity_kg: 4210, location: 'Warehouse A',             recorded_by: 'System'          },
        { timestamp: '14/05/2026 14:38', action: 'Received',           quantity_kg: 4210, location: 'Warehouse C',             recorded_by: 'Bùi Thanh Sơn'  },
        { timestamp: '14/05/2026 15:00', action: 'Stored — Unlabeled', quantity_kg: 4210, location: 'Warehouse C — Section 9', recorded_by: 'Bùi Thanh Sơn'  },
      ],
    },
  },
};

// ── Report Definition — Phase 1 ────────────────────────────────────────────────
//
// Phase 1 goal: Verify the unauthorized excess quantity and identify who processed the order.
// The investigator must calculate: SUM(quantity_kg) - authorized_kg = unauthorized_excess_kg
// This requires using the Investigation Workbench — it cannot be answered by reading alone.

export const REPORT_CASE001_PHASE1 = {
  reportDefinitionId: 'report-case001-phase1',
  caseId: 'case-001',
  phaseId: 'phase-1',
  title: {
    en: 'INVESTIGATION REPORT — PHASE 1',
    vi: 'BÁO CÁO ĐIỀU TRA — GIAI ĐOẠN 1'
  },
  caseLabel: {
    en: 'CASE #001 — Illegal Coffee Delivery',
    vi: 'VỤ ÁN #001 — Đường Dây Buôn Lậu Cà Phê'
  },
  instructions: {
    en: 'Based on your analysis of the warehouse records, document the unauthorized quantity and the responsible party.',
    vi: 'Dựa trên phân tích hồ sơ kho, hãy ghi chép lại số lượng hàng trái phép và người chịu trách nhiệm.'
  },
  evidenceRequired: false,
  fields: [
    {
      field_id: 'order_id',
      label: { en: 'Order ID', vi: 'Mã đơn hàng' },
      type: 'text',
      order: 1,
      required: true,
      prefilled: true,
      prefilled_value: 'ORD-1842',
      editable: false,
      placeholder: null,
      validation: null,
      evidence_required: false,
      hint: { en: 'The flagged order identified from the authorization anomaly.', vi: 'Đơn hàng có bất thường về ủy quyền.' },
    },
    {
      field_id: 'shipment_date',
      label: { en: 'Shipment Date', vi: 'Ngày xuất hàng' },
      type: 'text',
      order: 2,
      required: true,
      prefilled: true,
      prefilled_value: '14/05/2026',
      editable: false,
      placeholder: null,
      validation: null,
      evidence_required: false,
      hint: null,
    },
    {
      field_id: 'actual_shipped_kg',
      label: { en: 'Actual Shipped (kg)', vi: 'Đã xuất thực tế (kg)' },
      type: 'text',
      order: 3,
      required: true,
      prefilled: true,
      prefilled_value: '18,420',
      editable: false,
      placeholder: null,
      validation: null,
      evidence_required: false,
      hint: { en: 'Total outbound volume recorded in Warehouse Shipping Records — May 2026.', vi: 'Tổng khối lượng xuất kho ghi nhận trong Báo cáo.' },
    },
    {
      field_id: 'authorized_kg',
      label: { en: 'Authorized Quantity (kg)', vi: 'Số lượng ủy quyền (kg)' },
      type: 'text',
      order: 4,
      required: true,
      prefilled: true,
      prefilled_value: '14,210',
      editable: false,
      placeholder: null,
      validation: null,
      evidence_required: false,
      hint: { en: 'Approved outbound quantity per Monthly Procurement Authorization.', vi: 'Số lượng được phép xuất theo Giấy ủy quyền.' },
    },
    {
      field_id: 'unauthorized_excess_kg',
      label: { en: 'Unauthorized Excess (kg)', vi: 'Khối lượng vượt mức (kg)' },
      type: 'number',
      order: 5,
      required: true,
      prefilled: false,
      prefilled_value: null,
      editable: true,
      placeholder: { en: 'Enter the calculated excess quantity...', vi: 'Nhập số lượng vượt mức tính được...' },
      validation: { type: 'number', min: 0 },
      evidence_required: true,
      hint: { en: 'Calculate: Actual Shipped − Authorized Quantity. Use the Investigation Workbench to verify.', vi: 'Tính: Đã xuất thực tế - Số lượng ủy quyền.' },
      prefill_from_finding: 'unauthorized_excess',
    },
    {
      field_id: 'responsible_manager',
      label: { en: 'Responsible Manager', vi: 'Quản lý xử lý đơn' },
      type: 'text',
      order: 6,
      required: true,
      prefilled: false,
      prefilled_value: null,
      editable: true,
      placeholder: { en: 'Full name of the manager who processed ORD-1842...', vi: 'Họ tên quản lý đã xử lý đơn ORD-1842...' },
      validation: { min_length: 3 },
      evidence_required: true,
      hint: { en: 'Check the Manager column for order ORD-1842 in the Warehouse Shipping Records.', vi: 'Kiểm tra cột Manager của đơn hàng ORD-1842.' },
      prefill_from_finding: null,
    },
  ],
};

// ── Verification Rules — Phase 1 ───────────────────────────────────────────────
//
// numeric_exact: strip non-numeric chars, compare as number
// case_insensitive: normalize whitespace + lowercase comparison

export const VERIFICATION_CASE001_PHASE1 = {
  caseId: 'case-001',
  phaseId: 'phase-1',
  reportDefinitionId: 'report-case001-phase1',
  rules: [
    {
      field_id: 'unauthorized_excess_kg',
      strategy: 'numeric_exact',
      expected: 4210,
      errorMessage: {
        en: 'The calculated excess does not match the record. Review your calculation: SUM of all shipments minus the authorized quantity.',
        vi: 'Khối lượng vượt mức không khớp với hồ sơ. Hãy tính lại: TỔNG hàng xuất trừ đi khối lượng được ủy quyền.'
      }
    },
    {
      field_id: 'responsible_manager',
      strategy: 'case_insensitive',
      expected: 'Nguyễn Văn Tâm',
      errorMessage: {
        en: 'The manager identified does not match the warehouse record for ORD-1842. Check the Manager column carefully.',
        vi: 'Người quản lý không khớp với hồ sơ kho cho đơn ORD-1842. Hãy kiểm tra kỹ cột Manager.'
      }
    },
  ],
  onAccepted: {
    action: 'unlock_phase',
    targetPhaseId: 'phase-2',
    hqMessage: {
      en: `Your calculation is confirmed. The warehouse records show 18,420 kg shipped against an authorized limit of 14,210 kg — an unauthorized excess of 4,210 kg. Order ORD-1842, processed by Nguyễn Văn Tâm, has no valid Form OUT-07. A new lead has been retrieved and attached to this case file.`,
      vi: `Xác nhận kết quả tính toán. Hồ sơ kho cho thấy 18.420 kg đã xuất trong khi chỉ được phép 14.210 kg — vượt mức 4.210 kg. Đơn ORD-1842 do Nguyễn Văn Tâm xử lý không có biểu mẫu Form OUT-07 hợp lệ. Một manh mối mới đã được thu thập và đính kèm vào hồ sơ vụ án.`
    },
    newLeadSourceId: 'src-detailed-log',
    newLeadTitle: {
      en: 'Detailed Shipment Log — ORD-1842',
      vi: 'Nhật Ký Lô Hàng Chi Tiết — ORD-1842'
    },
    newLeadText: {
      en: 'Field agents have retrieved the full movement audit trail for ORD-1842. This record documents the complete chain of custody from loading through final storage. Trace where the goods were received and stored.',
      vi: 'Đặc vụ hiện trường đã thu thập được nhật ký hành trình di chuyển đầy đủ của ORD-1842. Hồ sơ này ghi chép toàn bộ chuỗi hành trình từ khi bốc hàng đến lúc lưu kho cuối cùng. Hãy truy vết xem hàng hóa đã được nhận và cất ở đâu.'
    }
  },
  onReturned: {
    action: 'return_report',
    hqMessage: {
      en: 'Your findings could not be verified against the available records. Review the warehouse shipping records and recalculate the quantity discrepancy. Ensure your figure reflects the difference between total shipped and total authorized.',
      vi: 'Không thể xác minh kết quả điều tra của bạn theo các hồ sơ hiện có. Vui lòng xem lại báo cáo xuất kho và tính lại mức chênh lệch. Đảm bảo con số của bạn là mức chênh giữa tổng hàng đã xuất và tổng hàng được phê duyệt.'
    }
  },
};

// ── Report Definition — Phase 2 ────────────────────────────────────────────────
//
// Phase 2 goal: Trace order ORD-1842 to its final destination.
// The investigator uses the Detailed Shipment Log to find where it went,
// who received it, and where it was stored.

export const REPORT_CASE001_PHASE2 = {
  reportDefinitionId: 'report-case001-phase2',
  caseId: 'case-001',
  phaseId: 'phase-2',
  title: {
    en: 'INVESTIGATION REPORT — PHASE 2',
    vi: 'BÁO CÁO ĐIỀU TRA — GIAI ĐOẠN 2'
  },
  caseLabel: {
    en: 'CASE #001 — Illegal Coffee Delivery',
    vi: 'VỤ ÁN #001 — Đường Dây Buôn Lậu Cà Phê'
  },
  instructions: {
    en: 'Based on the detailed shipment log, trace where order ORD-1842 was delivered, who received it, and where it was stored.',
    vi: 'Dựa trên nhật ký lô hàng chi tiết, hãy truy vết xem đơn hàng ORD-1842 đã được giao đến đâu, ai là người nhận, và được lưu trữ ở đâu.'
  },
  evidenceRequired: false,
  fields: [
    {
      field_id: 'order_id',
      label: { en: 'Order ID', vi: 'Mã Đơn Hàng' },
      type: 'text',
      order: 1,
      required: true,
      prefilled: true,
      prefilled_value: 'ORD-1842',
      editable: false,
      placeholder: null,
      validation: null,
      evidence_required: false,
      hint: null,
    },
    {
      field_id: 'destination',
      label: { en: 'Destination', vi: 'Điểm Đến' },
      type: 'text',
      order: 2,
      required: true,
      prefilled: false,
      prefilled_value: null,
      editable: true,
      placeholder: { en: 'Where was the shipment delivered?', vi: 'Chuyến hàng đã được giao đến đâu?' },
      validation: { min_length: 2 },
      evidence_required: true,
      hint: { en: 'Check the Location column in the Detailed Shipment Log for the "Received" entry.', vi: 'Kiểm tra cột Location trong Nhật ký cho hành động "Received".' },
      prefill_from_finding: 'destination',
    },
    {
      field_id: 'received_by',
      label: { en: 'Received By', vi: 'Người Nhận' },
      type: 'text',
      order: 3,
      required: true,
      prefilled: false,
      prefilled_value: null,
      editable: true,
      placeholder: { en: 'Full name of the person who received the shipment...', vi: 'Họ tên đầy đủ của người nhận chuyến hàng...' },
      validation: { min_length: 3 },
      evidence_required: true,
      hint: { en: 'Check the Recorded By column for the "Received" action in the Detailed Shipment Log.', vi: 'Kiểm tra cột Recorded By cho hành động "Received".' },
      prefill_from_finding: 'received_by',
    },
    {
      field_id: 'storage_location',
      label: { en: 'Storage Location', vi: 'Khu Vực Lưu Trữ' },
      type: 'text',
      order: 4,
      required: true,
      prefilled: false,
      prefilled_value: null,
      editable: true,
      placeholder: { en: 'Where was the cargo stored?', vi: 'Hàng hóa được lưu trữ ở đâu?' },
      validation: { min_length: 2 },
      evidence_required: true,
      hint: { en: 'Check the Location column for the "Stored" action in the Detailed Shipment Log.', vi: 'Kiểm tra cột Location cho hành động "Stored".' },
      prefill_from_finding: 'storage_location',
    },
  ],
};

// ── Verification Rules — Phase 2 ───────────────────────────────────────────────

export const VERIFICATION_CASE001_PHASE2 = {
  caseId: 'case-001',
  phaseId: 'phase-2',
  reportDefinitionId: 'report-case001-phase2',
  rules: [
    {
      field_id: 'destination',
      strategy: 'case_insensitive',
      expected: 'Warehouse C',
      errorMessage: {
        en: 'The destination does not match the audit trail. Check the "Received" entry in the Detailed Shipment Log.',
        vi: 'Điểm đến không khớp với nhật ký kiểm toán. Kiểm tra mục "Received" trong Nhật Ký Lô Hàng Chi Tiết.'
      }
    },
    {
      field_id: 'received_by',
      strategy: 'case_insensitive',
      expected: 'Bùi Thanh Sơn',
      errorMessage: {
        en: 'The recipient does not match the audit trail. Check the Recorded By column for the "Received" action.',
        vi: 'Người nhận không khớp với nhật ký kiểm toán. Kiểm tra cột Recorded By cho hành động "Received".'
      }
    },
    {
      field_id: 'storage_location',
      strategy: 'case_insensitive',
      expected: 'Section 9',
      errorMessage: {
        en: 'The storage location does not match the audit trail. Check the "Stored" action in the Detailed Shipment Log.',
        vi: 'Khu vực lưu trữ không khớp với nhật ký kiểm toán. Kiểm tra hành động "Stored" trong Nhật Ký Lô Hàng Chi Tiết.'
      }
    },
  ],
  onAccepted: {
    action: 'close_case',
    targetPhaseId: null,
    hqMessage: {
      en: `Confirmed. Order ORD-1842 — 4,210 kg of unauthorized coffee — was delivered to Warehouse C and received by Bùi Thanh Sơn. The goods were stored unlabeled in Section 9. This concludes the traceability investigation. Case file is being closed and referred to the compliance team.`,
      vi: `Xác nhận. Đơn hàng ORD-1842 — 4.210 kg cà phê trái phép — đã được giao đến Warehouse C và do Bùi Thanh Sơn tiếp nhận. Hàng hóa được cất giữ không dán nhãn tại Section 9. Điều tra truy xuất nguồn gốc kết thúc tại đây. Hồ sơ vụ án đang được đóng lại và chuyển cho đội tuân thủ.`
    },
    caseSummary: {
      order_id: 'ORD-1842',
      unauthorized_excess_kg: 4210,
      destination: 'Warehouse C',
      received_by: 'Bùi Thanh Sơn',
      storage_location: 'Section 9',
      responsible_manager: 'Nguyễn Văn Tâm',
    },
  },
  onReturned: {
    action: 'return_report',
    hqMessage: {
      en: 'One or more findings could not be verified against the audit trail. Review the Detailed Shipment Log carefully — pay attention to the Location and Recorded By columns for each action.',
      vi: 'Một hoặc nhiều kết quả không thể xác minh với nhật ký kiểm toán. Xem lại Nhật Ký Lô Hàng Chi Tiết cẩn thận — chú ý đến các cột Location và Recorded By cho từng hành động.'
    }
  },
};

// ── HQ Messages ───────────────────────────────────────────────────────────────

export const HQ_MESSAGES_CASE001 = {
  'phase-2-new-lead': {
    type: 'new_lead',
    content: {
      en: 'Field agents have retrieved the full movement audit trail for order ORD-1842. This record shows the complete chain of custody from loading through delivery. Examine it carefully.',
      vi: 'Đặc vụ hiện trường đã thu thập nhật ký di chuyển đầy đủ của đơn hàng ORD-1842. Hồ sơ này cho thấy toàn bộ chuỗi hành trình từ lúc bốc hàng đến khi giao. Hãy xem xét nó cẩn thận.'
    }
  },
};
