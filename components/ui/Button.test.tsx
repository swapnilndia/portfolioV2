import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders with label', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    expect(getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('triggers onClick handler', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>)
    const button = getByRole('button', { name: 'Click me' })
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies proper classes for variants', () => {
    const { container, rerender } = render(<Button variant="primary">Button</Button>)
    expect(container.firstChild).toHaveClass('btn--primary')

    rerender(<Button variant="secondary">Button</Button>)
    expect(container.firstChild).toHaveClass('btn--secondary')

    rerender(<Button variant="ghost">Button</Button>)
    expect(container.firstChild).toHaveClass('btn--ghost')
  })

  it('applies proper classes for sizes', () => {
    const { container, rerender } = render(<Button size="sm">Button</Button>)
    expect(container.firstChild).toHaveClass('btn--sm')

    rerender(<Button size="md">Button</Button>)
    expect(container.firstChild).toHaveClass('btn--md')

    rerender(<Button size="lg">Button</Button>)
    expect(container.firstChild).toHaveClass('btn--lg')
  })

  it('can be disabled', () => {
    const { getByRole } = render(<Button disabled>Button</Button>)
    const button = getByRole('button')
    expect(button).toBeDisabled()
  })
})
