// frontend/src/components/TextBox.jsx
import React, { useRef, useEffect, useState } from 'react'

export default function TextBox({ data, onChange }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    // seleccionar todo el contenido para teclear inmediatamente
    if (window.getSelection) {
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(el)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }, [])

  const handleBlur = () => {
    const el = ref.current
    if (!el) return
    const { offsetLeft: x, offsetTop: y, offsetWidth: width, offsetHeight: height } = el
    onChange({ x, y, width, height, text: el.textContent })
  }

  return (
    <div
      ref={ref}
      className="text-box"
      style={{
        position: 'absolute',
        left:   `${data.x}px`,
        top:    `${data.y}px`,
        width:  `${data.width}px`,
        height: `${data.height}px`,
        color:  data.color || '#111827',
        cursor: 'text',
      }}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={data.placeholder || ''}
      onBlur={handleBlur}
    >
      {data.text}
    </div>
  )
}
