import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../services/socket'
import Toolbar from '../components/Toolbar'
import Canvas from '../components/Canvas'
import TextBox from '../components/TextBox'
import ChatSidebar from '../components/ChatSidebar'
import { useBoard } from '../hooks/useBoard'
import { useChat } from '../hooks/useChat'
import { useHandPointer } from '../hooks/useHandPointer'
import { v4 as uuidv4 } from 'uuid';

export default function BoardView() {
  const { boardId } = useParams()
  const {
    elements, textBoxes,
    addElement, updateElement, removeElement,
    addTextBox, updateTextBox
  } = useBoard(boardId)

  const [userName, setUserName] = useState('')
  useEffect(() => {
    if (socket.connected) setUserName(socket.id)
    else socket.on('connect', () => setUserName(socket.id))
  }, [])

  const { messages, sendMessage } = useChat(boardId, userName)
  const [tool, setTool]         = useState('select')
  const [color, setColor]       = useState('#3b82f6')
  const [chatOpen, setChatOpen] = useState(false)

  const [gesturesEnabled, setGesturesEnabled] = useState(false)
  const videoRef = useRef(null)
  const svgRef   = useRef(null)

  const handleHandPointerReady = useCallback(ctrl => {
    if (ctrl && typeof ctrl.hidePreview === 'function') {
      ctrl.hidePreview();
    } else {
      if (videoRef.current) {
        videoRef.current.style.display = 'none';
      }
    }
  }, [videoRef]);

  useHandPointer({
    videoRef,
    svgRef,
    enabled: gesturesEnabled,
    onReady: handleHandPointerReady
  })

  useEffect(() => {
    const onKey = e => {
      if (e.key.toLowerCase() === 'v' && gesturesEnabled) {
        if (videoRef.current) {
          videoRef.current.style.display =
            videoRef.current.style.display === 'none' ? 'block' : 'none'
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [gesturesEnabled])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      <Toolbar
        tool={tool}
        onToolSelect={setTool}
        currentColor={color}
        onColorChange={setColor}
        onToggleChat={() => setChatOpen(o => !o)}
        gesturesEnabled={gesturesEnabled}
        onToggleGestures={setGesturesEnabled}
      />

      <div className="relative flex-1">
        {gesturesEnabled && (
          <video
            ref={videoRef}
            muted playsInline
            className="fixed bottom-4 right-4 w-40 h-28 border-2 border-blue-600 rounded z-50"
          />
        )}

        <Canvas
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          elements={elements}
          onAdd={el => addElement({ ...el, color })}
          onMove={updateElement}
          onRemove={removeElement}
          onSelectText={pos => {
            // Generar el ID una vez para el textbox y el elemento eventual
            const tempTextId = uuidv4(); 
            
            // Solo se crea el overlay (TextBox) para que el usuario pueda escribir.
            // El elemento de texto en el Canvas/DB se añade cuando el usuario escribe algo.
            addTextBox({
              id: tempTextId,
              type: 'text',
              x: pos.x,
              y: pos.y,
              width: 15,
              height: 5,
              text: '',
              placeholder: 'Escribe algo…',
              color
            });

            setTool('select');
          }}
          tool={tool}
          drawColor={color}
        />

        {textBoxes.map(box => (
          <TextBox
            key={box.id}
            data={box}
            onChange={props => {
              updateTextBox(box.id, props);

              // Eliminar si el texto está vacío
              if (props.text.trim() === '') {
                  removeElement(box.id);
                  updateTextBox(box.id, { deleted: true }); // Para gestionar el overlay
              } else {
                  // Añadir o actualizar el elemento en el Canvas/DB
                  const existingEl = elements.find(el => el.id === box.id);
                  if (!existingEl) {
                      addElement({
                          id: box.id,
                          type: 'text',
                          x: props.x ?? box.x,
                          y: props.y ?? box.y,
                          width: props.width ?? box.width,
                          height: props.height ?? box.height,
                          text: props.text,
                          color: props.color ?? box.color
                      });
                  } else {
                      updateElement({
                          id: box.id,
                          type: 'text',
                          x: props.x ?? box.x,
                          y: props.y ?? box.y,
                          width: props.width ?? box.width,
                          height: props.height ?? box.height,
                          text: props.text,
                          color: props.color ?? box.color
                      });
                  }
              }
            }}
          />
        ))}
      </div>

      {chatOpen && (
        <ChatSidebar
          messages={messages}
          onSend={sendMessage}
          onClose={() => setChatOpen(false)}
          currentUser={userName}
        />
      )}
    </div>
  )
}