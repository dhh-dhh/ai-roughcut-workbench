const http=require('http'),crypto=require('crypto');
const {handle}=require('./production/routes.cjs'),host='127.0.0.1:7865',token=crypto.randomBytes(32).toString('hex');
const server=http.createServer((req,res)=>{if(req.headers.host!==host){res.writeHead(403);return res.end('Invalid host')}
 if(req.url==='/'){res.writeHead(302,{Location:'/production'});return res.end()}
 if(req.url==='/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({app:'roughcut-workbench'}))}
 if(req.url.startsWith('/production')||req.url.startsWith('/api/production/'))return handle(req,res,token);
 res.writeHead(404);res.end('Not found');});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'7865 端口已被占用，请关闭另一份工作台后重试。':e.message);process.exitCode=1});
server.listen(7865,'127.0.0.1',()=>console.log('AI创趣一键初剪工作台：http://127.0.0.1:7865/production'));
