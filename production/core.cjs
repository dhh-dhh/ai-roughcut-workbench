const path=require('path');
function parseScript(md){
 const clean=md.replace(/^\uFEFF/,'').replace(/\r/g,'');
 const match=/^##\s*模块\s*[2二][^\n]*\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/m.exec(clean);
 if(!match)throw Error('文案缺少「## 模块2」纯文字口播');
 const text=match[1].replace(/```[\s\S]*?```/g,'').replace(/【[^】]*】/g,'').replace(/\*\*|\/+|`/g,'').replace(/\[([^\]]+)\]\([^)]+\)/g,'$1').replace(/^\s*---+\s*$/gm,'').split('\n').map(s=>s.trim()).join('\n').replace(/\n{3,}/g,'\n\n').trim();
 if(!text)throw Error('模块2没有可朗读的正文');if(text.length>20000)throw Error('单期正文请控制在两万字以内');
 const segments=[];
 for(const para of text.split(/\n\s*\n/)){let part='';for(const sentence of para.replace(/\n/g,'').match(/[^。！？!?；;]+[。！？!?；;]?|[。！？!?；;]/g)||[]){if(part.length+sentence.length>240&&part){segments.push(part);part=''}for(let i=0;i<sentence.length;i+=240){const piece=sentence.slice(i,i+240);if(i>0&&part){segments.push(part);part=''}part+=piece}}if(part)segments.push(part)}
 return {text,segments,directions:clean.slice(0,match.index)};
}
function validateInput(input){
 if(!['vox','index','edge','existing'].includes(input.model))throw Error('请选择支持的配音方式');
 for(const key of ['scriptPath','materialPath'])if(typeof input[key]!=='string'||!path.win32.isAbsolute(input[key])||input[key].startsWith('\\\\'))throw Error('请选择本机绝对路径');
 if(input.extraMaterialPath&&(!path.win32.isAbsolute(input.extraMaterialPath)||input.extraMaterialPath.startsWith('\\\\')))throw Error('额外参考素材请选择本机绝对路径');
 if(!/\.md$/i.test(input.scriptPath))throw Error('文案请选择 Markdown 文件');
 if(input.model==='index'&&!input.referencePath)throw Error('IndexTTS 需要参考音频');
 if(input.model==='existing'&&!input.audioPath)throw Error('请选择已有配音');
 for(const key of ['referencePath','audioPath'])if(input[key]&&(!path.win32.isAbsolute(input[key])||input[key].startsWith('\\\\')))throw Error('音频请选择本机文件');
 return {...input,title:String(input.title||'新一期').slice(0,60),aspect:['portrait','landscape','auto'].includes(input.aspect)?input.aspect:'auto'};
}
function validatePlan(plan,media,duration){
 if(!Array.isArray(plan.shots)||!plan.shots.length||plan.shots.length>300)throw Error('AI 未返回有效镜头');
 let end=0;
 for(const s of plan.shots){
  if(![s.start,s.end,s.in??0].every(Number.isFinite)||s.end<=s.start||Math.abs(s.start-end)>.06||s.start<0||s.end>duration+.05)throw Error('镜头必须连续覆盖配音，且不能超出时长');
  if(s.mediaId!==null){const m=media.find(m=>m.id===s.mediaId);if(!m)throw Error('AI 引用了不存在的素材');if((s.in??0)<0||m.type==='video'&&(s.in??0)+s.end-s.start>m.duration+.05)throw Error('镜头裁剪超出原视频');}
  if(typeof s.title!=='string'||s.title.length>90)throw Error('标题文字过长或无效');end=s.end;
 }
 if(Math.abs(end-duration)>.06)throw Error('镜头必须覆盖整段配音');return plan.shots;
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function buildFilm(shots,media,size,duration){
 const titles=[],footage=[];
 shots.forEach((s,i)=>{const len=+(s.end-s.start).toFixed(3);if(s.title||s.mediaId===null)titles.push(`<iframe src="shot-${i}.html#t=0,${len}" at="${s.start}" id="title-${i}"></iframe>`);const m=media.find(m=>m.id===s.mediaId);if(m)footage.push(`<${m.type==='video'?'video':'img'} src="${esc(m.path)}#t=${s.in||0},${+((s.in||0)+len).toFixed(3)}" at="${s.start}" id="media-${i}" ${m.type==='video'?'muted':''} style="object-fit:contain;width:${size.width}px;height:${size.height}px">${m.type==='video'?'</video>':''}`)});
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${size.width}, height=${size.height}"><style>body{background:#111713}</style></head><body><section>${titles.join('\n')}</section><section>${footage.join('\n')}</section><section><audio id="narration" src="assets/narration.wav#t=0,${duration}"></audio></section></body></html>`;
}
function titlePage(title,size,full){return `<!doctype html><html><meta charset="utf-8"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden;font-family:'Microsoft YaHei',sans-serif;color:#fff}body{${full?'background:#131d17;':''}}#title{position:absolute;left:7%;right:7%;top:${full?'38':'7'}%;font-size:${size.width<1000?48:54}px;line-height:1.5;font-weight:700;text-shadow:0 3px 12px #000;background:#101811bb;border-left:7px solid #cef985;padding:20px;white-space:pre-wrap;overflow-wrap:anywhere}</style><div id="title">${esc(title)}</div><script>window.film={width:${size.width},height:${size.height},frame(t){document.getElementById('title').style.opacity=Math.min(1,t/.2)}};</script></html>`}
module.exports={parseScript,validateInput,validatePlan,buildFilm,titlePage};
