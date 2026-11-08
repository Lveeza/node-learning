import express from 'express';
import helmet from 'helmet';
import notesRouter from './routes/notes.routes.js';
import authRouter from './routes/auth.routes.js';
import { NotFoundError } from './errors.js';
import { errorHandler } from './http/errorHandler.js';
import {requestId} from './http/middleware/requestId.js';
import { logger } from './http/middleware/logger.js';


export const app = express();

app.use(requestId);
app.use(logger);
app.use(helmet());                          
app.use(express.json({ limit: '100kb' }));
app.use('/notes', notesRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => next(new NotFoundError('Route not found')));
app.use(errorHandler);                     