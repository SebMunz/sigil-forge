import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const allowed=new Set(['/','/index.html','/src/engine.js','/src/element.js','/src/sources.js','/src/workshop.css','/src/catalog.js','/src/ornament.js','/src/legacy-v1.js','/src/legacy-v2.js','/src/geomancy.js']);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(req,res)=>{
  try {
    const name=new URL(req.url,'http://localhost').pathname;
    if(!allowed.has(name)) { res.writeHead(404);res.end('Not found');return; }
    const file=name==='/'?'/index.html':name;
    const bytes=await readFile(path.join(root,file));
    res.writeHead(200,{'Content-Type':`${mime[path.extname(file)]}; charset=utf-8`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(bytes);
  } catch {res.writeHead(500);res.end('Unable to read file');}
});
server.listen(Number(process.env.PORT||4317),'127.0.0.1',()=>console.log(`Sigil Forge: http://127.0.0.1:${server.address().port}`));
