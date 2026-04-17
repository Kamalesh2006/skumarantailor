import React from 'react'
import { render } from '@/lib/test-utils'
import LogoLoading from '../LogoLoading'

describe('LogoLoading', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<LogoLoading />)
    
    // Check if the container element is rendered
    expect(container.firstChild).toBeInTheDocument()
    
    // Check if the Tailwind classes are applied correctly
    expect(container.firstChild).toHaveClass('relative', 'flex', 'items-center', 'justify-center')
  })

  it('applies custom size to TailorIcon', () => {
    render(<LogoLoading size={64} />)
    // The component renders an img tag internally via TailorIcon
    const imgElement = document.querySelector('img')
    expect(imgElement).toBeInTheDocument()
    expect(imgElement).toHaveAttribute('width', '64')
    expect(imgElement).toHaveAttribute('height', '64')
  })

  it('applies custom className', () => {
    const { container } = render(<LogoLoading className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
