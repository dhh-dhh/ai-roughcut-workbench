import json,sys,os,re,shutil,subprocess,time
from pathlib import Path

def make_cues(text,timestamps,offset=0):
    tokens=re.findall(r'[\u3400-\u9fff]|[a-zA-Z]+(?:\x27[a-zA-Z]+)?|\d+(?:\.\d+)?',text)
    if not tokens or len(tokens)!=len(timestamps):raise ValueError('字幕词数与实际时间戳不一致，不能猜测时间')
    cues=[];words=[];line=''
    for word,times in zip(tokens,timestamps):
        if len(times)!=2 or times[1]<times[0]:raise ValueError('无效字幕时间戳')
        if words and (len(line)+len(word)>18 or times[0]/1000+offset-words[-1]['end']>.55):
            cues.append(dict(start=words[0]['start'],end=words[-1]['end'],text=line,words=words));words=[];line=''
        if line and line[-1].isascii() and word[0].isascii():line+=' '
        line+=word;words.append(dict(text=word,start=round(offset+times[0]/1000,3),end=round(offset+times[1]/1000,3)))
    if words:cues.append(dict(start=words[0]['start'],end=words[-1]['end'],text=line,words=words))
    return cues

def synthesize(req):
    from gradio_client import Client,handle_file
    client=Client('http://127.0.0.1:'+str(req['port']),verbose=False)
    reference=handle_file(req['referencePath']) if req.get('referencePath') else None
    for i,text in enumerate(req['segments']):
        if req.get('cancelFile') and Path(req['cancelFile']).exists():raise RuntimeError('任务已取消')
        target=Path(req['directory'])/f'{i:03d}.wav'
        if target.exists() and target.stat().st_size>44:continue
        print(f'配音 {i+1}/{len(req["segments"])}',flush=True)
        if req['model']=='vox':
            task=client.submit(text,req.get('voiceDescription',''),reference,bool(req.get('referenceText')),req.get('referenceText',''),2.0,False,False,10,42,api_name='/generate')
        elif req['model']=='index':
            task=client.submit('与音色参考音频相同',reference,text,'ZH',None,.8,*([0]*8),'',False,120,1.0,True,.8,30,.8,0,3,10,1500,api_name='/gen_single')
        elif req['model']=='edge':
            task=client.submit(text,req.get('voice','云希·男声'),0,0,api_name='/synthesize')
        else:raise ValueError('未知模型')
        # Existing Gradio services may not interrupt synchronous inference. Let the current
        # segment settle before acknowledging cancellation; never kill someone else's service.
        while not task.done():time.sleep(.5)
        result=task.result()
        output=result[0] if isinstance(result,(tuple,list)) else result
        if isinstance(output,dict):output=output.get('path') or output.get('value')
        if not output or not Path(output).is_file():raise ValueError('配音接口没有返回音频')
        temp=target.with_suffix('.part.wav')
        subprocess.run([req['ffmpeg'],'-v','error','-y','-i',str(output),'-ac','1','-ar','48000',str(temp)],check=True)
        temp.replace(target)
        if req.get('cancelFile') and Path(req['cancelFile']).exists():raise RuntimeError('当前配音段已结束，任务已取消')

def align(req):
    from funasr import AutoModel
    model=AutoModel(model=req['modelPath'],device='cpu',disable_update=True,disable_pbar=True)
    cues=[]
    for i,item in enumerate(req['items']):
        print(f'字幕对齐 {i+1}/{len(req["items"])}',flush=True)
        # Load audio as an array to avoid torchcodec/FFmpeg backend version coupling.
        import soundfile as sf
        wav,sr=sf.read(item['audio'],dtype='float32')
        if sr!=16000:raise ValueError('对齐音频必须为16kHz')
        result=model.generate(input=(wav,item['text']),data_type=('sound','text'),batch_size=1)[0]
        cues.extend(make_cues(result['text'],result['timestamp'],item['offset']))
    Path(req['output']).write_text(json.dumps(cues,ensure_ascii=False),encoding='utf-8')

if __name__=='__main__':
    for name in list(os.environ):
        if name.lower() in ('http_proxy','https_proxy','all_proxy'):os.environ.pop(name,None)
    os.environ['NO_PROXY']='*'
    req=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
    {'synthesize':synthesize,'align':align}[req['action']](req)
