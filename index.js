console.log('1: start');

setTimeout(() => console.log('2: timeout'), 0);
Promise.resolve().then(() => console.log('3: promise'));
process.nextTick(() => console.log('4: nextTick'));

console.log('5: end');

// const ids = [1, 2, 3];
// ids.forEach(async (id) => {
//   await new Promise((r) => setTimeout(r, 100));
//   console.log('saved', id);
// });
// console.log('all saved');