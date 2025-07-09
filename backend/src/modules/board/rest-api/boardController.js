import {
  findBoardById,
  createBoard,
  upsertElement,
  updateElements,
  deleteElement
} from '../persistence/boardRepository.js';

export async function getBoard(req, res, next) {
  try {
    const { id } = req.params;
    // Sanitizar el ID de la pizarra para eliminar sufijos inesperados como ":1"
    const cleanId = id ? id.replace(/:\d+$/, '') : '';
    console.log(`[Backend-Controller] ID de pizarra recibido: '${id}', ID sanitizado: '${cleanId}'`); // Log para depuración

    let board = await findBoardById(cleanId); // Usar el ID sanitizado para buscar la pizarra
    if (!board) {
      await createBoard(cleanId); // Usar el ID sanitizado para crear la pizarra si no existe
      board = { _id: cleanId, elements: [] };
    }
    res.json({ id: board._id, elements: board.elements });
  } catch (err) {
    next(err);
  }
}

export async function createBoardElement(req, res, next) {
  try {
    const { boardId } = req.params;
    // Sanitizar boardId al recibirlo para las operaciones
    const cleanBoardId = boardId ? boardId.replace(/:\d+$/, '') : '';
    const { element } = req.body;
    if (!element || !element.id) {
      return res.status(400).json({ error: 'element.id es requerido' });
    }
    await upsertElement(cleanBoardId, element); // Usar el ID sanitizado
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function updateBoardElements(req, res, next) {
  try {
    const { boardId } = req.params;
    // Sanitizar boardId al recibirlo para las operaciones
    const cleanBoardId = boardId ? boardId.replace(/:\d+$/, '') : '';
    const { elements } = req.body;
    if (!Array.isArray(elements)) {
      return res.status(400).json({ error: 'elements debe ser un array' });
    }
    await updateElements(cleanBoardId, elements); // Usar el ID sanitizado
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function removeBoardElement(req, res, next) {
  try {
    const { boardId } = req.params;
    // Sanitizar boardId al recibirlo para las operaciones
    const cleanBoardId = boardId ? boardId.replace(/:\d+$/, '') : '';
    const { elementId } = req.params;
    await deleteElement(cleanBoardId, elementId); // Usar el ID sanitizado
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}