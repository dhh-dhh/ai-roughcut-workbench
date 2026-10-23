from pathlib import Path
from datetime import datetime
import asyncio
import edge_tts
import gradio as gr

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'output'
OUT.mkdir(exist_ok=True)
VOICES = {'云希·男声': 'zh-CN-YunxiNeural', '云健·男声': 'zh-CN-YunjianNeural', '晓晓·女声': 'zh-CN-XiaoxiaoNeural', '晓伊·女声': 'zh-CN-XiaoyiNeural'}
async def synthesize(text, voice, rate, pitch):
    if not text.strip():
        raise gr.Error('请先输入要朗读的文字。')
    path = OUT / (datetime.now().strftime('%Y%m%d-%H%M%S-%f') + '.mp3')
    await edge_tts.Communicate(text.strip(), VOICES[voice], rate=f'{int(rate):+d}%', pitch=f'{int(pitch):+d}Hz').save(str(path))
    return str(path), str(path)
with gr.Blocks(title='AI创趣工坊 · Edge TTS') as demo:
    gr.Markdown('# Edge TTS 中文配音\n输入口播正文，选择声音后生成 MP3。需要联网，文本会发送到微软语音服务。请去掉画面提示和气口斜杠。')
    text = gr.Textbox(label='口播正文', lines=10, placeholder='在这里粘贴需要朗读的文字')
    voice = gr.Dropdown(list(VOICES), value='云希·男声', label='声音')
    rate = gr.Slider(-50, 50, value=0, step=1, label='语速调整（%）')
    pitch = gr.Slider(-20, 20, value=0, step=1, label='音调调整（Hz）')
    button = gr.Button('生成配音', variant='primary')
    audio = gr.Audio(label='试听', type='filepath')
    file = gr.File(label='下载 MP3')
    button.click(synthesize, [text, voice, rate, pitch], [audio, file])
if __name__ == '__main__':
    demo.queue(default_concurrency_limit=1).launch(server_name='127.0.0.1', server_port=7863, inbrowser=False)
