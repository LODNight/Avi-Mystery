import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SqlEditor } from './SqlEditor.jsx'

describe('SqlEditor Component Tests', () => {
  it('renders correctly with starter SQL value and ARIA label', () => {
    render(
      <SqlEditor
        value="SELECT * FROM sales;"
        onChange={vi.fn()}
        onRun={vi.fn()}
        onReset={vi.fn()}
      />
    )

    const textarea = screen.getByRole('textbox', { name: /khung soạn thảo câu lệnh sql/i })
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveValue('SELECT * FROM sales;')
    expect(screen.getByRole('button', { name: /chạy câu lệnh sql/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /đặt lại mã sql/i })).toBeInTheDocument()
  })

  it('triggers onChange when typing in textarea', () => {
    const handleChange = vi.fn()
    render(<SqlEditor value="SELECT " onChange={handleChange} />)

    const textarea = screen.getByRole('textbox', { name: /khung soạn thảo câu lệnh sql/i })
    fireEvent.change(textarea, { target: { value: 'SELECT * FROM airports;' } })

    expect(handleChange).toHaveBeenCalledWith('SELECT * FROM airports;')
  })

  it('triggers onRun when clicking Run button', () => {
    const handleRun = vi.fn()
    render(<SqlEditor value="SELECT 1;" onRun={handleRun} />)

    const runBtn = screen.getByRole('button', { name: /chạy câu lệnh sql/i })
    fireEvent.click(runBtn)

    expect(handleRun).toHaveBeenCalledOnce()
  })

  it('triggers onReset when clicking Reset button', () => {
    const handleReset = vi.fn()
    render(<SqlEditor value="SELECT 1;" onReset={handleReset} />)

    const resetBtn = screen.getByRole('button', { name: /đặt lại mã sql/i })
    fireEvent.click(resetBtn)

    expect(handleReset).toHaveBeenCalledOnce()
  })

  it('triggers onRun on Ctrl+Enter keyboard shortcut', () => {
    const handleRun = vi.fn()
    render(<SqlEditor value="SELECT 1;" onRun={handleRun} />)

    const textarea = screen.getByRole('textbox', { name: /khung soạn thảo câu lệnh sql/i })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })

    expect(handleRun).toHaveBeenCalledOnce()
  })

  it('handles Tab key by inserting 2 spaces', () => {
    const handleChange = vi.fn()
    render(<SqlEditor value="SELECT" onChange={handleChange} />)

    const textarea = screen.getByRole('textbox', { name: /khung soạn thảo câu lệnh sql/i })
    // Simulate selection position
    textarea.selectionStart = 6
    textarea.selectionEnd = 6

    fireEvent.keyDown(textarea, { key: 'Tab' })

    expect(handleChange).toHaveBeenCalledWith('SELECT  ')
  })

  it('disables input and buttons when disabled or isRunning is true', () => {
    render(<SqlEditor value="SELECT 1;" disabled isRunning />)

    const textarea = screen.getByRole('textbox', { name: /khung soạn thảo câu lệnh sql/i })
    expect(textarea).toBeDisabled()

    const runBtn = screen.getByRole('button', { name: /chạy câu lệnh sql/i })
    expect(runBtn).toBeDisabled()
  })
})
