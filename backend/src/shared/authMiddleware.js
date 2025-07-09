// backend/src/shared/authMiddleware.js
import dotenv from 'dotenv';

const JWT_SECRET = process.env.JWT_SECRET;

// Usar import() dinámico para jsonwebtoken
let jwt;
(async () => {
  jwt = await import('jsonwebtoken');
  // Si jwt no es el objeto esperado, podría ser jwt.default
  // Depende de cómo jsonwebtoken exporte.
  // Podrías necesitar: jwt = (await import('jsonwebtoken')).default;
})();


export function verifyJwt(req, res, next) {
  // Asegúrate de que jwt esté definido antes de usarlo
  if (!jwt) {
    return res.status(500).json({ error: 'JWT module not loaded yet' });
  }

  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId   = payload.userId;
    req.username = payload.username;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}