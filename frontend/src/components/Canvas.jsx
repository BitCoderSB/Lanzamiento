import React, { useState, forwardRef, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos

export default forwardRef(({
  elements = [],
  onAdd,
  onMove,
  onRemove,
  onSelectText,
  tool = 'select',
  drawColor = '#1e3a8a',
  className = ''
}, ref) => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pathPoints, setPathPoints] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pointerGuide, setPointerGuide] = useState(null);
  const lastAddedId = useRef(null);
  const SMOOTHING = 0.3;

  // Resetea el estado de dibujo al cambiar de herramienta
  useEffect(() => {
    setDragging(false);
    setPreview(null);
    setPathPoints([]);
    setSelectedId(null);
    lastAddedId.current = null;
  }, [tool]);

  // Normaliza las coordenadas del puntero a un sistema 0-100% del SVG
  const toNorm = e => {
    const r = ref.current.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * 100) / r.width,
      y: ((e.clientY - r.top) * 100) / r.height,
    };
  };

  // Maneja el evento de presionar el puntero
  const handlePointerDown = e => {
    e.target.setPointerCapture(e.pointerId);
    const pos = toNorm(e);
    setPointerGuide(pos);

    const rect = ref.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    if (tool === 'select') {
      return;
    }

    if (tool === 'text') {
      onSelectText({
        x: xPx - 5,
        y: yPx + 50,
        color: drawColor,
        width: 150,
        height: 40,
        focus: true
      });
      return;
    }

    if (tool === 'pencil') {
      setDragging(true);
      setPathPoints([pos]);
      return;
    }

    if (['circle', 'triangle', 'square'].includes(tool)) {
      setDragging(true);
      if (!preview) {
        const newPreviewId = uuidv4(); 
        setPreview({
          id: newPreviewId,
          type: tool,
          x0: pos.x, y0: pos.y,
          x1: pos.x, y1: pos.y,
          color: drawColor
        });
      }
    }
  };

  // Maneja el evento de mover el puntero
  const handlePointerMove = e => {
    const pos = toNorm(e);
    setPointerGuide(pos);

    if (!dragging) return;

    if (tool === 'pencil') {
      setPathPoints(prev => [...prev, pos]);
    }
    else if (preview) {
      setPreview(prev => ({ ...prev, x1: pos.x, y1: pos.y }));
    }
    else if (tool === 'select' && selectedId) {
      onMove({ id: selectedId, x: pos.x - offset.x, y: pos.y - offset.y });
    }
  };

  // Maneja el evento de soltar el puntero
  const handlePointerUp = e => {
    e.target.releasePointerCapture(e.pointerId);

    if (dragging) {
      if (tool === 'pencil' && pathPoints.length > 1) {
        const newEl = {
          id: uuidv4(),
          type: 'pencil',
          points: pathPoints,
          color: drawColor
        };
        onAdd(newEl);
        setPathPoints([]);
      }
      else if (preview) {
        onAdd(preview); 
        setPreview(null);
      }
    }

    lastAddedId.current = null;
    setDragging(false);
    setSelectedId(null);
  };

  // Suaviza los puntos de un trazo de lápiz
  const getSmoothed = pts => {
    if (!pts.length) return [];
    const sm = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const prev = sm[i - 1], curr = pts[i];
      sm.push({
        x: prev.x + (curr.x - prev.x) * SMOOTHING,
        y: prev.y + (curr.y - prev.y) * SMOOTHING
      });
    }
    return sm;
  };

  // Renderiza un elemento SVG individual
  const renderElement = el => {
    const sw = 0.3;
    const stroke = el.color || drawColor;

    switch (el.type) {
      case 'square': {
        const w = el.x1 - el.x0;
        const h = el.y1 - el.y0;
        const size = Math.min(Math.abs(w), Math.abs(h)) * (w < 0 ? -1 : 1);
        return (
          <rect key={el.id}
            x={el.x0} y={el.y0}
            width={size} height={size}
            fill="none"
            stroke={stroke}
            strokeWidth={sw} />
        );
      }
      case 'circle': {
        const r = Math.hypot(el.x1 - el.x0, el.y1 - el.y0) / 2;
        return (
          <circle key={el.id}
            cx={(el.x0 + el.x1) / 2}
            cy={(el.y0 + el.y1) / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={sw} />
        );
      }
      case 'triangle':
        return (
          <polygon key={el.id}
            points={`${el.x0},${el.y1} ${(el.x0 + el.x1) / 2},${el.y0} ${el.x1},${el.y1}`}
            fill="none"
            stroke={stroke}
            strokeWidth={sw} />
        );
      case 'pencil': {
        const smooth = getSmoothed(el.points);
        const ptsStr = smooth.map(p => `${p.x},${p.y}`).join(' ');
        return (
          <polyline key={el.id}
            points={ptsStr}
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
            strokeLinecap="round" />
        );
      }
      case 'text': {
        // Calcula el tamaño de la fuente dinámicamente
        const fontSize = Math.max(0.5, Math.min(el.width / el.text.length * 2 || 1, el.height));
        return (
          <text
            key={el.id}
            x={el.x}
            y={el.y + (el.height / 2)}
            fontSize={`${fontSize}px`}
            fill={el.color} // Usa el color del elemento
            dominantBaseline="middle"
            textAnchor="start"
            style={{ whiteSpace: 'pre', cursor: 'text' }}
            // onClick={() => onSelectText({ x: el.x, y: el.y, ...el, focus: true })} // Descomentar para re-editar al clic
          >
            {el.text}
          </text>
        );
      }
      default:
        return null;
    }
  };

  // Renderiza el trazo de lápiz en vivo mientras se está dibujando
  const renderLive = () => {
    if (tool !== 'pencil' || pathPoints.length < 2) return null;
    const smooth = getSmoothed(pathPoints);
    const ptsStr = smooth.map(p => `${p.x},${p.y}`).join(' ');
    return (
      <polyline points={ptsStr}
        fill="none"
        stroke={drawColor}
        strokeWidth={0.3}
        strokeLinejoin="round"
        strokeLinecap="round" />
    );
  };

  return (
    <svg ref={ref}
      className={className}
      width="100%" height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ background: '#f3f4f6', cursor: tool === 'select' ? 'move' : 'crosshair' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}>

      <defs>
        <pattern id="smallGrid" width="1" height="1" patternUnits="userSpaceOnUse">
          <path d="M1 0 L0 0 0 1" fill="none" stroke="#e5e7eb" strokeWidth="0.1" />
        </pattern>
        <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill="url(#smallGrid)" />
          <path d="M5 0 L0 0 0 5" fill="none" stroke="#d1d5db" strokeWidth="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {elements.map(renderElement)}

      {['circle', 'triangle', 'square'].includes(tool) && preview && renderElement(preview)}

      {renderLive()}

      {pointerGuide && (
        <circle cx={pointerGuide.x}
          cy={pointerGuide.y}
          r={0.4}
          fill="red" />
      )}
    </svg>
  );
});