import http from 'node:http';
import fs from 'node:fs';
import { createRepl } from '../lib/repl.mjs';
import { Console } from 'node:console';
import { Writable } from 'node:stream';

class Stdout extends Writable {
  strbuf = [];
  _write(chunk, _encoding, done) {
    console.log(chunk.toString().trim());
    this.strbuf.push(chunk.toString());
    done();
  }
}
const stdout = new Stdout();
const repl = createRepl(new Console(stdout));

const server = http.createServer(async (req, res) => {

  if (req.url === '/') {
    const result = fs.readFileSync('./index.html').toString();
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(result);
    return;
  }

  if (req.url === '/client.js') {
    const result = fs.readFileSync('./client.js').toString();
    res.setHeader('Content-Type', 'text/javascript');
    res.writeHead(200);
    res.end(result);
    return;
  }

  if (req.url === '/repl' && req.method === 'POST') {
    console.log(req.method, req.url, req.headers['content-type']);

    const body = await new Promise((resolve, reject) => {
      let chunks = '';
      req.on('data', chunk => chunks += chunk);
      req.on('end', () => resolve(chunks));
    });

    const parsed = JSON.parse(body);

    const result = await new Promise(resolve => {
      repl.acceptInput(parsed.command, () => {
        const log = stdout.strbuf.join('');
        stdout.strbuf.splice(0, stdout.strbuf.length);
        resolve(log);
      });
    });

    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200);
    res.end(result);
  }
});

server.on('error', console.error);
server.listen(8080);