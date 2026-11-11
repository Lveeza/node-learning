import express from 'express';
import helmet from 'helmet';
import notesRouter from './routes/notes.routes.js';
import authRouter from './routes/auth.routes.js';
import { NotFoundError } from './errors.js';
import { errorHandler } from './http/errorHandler.js';
import { authenticate } from './http/middleware/authenticate.js';
import cors from 'cors';
import { apiLimiter, authLimiter } from './http/middleware/rateLimit.js';
import { CORS_ORIGINS, TRUST_PROXY } from './config.js';
import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import { logger } from './logger.js';
import  healthRouter  from './routes/health.routes.js';

export const app = express();

app.set('trust proxy', TRUST_PROXY);

app.use(pinoHttp({
  logger,
  genReqId: (_req, res) => {
    const id = randomUUID();
    res.setHeader('X-Request-Id', id);   
    return id;
  },
  autoLogging: { ignore: (req) => req.url === '/health' },  
  customLogLevel: (_req, res, err) =>
    err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
}));

app.use(helmet());  

app.use(healthRouter);

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