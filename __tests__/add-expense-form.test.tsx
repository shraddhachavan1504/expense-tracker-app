import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AddExpenseForm } from '@/components/expenses/add-expense-form'

describe('AddExpenseForm', () => {
  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<AddExpenseForm onSubmit={() => {}} />)

    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(await screen.findByText(/date is required/i)).toBeInTheDocument()
    expect(screen.getByText(/category is required/i)).toBeInTheDocument()
    expect(screen.getByText(/amount is required/i)).toBeInTheDocument()
  })

  it('shows an error when amount is not a positive number', async () => {
    const user = userEvent.setup()
    render(<AddExpenseForm onSubmit={() => {}} />)

    await user.type(screen.getByLabelText(/amount/i), '-50')
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(await screen.findByText(/amount must be a positive number/i)).toBeInTheDocument()
  })

  it('calls onSubmit with the entered values when the form is valid', async () => {
    const handleSubmit = vi.fn()
    const user = userEvent.setup()
    render(<AddExpenseForm onSubmit={handleSubmit} />)

    await user.type(screen.getByLabelText(/date/i), '2026-08-15')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Groceries')
    await user.type(screen.getByLabelText(/amount/i), '450')
    await user.type(screen.getByLabelText(/description/i), 'Weekly shop')
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(handleSubmit).toHaveBeenCalledWith({
      date: '2026-08-15',
      category: 'Groceries',
      amount: 450,
      description: 'Weekly shop',
    })
  })

  it('clears the form after a successful submit', async () => {
    const user = userEvent.setup()
    render(<AddExpenseForm onSubmit={() => {}} />)

    await user.type(screen.getByLabelText(/date/i), '2026-08-15')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Groceries')
    await user.type(screen.getByLabelText(/amount/i), '450')
    await user.click(screen.getByRole('button', { name: /add expense/i }))

    expect(await screen.findByLabelText(/amount/i)).toHaveValue('')
  })
})