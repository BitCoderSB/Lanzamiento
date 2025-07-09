import dotenv from 'dotenv';
// Importa createRequire desde el módulo 'module'
import { createRequire } from 'module';

// Crea una función 'require' que puede importar módulos CommonJS en este contexto ESM
const require = createRequire(import.meta.url);
// Ahora usa la función 'require' para importar jsonwebtoken
const jwt = require('jsonwebtoken'); // <-- ¡CAMBIO CLAVE AQUÍ!

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;


export function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload debe contener { userId, username, iat, exp }
    req.userId   = payload.userId;
    req.username = payload.username;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}