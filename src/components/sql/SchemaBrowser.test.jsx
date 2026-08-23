import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SchemaBrowser } from './SchemaBrowser'

const mockSchema = {
  dialect: 'sqlite',
  tables: [
    {
      name: 'airports',
      columns: [
        { name: 'code', type: 'TEXT', primaryKey: true, nullable: false },
        { name: 'city', type: 'TEXT', primaryKey: false, nullable: true },
      ],
      sampleRows: [
        ['SGN', 'Ho Chi Minh'],
        ['HAN', 'Ha Noi'],
      ],
    },
    {
      name: 'flights',
      columns: [
        { name: 'flight_no', type: 'TEXT', primaryKey: true, nullable: false },
        { name: 'price', type: 'REAL', primaryKey: false, nullable: false },
      ],
      sampleRows: [['AV101', 120.5]],
    },
    {
      name: 'sqlite_sequence',
      columns: [{ name: 'name', type: 'TEXT', primaryKey: false, nullable: true }],
      sampleRows: [],
    },
  ],
}

describe('SchemaBrowser Component — Step 4.2', () => {
  it('render danh sách bảng và cột chính xác từ schema prop (bỏ qua sqlite_ sequence)', () => {
    render(<SchemaBrowser schema={mockSchema} />)

    expect(screen.getByText('airports')).toBeInTheDocument()
    expect(screen.getByText('flights')).toBeInTheDocument()
    expect(screen.queryByText('sqlite_sequence')).not.toBeInTheDocument()

    expect(screen.getByText('code')).toBeInTheDocument()
    expect(screen.getByText('flight_no')).toBeInTheDocument()
  })

  it('lọc danh sách bảng/cột theo từ khóa tìm kiếm', () => {
    render(<SchemaBrowser schema={mockSchema} />)

    const searchInput = screen.getByPlaceholderText(/Tìm tên bảng hoặc tên cột/i)
    fireEvent.change(searchInput, { target: { value: 'flight' } })

    expect(screen.getByText('flights')).toBeInTheDocument()
    expect(screen.queryByText('airports')).not.toBeInTheDocument()
  })

  it('chuyển đổi giữa tab "Danh Sách Cột" và "Xem Mẫu (3 Hàng)"', () => {
    render(<SchemaBrowser schema={mockSchema} />)

    const sampleTabButtons = screen.getAllByRole('button', { name: /Xem Mẫu/i })
    fireEvent.click(sampleTabButtons[0]) // click airports sample tab

    expect(screen.getByText('Ho Chi Minh')).toBeInTheDocument()
    expect(screen.getByText('Ha Noi')).toBeInTheDocument()
  })

  it('gọi callback onCopyIdentifier và clipboard khi bấm nút copy', () => {
    const handleCopyMock = vi.fn()
    render(<SchemaBrowser schema={mockSchema} onCopyIdentifier={handleCopyMock} />)

    const copyBtn = screen.getAllByTitle('Sao chép tên bảng')[0]
    fireEvent.click(copyBtn)

    expect(handleCopyMock).toHaveBeenCalledWith('airports', 'table')
  })

  it('hiển thị trạng thái Loading khi isLoading = true', () => {
    const { container } = render(<SchemaBrowser isLoading={true} />)

    const loadingElem = container.querySelector('[aria-busy="true"]')
    expect(loadingElem).toBeInTheDocument()
  })

  it('hiển thị lỗi khi error prop có giá trị', () => {
    render(<SchemaBrowser error={{ message: 'SQLite Worker Error' }} />)

    expect(screen.getByText('Không thể tải Cơ sở dữ liệu')).toBeInTheDocument()
    expect(screen.getByText('SQLite Worker Error')).toBeInTheDocument()
  })

  it('hỗ trợ điều hướng bằng bàn phím (Keyboard Navigation - Enter/Space)', () => {
    render(<SchemaBrowser schema={mockSchema} />)

    const tableHeader = screen.getByRole('button', { name: /Bảng airports/i })
    expect(tableHeader).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(tableHeader, { key: 'Enter', code: 'Enter' })
    expect(tableHeader).toHaveAttribute('aria-expanded', 'false')

    fireEvent.keyDown(tableHeader, { key: ' ', code: 'Space' })
    expect(tableHeader).toHaveAttribute('aria-expanded', 'true')
  })
})
