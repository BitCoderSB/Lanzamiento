import { useState, useEffect, useCallback } from 'react';
import { socket } from '../services/socket';


export function useBoard(boardIdParam) { // Renombramos 'boardId' a 'boardIdParam' para mayor claridad
  const [elements, setElements]   = useState([]);
  const [textBoxes, setTextBoxes] = useState([]);

  // Base URL del backend
  // IMPORTANTE: El fallback DEBE ser localhost:3000 para desarrollo local.
  // Vite reemplaza 'import.meta.env.VITE_BACKEND_URL' con la URL de Render en producción.
  const API   = import.meta.env.VITE_BACKEND_URL || 'https://backend-8dew.onrender.com/'; // <-- CORREGIDO AQUÍ
  const token = localStorage.getItem('token') || '';
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  // LOG DEPURACIÓN: Ver el boardId recibido de useParams
  useEffect(() => {
    console.log("[useBoard] boardId recibido como parámetro:", boardIdParam);
  }, [boardIdParam]);

  // 1) GET inicial de la pizarra (crea si no existe)
  useEffect(() => {
    // LOG DEPURACIÓN: Ver la URL exacta que se construye para el fetch
    const fetchUrl = `${API}/boards/${boardIdParam}`;
    console.log("[useBoard] URL construida para fetch:", fetchUrl);

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
  }, [API, boardIdParam, token]); // Asegúrate de usar boardIdParam en las dependencias

  // 2) WebSocket: unirse a sala y escuchar eventos
  useEffect(() => {
    // LOG DEPURACIÓN: Ver la URL que se construye para el socket
    // socket.js ya usa la variable global URL que toma de import.meta.env.VITE_BACKEND_URL
    // si no se le pasa una URL explícita a io().
    const socketBaseUrl = import.meta.env.VITE_BACKEND_URL || 'https://backend-8dew.onrender.com/';
    console.log("[useBoard] URL base para socket:", socketBaseUrl);

    socket.auth = { token };
    socket.connect();
    socket.emit('joinBoard', boardIdParam); // Usamos boardIdParam aquí

    socket.on('board:init', initial => {
      setElements(initial);
    });

    socket.on('board:add', el => {
      setElements(prev => {
        // Manejo de ID duplicado: reemplazar si ya existe en lugar de añadir
        if (prev.some(existingEl => existingEl.id === el.id)) {
            return prev.map(e => (e.id === el.id ? e : e)); 
        }
        return [...prev, el];
      });
    });

    socket.on('board:update', upd => {
      setElements(prev => {
        // Asegurarse de que el elemento exista antes de actualizar
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
  }, [boardIdParam, token, API]); // API también es una dependencia aquí, por consistencia.

  // 3) Función que persiste todo el estado al backend
  const persist = useCallback(newElements => {
    fetch(`${API}/boards/${boardIdParam}/elements`, { // Usamos boardIdParam aquí
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ elements: newElements })
    }).catch(err => console.error('useBoard PUT:', err));
  }, [API, boardIdParam, token]);

  // 4a) Añadir elemento: local + WS + BD
  const addElement = useCallback(el => {
    setElements(prev => {
      // Manejo de ID duplicado: reemplazar si ya existe en lugar de añadir
      if (prev.some(existingEl => existingEl.id === el.id)) {
        return prev.map(e => (e.id === el.id ? e : e)); 
      }
      const next = [...prev, el];
      persist(next);
      return next;
    });
    socket.emit('board:add', { boardId: boardIdParam, element: el }); // Usamos boardIdParam aquí
  }, [boardIdParam, persist]);

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
      boardId: boardIdParam, // Usamos boardIdParam aquí
      elementId: update.id,
      ...update
    });
  }, [boardIdParam, persist]);

  // 4c) Eliminar elemento
  const removeElement = useCallback(id => {
    setElements(prev => {
      const next = prev.filter(e => e.id !== id);
      persist(next);
      return next;
    });
    socket.emit('board:remove', { boardId: boardIdParam, elementId: id }); // Usamos boardIdParam aquí
  }, [boardIdParam, persist]);

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