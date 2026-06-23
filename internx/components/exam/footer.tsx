import React from 'react'
import Image from 'next/image'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`ix-footer ${className}`}>
      <span className="ix-footer-text">Powered by</span>
      <Image src="/hackboats-logo.png" alt="HackBoats" className="ix-footer-logo" width={100} height={20} />
    </footer>
  )
}
