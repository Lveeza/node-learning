import { readJsonBody } from "../helpers.js";

export async function bodyParser(req, res, next) {
  if (req.method !== "POST" && req.method !== "PUT" && req.method !== "PATCH") {
    return next();
  }

  const body = await readJsonBody(req);
  req.body = body;
  await next();
}
