import React from 'react'
import { render } from '@/lib/test-utils'
import TailorIcon from '../TailorIcon'

describe('TailorIcon', () => {
  it('renders correctly with default size', () => {
    // next/image renders an img tag
    render(<TailorIcon />)
    const imgElement = document.querySelector('img')
    expect(imgElement).toBeInTheDocument()
    expect(imgElement).toHaveAttribute('width', '24')
    expect(imgElement).toHaveAttribute('height', '24')
  })

  it('applies custom size and invert prop', () => {
    render(<TailorIcon size={32} invertForDark={true} />)
    const imgElement = document.querySelector('img')
    expect(imgElement).toBeInTheDocument()
    expect(imgElement).toHaveAttribute('width', '32')
    expect(imgElement).toHaveAttribute('height', '32')
  })
})
