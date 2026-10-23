const fs=require('fs'),path=require('path'),{spawn}=require('child_process');const {Producer}=require('./jobs.cjs'),A=require('./adapters.cjs'),C=require('./config.cjs');
const producer=new Producer();const picker=require('./picker.cjs').createPicker();
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
async function body(req){let text='';for await(const b of req){text+=b;if(text.length>64000)throw Error('请求过大')}return JSON.parse(text||'{}')}
function stream(res,req,file){if(!fs.existsSync(file))return json(res,404,{error:'文件尚未生成'});const size=fs.statSync(file).size;const range=req.headers.range;const mime=file.endsWith('.mp4')?'video/mp4':'audio/wav';if(range){const m=/^bytes=(\d+)-(\d*)$/.exec(range);if(!m)return json(res,416,{error:'无效范围'});const start=Number(m[1]),end=m[2]?Math.min(Number(m[2]),size-1):size-1;if(start>end||start>=size)return json(res,416,{error:'无效范围'});res.writeHead(206,{'Content-Type':mime,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1,'Accept-Ranges':'bytes'});fs.createReadStream(file,{start,end}).pipe(res)}else{res.writeHead(200,{'Content-Type':mime,'Content-Length':size,'Accept-Ranges':'bytes'});fs.createReadStream(file).pipe(res)}}
async function handle(req,res,token){const url=new URL(req.url,'http://127.0.0.1:7865');
 try{
 if(url.pathname==='/production'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(fs.readFileSync(path.join(__dirname,'../dist/production.html'),'utf8').replace('TOKEN_PLACEHOLDER',token));return;}
 if(url.pathname==='/production.js'||url.pathname==='/production.css'){res.writeHead(200,{'Content-Type':url.pathname.endsWith('.js')?'text/javascript; charset=utf-8':'text/css; charset=utf-8'});res.end(fs.readFileSync(path.join(__dirname,'../dist',url.pathname.slice(1))));return;}
 if(req.headers['x-control-token']!==token&&url.searchParams.get('token')!==token)return json(res,403,{error:'请刷新工作台再操作'});
 if(req.method==='POST'&&req.headers.origin!=='http://127.0.0.1:7865')return json(res,403,{error:'请求来源无效'});
 const p=url.pathname;
 if(req.method==='GET'&&p==='/api/production/jobs')return json(res,200,{jobs:producer.store.list(),settings:fs.existsSync(path.join(C.data,'settings.json'))?JSON.parse(fs.readFileSync(path.join(C.data,'settings.json'),'utf8')):{}});
 if(req.method==='POST'&&p==='/api/production/pick'){const b=await body(req);if(!['folder','audio','script'].includes(b.kind))throw Error('选择类型无效');return json(res,200,{path:await picker(b.kind,b.initialPath)});}
 if(req.method==='POST'&&p==='/api/production/jobs')return json(res,202,await producer.create(await body(req)));
 const m=/^\/api\/production\/jobs\/([\w-]+)\/(retry|cancel|open|folder|preview|audio|log)$/.exec(p);
 if(m){const j=producer.store.get(m[1]),action=m[2];if(req.method==='POST'){
 if(action==='retry')return json(res,202,producer.retry(j.id));if(action==='cancel')return json(res,200,producer.cancel(j.id));
 if(action==='folder'){spawn('explorer.exe',[j.dir],{windowsHide:true}).on('error',()=>{});return json(res,200,{ok:true})}
 if(action==='open'){if(!fs.existsSync(path.join(j.dir,'film.html')))throw Error('工程尚未生成');await A.run(process.execPath,[C.openfilm,'open',j.dir],{cwd:j.dir,timeout:60000,log:path.join(j.dir,'open.log')});if(C.desktop)spawn(C.desktop,[],{detached:true,windowsHide:true,stdio:'ignore'}).on('error',()=>{});return json(res,200,{ok:true})}
 }else if(req.method==='GET'){
 if(action==='preview'||action==='audio')return stream(res,req,path.join(j.dir,action==='preview'?'初剪.mp4':'assets/narration.wav'));
 if(action==='log'){const allowed=['synthesis.log','alignment.log','ai.log','render.log','service.log'];const lines=allowed.filter(f=>fs.existsSync(path.join(j.dir,f))).map(f=>{const file=path.join(j.dir,f),size=fs.statSync(file).size,fd=fs.openSync(file,'r'),b=Buffer.alloc(Math.min(6000,size));fs.readSync(fd,b,0,b.length,Math.max(0,size-b.length));fs.closeSync(fd);return f+'\n'+b.toString('utf8')});return json(res,200,{text:lines.join('\n\n')});}
 }}return json(res,404,{error:'无此操作'});
 }catch(e){if(!res.headersSent)json(res,400,{error:e.message});else res.destroy()}
}
module.exports={handle,producer};
