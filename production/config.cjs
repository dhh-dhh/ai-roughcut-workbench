const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),file=path.join(root,'config.local.json');
const local=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')):{};
const defaults={data:path.join(root,'runtime'),outputRoot:path.join(root,'output'),python:'python.exe',ffmpeg:'ffmpeg.exe',ffprobe:'ffprobe.exe',alignModel:'',codex:process.env.PRODUCTION_CODEX||'codex.exe',openfilm:path.join(root,'node_modules','openfilm','bin','openfilm.mjs'),desktop:'',browsers:'',cacheRoot:path.join(root,'.cache')};
const C={...defaults,...local,engines:{}};
for(const [name,port] of Object.entries({vox:8808,index:7860,edge:7863}))C.engines[name]={port,directory:'',launcher:'start.ps1',...local.engines?.[name]};
C.env=function(){const e={...process.env,PYTHONUTF8:'1',GRADIO_ANALYTICS_ENABLED:'False',NO_PROXY:'*',no_proxy:'*',HF_HUB_OFFLINE:'1',OPENFILM_NO_BROWSER:'1',HF_HOME:path.join(C.cacheRoot,'huggingface'),MODELSCOPE_CACHE:path.join(C.cacheRoot,'modelscope')};if(C.browsers)e.PLAYWRIGHT_BROWSERS_PATH=C.browsers;for(const k of Object.keys(e))if(/^(http|https|all)_proxy$/i.test(k))delete e[k];const key=Object.keys(e).find(k=>k.toLowerCase()==='path'),old=key?e[key]:'';if(key)delete e[key];e.PATH=(path.isAbsolute(C.ffmpeg)?path.dirname(C.ffmpeg)+path.delimiter:'')+old;return e;};
module.exports=C;
