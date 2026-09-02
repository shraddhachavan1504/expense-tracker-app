import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { SpendingChat } from '@/components/chat/spending-chat'
import { mockChatFetch, buildTextStreamBody } from './mocks/chat-handlers'

describe('SpendingChat', () => {
  it('renders the input box and a disabled Send button when empty', () => {
    render(<SpendingChat expenses={[]} />)

    expect(screen.getByPlaceholderText(/ask about your spending/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('enables the Send button once text is typed', async () => {
    const user = userEvent.setup()
    render(<SpendingChat expenses={[]} />)

    const textarea = screen.getByPlaceholderText(/ask about your spending/i)
    await user.type(textarea, 'How much did I spend on food?')

    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled()
  })

  it('shows the thinking indicator while waiting for a response', async () => {
    mockChatFetch({ delayMs: 1000, body: '' })
    const user = userEvent.setup()
    render(<SpendingChat expenses={[]} />)

    const textarea = screen.getByPlaceholderText(/ask about your spending/i)
    await user.type(textarea, 'How much did I spend on food?')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByRole('status', { name: /assistant is thinking/i })).toBeInTheDocument()
  })

  it('renders the streamed assistant reply as text', async () => {
    mockChatFetch({ body: buildTextStreamBody('You spent a total of 4680 on food.') })
    const user = userEvent.setup()
    render(<SpendingChat expenses={[]} />)

    const textarea = screen.getByPlaceholderText(/ask about your spending/i)
    await user.type(textarea, 'How much did I spend on food?')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByText(/you spent a total of 4680 on food/i)).toBeInTheDocument()
  })
    it('shows an error message with a retry button when the request fails', async () => {
    mockChatFetch({ status: 500 })
    const user = userEvent.setup()
    render(<SpendingChat expenses={[]} />)

    const textarea = screen.getByPlaceholderText(/ask about your spending/i)
    await user.type(textarea, 'How much did I spend on food?')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry last message/i })).toBeInTheDocument()
  })
})