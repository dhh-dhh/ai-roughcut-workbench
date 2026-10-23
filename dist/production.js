const token=window.productionToken,form=document.querySelector('#form'),feedback=document.querySelector('#feedback');let initialized=false;
async function api(url,method='GET',data){const r=await fetch('/api/production'+url,{method,headers:{'X-Control-Token':token,'Content-Type':'application/json'},...(data?{body:JSON.stringify(data)}:{})});const json=await r.json();if(!r.ok)throw Error(json.error||'请求失败');return json;}
function model(){const v=form.elements.model.value;document.querySelector('#reference').hidden=!['vox','index'].includes(v);document.querySelector('#voice-description').hidden=v!=='vox';document.querySelector('#edge-voice').hidden=v!=='edge';document.querySelector('#existing-audio').hidden=v!=='existing';}
form.elements.model.onchange=model;model();
let currentStep=0;
function showStep(step){currentStep=step;document.querySelectorAll('[data-step-panel]').forEach(p=>p.hidden=Number(p.dataset.stepPanel)!==step);document.querySelectorAll('[data-step]').forEach(b=>{if(Number(b.dataset.step)===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});document.querySelector('#previous-step').hidden=step===0;document.querySelector('#next-step').hidden=step===1;document.querySelector('#submit').hidden=step===0;}
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>showStep(Number(b.dataset.step)));
document.querySelector('#previous-step').onclick=()=>showStep(0);
document.querySelector('#next-step').onclick=()=>{const fields=[...document.querySelector('[data-step-panel="0"]').querySelectorAll('input,select,textarea')];const invalid=fields.find(f=>!f.checkValidity());if(invalid){invalid.reportValidity();return;}showStep(1);};
form.addEventListener('invalid',e=>{const panel=e.target.closest('[data-step-panel]');if(panel)showStep(Number(panel.dataset.stepPanel));},true);
form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&currentStep===0){e.preventDefault();document.querySelector('#next-step').click();}});
showStep(0);
const pickButtons=[...document.querySelectorAll('[data-pick]')];
let pickRequest=0;
pickButtons.forEach(b=>{b.dataset.label=b.textContent;b.onclick=async()=>{
 const request=++pickRequest,field=form.elements[b.dataset.pick];
 document.querySelectorAll('.picker-hint').forEach(e=>e.remove());
 pickButtons.forEach(button=>{button.textContent=button.dataset.label;button.removeAttribute('aria-busy')});
 b.textContent='重新打开选择窗口';b.setAttribute('aria-busy','true');
 const hint=document.createElement('small');hint.setAttribute('role','status');hint.className='picker-hint';hint.textContent='请在 Windows 窗口中选择；找不到窗口时可再次点击重新打开。';b.closest('.pick').after(hint);
 try{
  const r=await api('/pick','POST',{kind:b.dataset.kind,initialPath:field.value.trim()});
  if(request!==pickRequest)return;
  if(r.path){field.value=r.path;field.title=r.path;field.dispatchEvent(new Event('change',{bubbles:true}));hint.textContent='已选择：'+r.path;}
  else hint.textContent='已取消，原路径未更改。';
 }catch(e){if(request===pickRequest)hint.textContent='选择失败：'+e.message;}
 finally{if(request===pickRequest){b.textContent=b.dataset.label;b.removeAttribute('aria-busy');setTimeout(()=>hint.remove(),10000);}}
};});
form.onsubmit=async e=>{e.preventDefault();const button=document.querySelector('#submit');button.disabled=true;try{await api('/jobs','POST',Object.fromEntries(new FormData(form)));feedback.textContent='任务已开始，可以在右侧查看进度。';await refresh();}catch(e){feedback.textContent=e.message;button.disabled=false;}};
function text(tag,value,cls){const e=document.createElement(tag);e.textContent=value;if(cls)e.className=cls;return e}
async function act(id,action){try{if(action==='preview'||action==='audio'){const video=document.querySelector('#video');video.hidden=false;document.querySelector('#log').hidden=true;video.src=`/api/production/jobs/${id}/${action}?token=${encodeURIComponent(token)}`;document.querySelector('#viewer').showModal();return}if(action==='log'){const r=await api(`/jobs/${id}/log`);document.querySelector('#video').hidden=true;document.querySelector('#log').hidden=false;document.querySelector('#log').textContent=r.text||'暂无日志';document.querySelector('#viewer').showModal();return}await api(`/jobs/${id}/${action}`,'POST',{});await refresh()}catch(e){feedback.textContent=e.message}}
const statuses={queued:'等待制作',running:'制作中',completed:'初剪完成',failed:'需要处理',cancelled:'已取消',interrupted:'运行中断',cancelling:'正在取消'};
async function refresh(){try{const result=await api('/jobs');if(!initialized){for(const [k,v] of Object.entries(result.settings))if(form.elements[k])form.elements[k].value=v;initialized=true;model()}
 const active=result.jobs.some(j=>['running','queued','cancelling'].includes(j.status));document.querySelector('#submit').disabled=active;const list=document.querySelector('#jobs');list.replaceChildren();if(!result.jobs.length)list.append(text('p','还没有任务。选好文案和素材，开始第一期制作。'));
 for(const j of result.jobs.slice(0,15)){const card=text('article','', 'job');card.append(text('h3',j.input.title),text('span',statuses[j.status]||j.status,'badge'),text('p',j.stage));const progress=document.createElement('progress');progress.max=6;progress.value=j.done.length;card.append(progress);if(j.error){const details=document.createElement('details');details.className='job-error';details.append(text('summary','需要处理 · 查看原因'),text('p',j.error,'error'));card.append(details);}const actions=text('div','','actions');const add=(label,action)=>{const b=text('button',label);b.onclick=()=>act(j.id,action);actions.append(b)};
 if(j.status==='completed')add('预览初剪','preview');if(j.done.includes('audio'))add('试听配音','audio');if(j.done.includes('project'))add('在 OpenFilm 打开','open');add('打开文件夹','folder');add('查看日志','log');if(['failed','cancelled','interrupted'].includes(j.status))add('继续 / 重试','retry');if(['queued','running'].includes(j.status))add('取消任务','cancel');card.append(actions);list.append(card)}
 }catch(e){feedback.textContent='连接失败：'+e.message}}
document.querySelector('#close-view').onclick=()=>{document.querySelector('#video').pause();document.querySelector('#viewer').close()};refresh();setInterval(refresh,3500);
