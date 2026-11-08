// playground/hash-demo.ts
import { hash, verify } from 'argon2';

console.time('hash');
const h1 = await hash('secret123');
console.timeEnd('hash');

const h2 = await hash('secret123');

console.log(h1);
console.log(h2);
console.log('same?', h1 === h2);
console.log('right password:', await verify(h1, 'secret123'));
console.log('wrong password:', await verify(h1, 'wrong'));