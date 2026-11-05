import { AppError } from "../errors.js";

const MAX_BODY_BYTES = 1_000_000;

export function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size <= MAX_BODY_BYTES) chunks.push(chunk);
    });

    
    req.on("end", () => {
      if (size > MAX_BODY_BYTES) {
        return reject(new AppError("Body too large", 413));
      }
      const text = Buffer.concat(chunks).toString("utf8");
      
      if(text.trim() === ""){
        return resolve(undefined);
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return reject(new AppError("Invalid JSON", 400));
      }
      resolve(data);
    });

    req.on("error", reject);
  });
}

export function sendNoContent(res) {
  res.writeHead(204);
  res.end();
}