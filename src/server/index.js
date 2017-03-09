import {createServer} from 'http'
import Koa from 'koa'
import route from 'koa-route'
import serve from 'koa-static'
import send from 'koa-send'
import console from 'console'
// import socketIo from 'socket.io';
// import documentSocket from './documentSocket';
// import {directoryStore} from './documentStore';
import './webrtc'
import './file/watch'

const app = new Koa()
app.use(route.get('/', async function (ctx) { await send(ctx, 'dist/client/index.html') }))
app.use(route.get('/client/*', serve('dist')))
app.use(route.get('/edit/*', async function (ctx) { await send(ctx, 'dist/client/index.html') }))

const server = createServer(app.callback())
// const io = socketIo(server);
//
// io.serveClient(false);
// io.on('connect', documentSocket(io, directoryStore('ignore')));
server.listen(3000)
console.log('Listening')
