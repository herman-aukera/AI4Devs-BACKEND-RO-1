import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { uploadFile } from './application/services/fileUploadService';
import candidateRoutes from './routes/candidateRoutes';
import kanbanRoutes from './routes/kanbanRoutes';

// Extender la interfaz Request para incluir prisma
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}
const prisma = new PrismaClient();

export const app = express();
export default app;

// Middleware para parsear JSON. Asegúrate de que esto esté antes de tus rutas.
app.use(express.json());

// Middleware para adjuntar prisma al objeto de solicitud
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Middleware para permitir CORS desde http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Import and use kanban routes first (more specific routes should come before generic ones)
app.use('/', kanbanRoutes);

// Import and use candidateRoutes
app.use('/candidates', candidateRoutes);

// Route for file uploads
app.post('/upload', uploadFile);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

const port = 3010;

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain');
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
