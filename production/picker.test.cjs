const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPicker}=require('./picker.cjs');
test('picker passes paths as JSON data, launches STA modern dialog and returns Unicode',async()=>{
 let call;
 const pick=createPicker(async(...args)=>{call=args;return JSON.stringify({path:'E:\\中文\\文案.md'});});
 const current="E:\\中文\\a';$(calc).md";
 assert.equal(await pick('script',current),'E:\\中文\\文案.md');
 assert.match(call[0],/pwsh.exe$/);
 assert.ok(call[1].includes('-STA'));
 assert.ok(call[1].includes('-File'));
 assert.equal(JSON.parse(call[2].input).initialPath,current);
 assert.ok(!call[1].join(' ').includes(current));
});
test('reopening cancels and awaits the old picker before opening a new one',async()=>{
 let calls=0,closed=false;
 const pick=createPicker(async(exe,args,opts)=>{
  calls++;
  if(calls===1)return new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>{setTimeout(()=>{closed=true;reject(Error('cancelled'))},10)}));
  assert.equal(closed,true);return '{"path":"E:/selected"}';
 });
 const first=pick('folder','');
 const second=pick('folder','');
 assert.equal(await first,'');assert.equal(await second,'E:/selected');assert.equal(calls,2);
});
test('failure releases picker and unknown types never launch a process',async()=>{
 let calls=0;const pick=createPicker(async()=>{calls++;throw Error('dialog failed')});
 await assert.rejects(pick('bad',''),/选择类型/);assert.equal(calls,0);
 await assert.rejects(pick('folder',''),/dialog failed/);
 await assert.rejects(pick('script',''),/dialog failed/);assert.equal(calls,2);
});