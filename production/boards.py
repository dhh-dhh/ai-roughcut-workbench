import json,sys,math
from pathlib import Path
from PIL import Image,ImageDraw
root=Path(sys.argv[1]);media=json.loads((root/'media.json').read_text(encoding='utf-8'))
frames=[(m['id'],i,root/f) for m in media for i,f in enumerate(m.get('thumbnails',[]))]
paths=[]
for start in range(0,len(frames),16):
    group=frames[start:start+16];canvas=Image.new('RGB',(1280,math.ceil(len(group)/4)*208),'#111512');draw=ImageDraw.Draw(canvas)
    for i,(ident,n,file) in enumerate(group):
        image=Image.open(file).convert('RGB');image.thumbnail((320,180));x=(i%4)*320;y=(i//4)*208
        canvas.paste(image,(x,y+25));draw.text((x+8,y+5),f'{ident} / frame {n+1}',fill='#d1f889')
    name=f'thumbs/board-{start//16:02d}.jpg';canvas.save(root/name,quality=90);paths.append(name)
(root/'boards.json').write_text(json.dumps(paths),encoding='utf-8')
