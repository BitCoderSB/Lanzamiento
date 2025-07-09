// frontend/src/hooks/useBoard.js
import { useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';


export function useBoard(boardIdParam) {
  const [elements, setElements]   = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);

  const API   = 'https://backend-8dew.onrender.com/';
  const token = localStorage.getItem('token') || '';
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  // --- SANITIZAR boardIdParam AQUÍ ---
  // Eliminar cualquier carácter que no sea alfanumérico o guiones/guiones bajos
  // y cualquier sufijo como ":1"
  const cleanBoardId = boardIdParam ? boardIdParam.replace(/[^a-zA-Z0-9_-]/g, '').split(':')[0] : '';
  // LOG DEPURACIÓN: Ver el boardId después de la limpieza
  useEffect(() => {
    console.log("[useBoard] boardId recibido como parámetro (limpio):", cleanBoardId);
  }, [cleanBoardId]);
  // --- FIN SANITIZACIÓN ---


  // 1) GET inicial de la pizarra (crea si no existe)
  useEffect(() => {
    // Usamos cleanBoardId en lugar de boardIdParam
    const fetchUrl = `${API}/boards/${cleanBoardId}`;
    console.log("[useBoard] URL construida para fetch (con ID limpio):", fetchUrl);

    fetch(fetchUrl, {
      method: 'GET',
      headers: authHeaders
    })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text(); 
          throw new Error(`Error cargando pizarra (${res.status}): ${errorText}`);
        }
        return res.json();
      })
      .then(board => {
        setElements(board.elements || []);
      })
      .catch(err => {
        console.error('useBoard GET (Error en fetch):', err);
      });
  }, [API, cleanBoardId, token]); // Usamos cleanBoardId en las dependencias

  // 2) WebSocket: unirse a sala y escuchar eventos
  useEffect(() => {
    const socketBaseUrl = 'https://backend-8dew.onrender.com/';
    console.log("[useBoard] URL base para socket:", socketBaseUrl);

    socket.auth = { token };
    socket.connect();
    socket.emit('joinBoard', cleanBoardId); // Usamos cleanBoardId aquí

    socket.on('board:init', initial => {
      setElements(initial);
    });

    socket.on('board:add', el => {
      setElements(prev => {
        if (prev.some(existingEl => existingEl.id === el.id)) {
            return prev.map(e => (e.id === el.id ? e : e)); 
        }
        return [...prev, el];
      });
    });

    socket.on('board:update', upd => {
      setElements(prev => {
        if (!prev.some(existingEl => existingEl.id === upd.elementId)) {
            // Elemento no encontrado para actualizar
        }
        return prev.map(e => (e.id === upd.elementId ? { ...e, ...upd } : e));
      });
    });

    socket.on('board:remove', id => {
      setElements(prev => prev.filter(e => e.id !== id));
    });

    return () => {
      socket.off('board:init');
      socket.off('board:add');
      socket.off('board:update');
      socket.off('board:remove');
      socket.disconnect();
    };
  }, [cleanBoardId, token, API]); // Usamos cleanBoardId en las dependencias

  // 3) Función que persiste todo el estado al backend
  const persist = useCallback(newElements => {
    fetch(`${API}/boards/${cleanBoardId}/elements`, { // Usamos cleanBoardId aquí
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ elements: newElements })
    }).catch(err => console.error('useBoard PUT:', err));
  }, [API, cleanBoardId, token]);

  // 4a) Añadir elemento: local + WS + BD
  const addElement = useCallback(el => {
    setElements(prev => {
      if (prev.some(existingEl => existingEl.id === el.id)) {
        return prev.map(e => (e.id === el.id ? e : e)); 
      }
      const next = [...prev, el];
      persist(next);
      return next;
    });
    socket.emit('board:add', { boardId: cleanBoardId, element: el }); // Usamos cleanBoardId aquí
  }, [cleanBoardId, persist]);

  // 4b) Actualizar elemento
  const updateElement = useCallback(update => {
    setElements(prev => {
      const next = prev.map(e =>
        e.id === update.id ? { ...e, ...update } : e
      );
      persist(next);
      return next;
    });
    socket.emit('board:update', {
      boardId: cleanBoardId, // Usamos cleanBoardId aquí
      elementId: update.id,
      ...update
    });
  }, [cleanBoardId, persist]);

  // 4c) Eliminar elemento
  const removeElement = useCallback(id => {
    setElements(prev => {
      const next = prev.filter(e => e.id !== id);
      persist(next);
      return next;
    });
    socket.emit('board:remove', { boardId: cleanBoardId, elementId: id }); // Usamos cleanBoardId aquí
  }, [cleanBoardId, persist]);

  // 5) TextBoxes (solo en cliente)
  const addTextBox = useCallback(box => {
    setTextBoxes(prev => [...prev, box]);
  }, []);

  const updateTextBox = useCallback((id, props) => {
    setTextBoxes(prev =>
      prev.map(tb => (tb.id === id ? { ...tb, ...props } : tb))
    );
  }, []);

  return {
    elements,
    textBoxes,
    addElement,
    updateElement,
    removeElement,
    addTextBox,
    updateTextBox
  };
}