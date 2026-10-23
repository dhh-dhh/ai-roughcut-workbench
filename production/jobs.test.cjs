const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),os=require('os'),path=require('path');
const {JobStore,scanMedia}=require('./jobs.cjs');
test('one active task, checkpoints survive restart, interrupted task requires retry',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'film-jobs-'));const s=new JobStore(root);const j=s.add({title:'test'},root);s.update(j.id,{status:'running',stage:'audio',done:['inputs']});assert.throws(()=>s.add({},root),/任务/);const restored=new JobStore(root);assert.equal(restored.get(j.id).status,'interrupted');assert.deepEqual(restored.get(j.id).done,['inputs']);restored.update(j.id,{status:'failed'});assert.ok(restored.add({},root).id);
});
test('no escape through task IDs',()=>{const s=new JobStore(fs.mkdtempSync(path.join(os.tmpdir(),'film-jobs-')));assert.throws(()=>s.get('../../secret'));});
test('media scan includes supported files only, does not follow symlinks',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'film-media-'));fs.writeFileSync(path.join(root,'a.mp4'),'x');fs.writeFileSync(path.join(root,'b.txt'),'x');fs.mkdirSync(path.join(root,'.private'));fs.writeFileSync(path.join(root,'.private','hidden.mp4'),'x');assert.equal(scanMedia(root).length,1);});


test('damaged task is isolated without breaking startup',()=>{const root=fs.mkdtempSync(path.join(os.tmpdir(),'film-broken-'));fs.writeFileSync(path.join(root,'job-broken.json'),'{');const s=new JobStore(root);assert.equal(s.list().length,0);assert.ok(fs.readdirSync(root).some(f=>f.includes('.corrupt-')))});

test('optional folder can be omitted and overlapping files keep primary priority',()=>{const {collectSources}=require('./jobs.cjs');const root=fs.mkdtempSync(path.join(os.tmpdir(),'film-extra-'));const extra=path.join(root,'extra');fs.mkdirSync(extra);fs.writeFileSync(path.join(root,'main.mp4'),'x');fs.writeFileSync(path.join(extra,'ref.png'),'x');assert.equal(collectSources(root,'').length,2);const overlap=collectSources(root,extra);assert.equal(overlap.length,2);assert.ok(overlap.every(s=>s.role==='primary'));const separate=fs.mkdtempSync(path.join(os.tmpdir(),'film-ref-'));fs.writeFileSync(path.join(separate,'other.png'),'x');const all=collectSources(root,separate);assert.equal(all.length,3);assert.equal(all[2].role,'optional');assert.equal(all[2].name,'other.png');});
