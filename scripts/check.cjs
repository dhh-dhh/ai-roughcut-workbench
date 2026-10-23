const fs=require('fs'),{spawnSync}=require('child_process'),C=require('../production/config.cjs');
let failures=0;for(const [name,exe,args] of [['Python',C.python,['--version']],['FFmpeg',C.ffmpeg,['-version']],['FFprobe',C.ffprobe,['-version']],['Codex',C.codex,['--version']]]){const r=spawnSync(exe,args,{windowsHide:true,encoding:'utf8'});const ok=!r.error&&r.status===0;console.log(`${ok?'OK':'MISSING'} ${name}`);if(!ok)failures++;}
for(const [name,file] of [['OpenFilm',C.openfilm],['本地字幕对齐模型',C.alignModel]]){const ok=!!file&&fs.existsSync(file);console.log(`${ok?'OK':'MISSING'} ${name}`);if(!ok)failures++;}
console.log('模型API、账号登录、显存和浏览器运行环境需另行验证；检查不会下载模型或提交AI任务。');process.exitCode=failures?1:0;
