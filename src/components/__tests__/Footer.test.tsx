import React from 'react'
import { render, screen } from '@/lib/test-utils'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders correctly', () => {
    // Note: English translation fallback for "app.name" needs to be either mocked or exist in translation
    // In our test-utils LanguageProvider defaults are used.
    render(<Footer />)
    
    // Check if the current year is rendered
    const currentYear = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(currentYear, 'i'))).toBeInTheDocument()

    // Check if the contact information is rendered
    expect(screen.getByText('+91 94428 98544')).toBeInTheDocument()
    expect(screen.getByText('skumarantailorscuddalore@gmail.com')).toBeInTheDocument()
    expect(screen.getByText('Cuddalore, Tamil Nadu')).toBeInTheDocument()
    
    // Check if links are correct
    expect(screen.getByText('+91 94428 98544').closest('a')).toHaveAttribute('href', 'tel:+919442898544')
    expect(screen.getByText('skumarantailorscuddalore@gmail.com').closest('a')).toHaveAttribute('href', 'mailto:skumarantailorscuddalore@gmail.com')
  })
})
