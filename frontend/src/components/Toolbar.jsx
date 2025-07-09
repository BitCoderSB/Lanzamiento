import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Toolbar({
  tool,
  onToolSelect,
  currentColor,
  onColorChange,
  onToggleChat,
  gesturesEnabled,
  onToggleGestures
}) {
  const [shapesOpen, setShapesOpen] = useState(false)
  const [colorOpen, setColorOpen]   = useState(false)
  const shapesBtnRef     = useRef(null)
  const shapesPopoverRef = useRef(null)
  const colorBtnRef      = useRef(null)
  const colorPopoverRef  = useRef(null)

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        shapesOpen &&
        shapesBtnRef.current &&
        shapesPopoverRef.current &&
        !shapesBtnRef.current.contains(e.target) &&
        !shapesPopoverRef.current.contains(e.target)
      ) setShapesOpen(false)

      if (
        colorOpen &&
        colorBtnRef.current &&
        colorPopoverRef.current &&
        !colorBtnRef.current.contains(e.target) &&
        !colorPopoverRef.current.contains(e.target)
      ) setColorOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [shapesOpen, colorOpen])

  const renderPopover = (anchorRef, isOpen, popoverRef, children) => {
    if (!isOpen || !anchorRef.current) return null
    const rect = anchorRef.current.getBoundingClientRect()
    const style = {
      position: 'absolute',
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX,
      zIndex: 1000
    }
    return createPortal(
      <div ref={popoverRef} style={style} className="bg-white p-3 shadow-lg rounded-xl flex space-x-2">
        {children}
      </div>,
      document.body
    )
  }

  return (
    <div className="toolbar flex items-center space-x-3 p-2 bg-gray-200">
      {/* Toggle gestos de mano */}
      <label className="flex items-center space-x-1">
        <input
          type="checkbox"
          checked={gesturesEnabled}
          onChange={e => onToggleGestures(e.target.checked)}
          className="toggle-checkbox"
        />
        <span className="text-sm select-none">Gestos</span>
      </label>

      {/* — Resto de botones sin cambios — */}
      <button className={`toolbar-btn ${tool==='text'?'active':''}`} onClick={()=>onToolSelect('text')} title="Texto">T</button>
      <button className={`toolbar-btn ${tool==='select'?'active':''}`} onClick={()=>onToolSelect('select')} title="Seleccionar">🖐️</button>

      {/* Shapes */}
      <div ref={shapesBtnRef} className="inline-block">
        <button className={`toolbar-btn ${['square','circle','triangle'].includes(tool)?'active':''}`}
                onClick={()=>setShapesOpen(o=>!o)} title="Figuras">◼️</button>
        {renderPopover(shapesBtnRef, shapesOpen, shapesPopoverRef,
          <>
            <button className="toolbar-btn" onClick={()=>{onToolSelect('square'); setShapesOpen(false)}} title="Cuadrado">◻️</button>
            <button className="toolbar-btn" onClick={()=>{onToolSelect('circle'); setShapesOpen(false)}} title="Círculo">⚪</button>
            <button className="toolbar-btn" onClick={()=>{onToolSelect('triangle'); setShapesOpen(false)}} title="Triángulo">△</button>
          </>
        )}
      </div>

      {/* Pencil */}
      <button className={`toolbar-btn ${tool==='pencil'?'active':''}`} onClick={()=>onToolSelect('pencil')} title="Lápiz">🖊️</button>

      {/* Color */}
      <div ref={colorBtnRef} className="inline-block">
        <button className="toolbar-btn" onClick={()=>setColorOpen(o=>!o)} title="Color" style={{ color: currentColor }}>🎨</button>
        {renderPopover(colorBtnRef, colorOpen, colorPopoverRef,
          <input type="color" value={currentColor}
                 onChange={e=>{ onColorChange(e.target.value); setColorOpen(false) }}
                 title="Elige un color"
                 style={{ width:32, height:32, border:'none', padding:0 }} />
        )}
      </div>

      <div style={{ flexGrow: 1 }} />

      <button className="toolbar-btn" onClick={()=>onToolSelect('zoomIn')} title="Zoom In">🔍+</button>
      <button className="toolbar-btn" onClick={()=>onToolSelect('zoomOut')} title="Zoom Out">🔍–</button>
      <button className="toolbar-btn" onClick={onToggleChat} title="Abrir chat">💬</button>
    </div>
  )
}
