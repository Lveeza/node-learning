export async function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(`[${req.id}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  await next();
}