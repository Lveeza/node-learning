import express from 'express';
import helmet from 'helmet';
import notesRouter from './routes/notes.routes.js';
import authRouter from './routes/auth.routes.js';
import { NotFoundError } from './errors.js';
import { errorHandler } from './http/errorHandler.js';
import {requestId} from './http/middleware/requestId.js';
import { logger } from './http/middleware/logger.js';
import { authenticate } from './http/middleware/authenticate.js';
import cors from 'cors';
import { apiLimiter, authLimiter } from './http/middleware/rateLimit.js';
import { CORS_ORIGINS, TRUST_PROXY } from './config.js';

export const app = express();

app.set('trust proxy', TRUST_PROXY);

app.use(requestId);
app.use(logger);
app.use(helmet());  
app.use(cors({
  origin: CORS_ORIGINS,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}));
app.use(apiLimiter);                          
app.use(express.json({ limit: '100kb' }));

app.use('/auth', authLimiter, authRouter);
app.use('/notes', authenticate, notesRouter);

app.use((req, res, next) => next(new NotFoundError('Route not found')));
app.use(errorHandler);                     