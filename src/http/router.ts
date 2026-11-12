// import { sendJson, sendNoContent } from "./helpers.js";
// import { AppError } from "../errors.js";
// import {
//   listNotes,
//   addNote,
//   getNote,
//   deleteNote,
// } from "../services/notesService.js";

// const routes = [
//   {
//     method: "GET",
//     pattern: /^\/notes$/,
//     handler: async (req, res) => sendJson(res, 200, await listNotes()),
//   },
//   {
//     method: "GET",
//     pattern: /^\/notes\/([^/]+)$/,
//     handler: async (req, res, [id]) => sendJson(res, 200, await getNote(id)),
//   },
//   {
//     method: "POST",
//     pattern: /^\/notes$/,

//     handler: async (req, res) => {
//        const data = req.body;
//       if (data === null || typeof data !== "object" || Array.isArray(data)) {
//         throw new AppError("Body must be a JSON object", 400);
//       }
//       const note = await addNote(data.text);
//       sendJson(res, 201, note);
//     },
//   },
//   {
//     method: "DELETE",
//     pattern: /^\/notes\/([^/]+)$/,
//     handler: async (req, res, [id]) => {
//       await deleteNote(id);
//       sendNoContent(res);
//     },
//   },
// ];

// export async function router(req, res , next) {
 
//     const { pathname } = new URL(req.url, "http://localhost");
//     const pathMatches = routes.filter((r) => r.pattern.test(pathname));

//     if (pathMatches.length === 0) {
//       return next();    
//     }

//     const route = pathMatches.find((r) => r.method === req.method);

//     if (!route) {
//       return sendJson(
//         res,
//         405,
//         { error: "Method not allowed" },
//         { Allow: pathMatches.map((r) => r.method).join(", ") },
//       );
//     }

//     const match = pathname.match(route.pattern);
//     await route.handler(req, res, match.slice(1));
     
// }
