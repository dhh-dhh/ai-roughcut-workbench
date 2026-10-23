const path=require('node:path');
const A=require('./adapters.cjs');
const C=require('./config.cjs');
function createPicker(run=A.run){
 let active=null,revision=0;
 return async function picker(kind,initialPath=''){
  if(!['folder','script','audio'].includes(kind))throw Error('选择类型无效');
  if(typeof initialPath!=='string'||initialPath.length>32767)throw Error('路径无效');
  const ticket=++revision;
  if(active){const previous=active;previous.controller.abort();await previous.promise.catch(()=>{});}
  if(ticket!==revision)return '';
  const current={controller:new AbortController(),promise:null};active=current;
  current.promise=run(C.powershell,['-NoProfile','-STA','-File',path.join(__dirname,'picker.ps1')],{input:JSON.stringify({kind,initialPath}),timeout:600000,signal:current.controller.signal});
  try{return JSON.parse((await current.promise).trim()).path||'';}
  catch(e){if(current.controller.signal.aborted)return '';throw e;}
  finally{if(active===current)active=null;}
 };
}
module.exports={createPicker};