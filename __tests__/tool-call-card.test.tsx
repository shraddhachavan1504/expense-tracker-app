import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ToolCallCard } from '@/components/chat/tool-call-card'

describe('ToolCallCard', () => {
  it('shows a deciding message while input is streaming', () => {
    render(<ToolCallCard part={{ state: 'input-streaming' } as any} />)

    expect(screen.getByText(/deciding what to look up/i)).toBeInTheDocument()
  })

  it('shows the specific category being looked up', () => {
    render(
      <ToolCallCard
        part={{ state: 'input-available', input: { category: 'Food' } } as any}
      />
    )

    expect(screen.getByText(/looking up/i)).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('falls back to "all categories" when no category is specified', () => {
    render(<ToolCallCard part={{ state: 'input-available', input: {} } as any} />)

    expect(screen.getByText(/all categories/i)).toBeInTheDocument()
  })

  it('shows an error message when the tool fails', () => {
    render(
      <ToolCallCard
        part={{ state: 'output-error', errorText: 'Failed to fetch expenses' } as any}
      />
    )

    expect(screen.getByText(/couldn't complete that lookup/i)).toBeInTheDocument()
    expect(screen.getByText(/failed to fetch expenses/i)).toBeInTheDocument()
  })

  it('renders a breakdown table when results are available', () => {
    render(
      <ToolCallCard
        part={{
          state: 'output-available',
          output: {
            category: 'Food',
            totalSpent: 1200,
            transactionCount: 2,
            transactions: [
              { date: '2026-08-01', description: 'Zomato', amount: 450 },
              { date: '2026-08-05', description: 'Big Bazaar', amount: 750 },
            ],
          },
        } as any}
      />
    )

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText(/₹1200\.00/)).toBeInTheDocument()
    expect(screen.getByText('Zomato')).toBeInTheDocument()
    expect(screen.getByText('Big Bazaar')).toBeInTheDocument()
  })

  it('shows a no-transactions message when the category is empty', () => {
    render(
      <ToolCallCard
        part={{
          state: 'output-available',
          output: { category: 'Travel', totalSpent: 0, transactionCount: 0, transactions: [] },
        } as any}
      />
    )

    expect(screen.getByText(/no transactions found for/i)).toBeInTheDocument()
    expect(screen.getByText('Travel')).toBeInTheDocument()
  })
})