// playground/prisma-demo.ts
import { randomUUID } from 'node:crypto';
import { prisma } from '../src/prisma.js';

const note = await prisma.note.create({
  data: { id: randomUUID(), text: 'hello prisma', createdAt: new Date() },
});
console.log('created:', note);

const found = await prisma.note.findUnique({ where: { id: note.id } });
console.log('found:', found);

const page = await prisma.note.findMany({
  where: { text: { contains: 'hello' } },
  orderBy: { createdAt: 'asc' },
  take: 5,
  skip: 0,
});
console.log('page size:', page.length);

const total = await prisma.note.count({ where: { text: { contains: 'hello' } } });
console.log('total:', total);

await prisma.$disconnect();