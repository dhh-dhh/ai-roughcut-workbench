const {test}=require('node:test');const assert=require('node:assert/strict');
const {parseScript,validatePlan,buildFilm,validateInput}=require('./core.cjs');
test('module2 only, strips annotations and ignores later sections',()=>{
 const p=parseScript('# 题目\n## 模块1｜画面\n【画面：实机】\n重复句\n## 模块2｜纯文字口播\n你好。/\n\n**第二句。**\n## 录制备注\n不朗读');
 assert.equal(p.text,'你好。\n\n第二句。');assert.match(p.directions,/实机/);assert.equal(p.segments.length,2);
});
test('requires nonempty module2',()=>{assert.throws(()=>parseScript('## 模块1\n只有画面'),/模块2/);assert.throws(()=>parseScript('## 模块2\n【画面：无】'),/正文/)});
test('long paragraphs split by punctuation without dropping words',()=>{const p=parseScript('## 模块2\n'+('这是一个句子。'.repeat(80)));assert.ok(p.segments.every(s=>s.length<=260));assert.equal(p.segments.join(''),p.text)});
const media=[{id:'m1',type:'video',duration:8,path:'assets/m1.mp4'}];
test('reject unknown media and trims outside source or narration',()=>{
 assert.throws(()=>validatePlan({shots:[{mediaId:'../secret',start:0,end:5,in:0}]},media,5));
 assert.throws(()=>validatePlan({shots:[{mediaId:'m1',start:0,end:5,in:6}]},media,5));
 assert.throws(()=>validatePlan({shots:[{mediaId:'m1',start:2,end:5,in:0}]},media,5),/覆盖/);
 assert.throws(()=>validatePlan({shots:[{mediaId:'m1',start:0,end:6,in:0}]},media,5));
 assert.equal(validatePlan({shots:[{mediaId:'m1',start:0,end:5,in:1,title:'演示'}]},media,5).length,1);
});
test('film uses relative media, muted footage and narration sidecar',()=>{const html=buildFilm([{mediaId:'m1',start:0,end:5,in:1,title:'<测试>'}],media,{width:1920,height:1080},5);assert.match(html,/assets\/narration.wav/);assert.match(html,/muted/);assert.match(html,/m1.mp4#t=1,6/);assert.doesNotMatch(html,/<测试>/)});
test('input rejects unknown model and nonabsolute folder',()=>{assert.throws(()=>validateInput({model:'bad'}));assert.throws(()=>validateInput({model:'vox',scriptPath:'a',materialPath:'b'}));});

test('mixed image and video film is accepted by OpenFilm',async(t)=>{
 const {pathToFileURL}=require('node:url');
 const file=require('path').resolve(require('path').dirname(require('./config.cjs').openfilm),'../src/film-doc.mjs');if(!require('fs').existsSync(file)){t.skip('先安装OpenFilm以运行集成检查');return;}const {readFilmFile}=await import(pathToFileURL(file).href);
 const mixed=[{id:'still',type:'image',path:'assets/still.png'},...media];
 const html=buildFilm([{mediaId:'still',start:0,end:2},{mediaId:'m1',start:2,end:5,in:0}],mixed,{width:1920,height:1080},5);
 assert.deepEqual(readFilmFile(html).problems,[]);
 assert.match(html,/<\/video>/);
 assert.doesNotMatch(html,/<\/img>/);
});

test('video description is optional, trimmed and bounded',()=>{
 const input={model:'vox',scriptPath:'E:/script.md',materialPath:'E:/media'};
 assert.equal(validateInput(input).videoDescription,'');
 assert.equal(validateInput({...input,videoDescription:'  节奏轻快，重点展示操作  '}).videoDescription,'节奏轻快，重点展示操作');
 assert.throws(()=>validateInput({...input,videoDescription:{}}),/视频风格/);
 assert.throws(()=>validateInput({...input,videoDescription:'字'.repeat(2001)}),/2000/);
});