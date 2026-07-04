'use client'

import * as React from 'react'
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react'

/**
 * Scroll-reveal wrapper: fades + slides up on first intersection, with an
 * optional per-index stagger via inline transitionDelay. The "hidden" class
 * is applied ONLY after client mount so users without JS see content
 * immediately (SSR outputs the fully-visible variant).
 */
export function EditableReveal({
  children,
  index = 0,
  stagger = 70,
  as: Tag = 'div',
  className = '',
  style,
}: {
  children: ReactNode
  index?: number
  stagger?: number
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const el = ref.current
    if (!el) return
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const state = !mounted ? '' : visible ? 'is-visible' : 'is-hidden'
  const combinedStyle: CSSProperties = { transitionDelay: `${index * stagger}ms`, ...style }

  const Component = Tag as any
  return (
    <Component
      ref={ref as any}
      className={`editable-reveal ${state} ${className}`.trim()}
      style={combinedStyle}
    >
      {children}
    </Component>
  )
}
