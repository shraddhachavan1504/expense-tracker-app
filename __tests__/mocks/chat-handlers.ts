import { vi } from 'vitest'

export function mockChatFetch(options: {
  status?: number
  body?: string
  delayMs?: number
}) {
  global.fetch = vi.fn().mockImplementation(async () => {
    if (options.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs))
    }

    if (options.status && options.status >= 400) {
      return new Response(null, { status: options.status })
    }

    return new Response(options.body ?? '', {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  })
}

// Builds a minimal but valid UI-message-stream body matching what
// route.ts actually sends (confirmed from a real Network tab capture):
// start -> start-step -> text-start -> text-delta(s) -> text-end ->
// finish-step -> finish -> [DONE].
export function buildTextStreamBody(fullText: string): string {
  const lines: string[] = [
    `data: {"type":"start"}`,
    `data: {"type":"start-step"}`,
    `data: {"type":"text-start","id":"txt-0"}`,
  ]

  // Split into words so it behaves like a real token-by-token stream,
  // not one giant delta.
  for (const word of fullText.split(' ')) {
    lines.push(`data: {"type":"text-delta","id":"txt-0","delta":${JSON.stringify(word + ' ')}}`)
  }

  lines.push(
    `data: {"type":"text-end","id":"txt-0"}`,
    `data: {"type":"finish-step"}`,
    `data: {"type":"finish","finishReason":"stop"}`,
    `data: [DONE]`
  )

  // Real SSE format: each "data: ..." line followed by a blank line.
  return lines.map((line) => line + '\n\n').join('')
}