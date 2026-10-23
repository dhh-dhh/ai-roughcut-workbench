# 开源项目及外部服务来源

本仓库是流程整合层，不分发下列项目的程序、权重或素材。安装时请核对对应版本的 LICENSE、模型卡及服务说明；本仓库 MIT 许可不覆盖外部依赖。

|项目|本项目中的具体用途|官方来源|
|---|---|---|
|OpenFilm|`film.html`格式、CLI检查、可编辑工程和渲染|https://github.com/openfilm/openfilm |
|VoxCPM2|通过VoxCPM WebUI调用可选本地TTS|https://github.com/OpenBMB/VoxCPM |
|IndexTTS|调用可选参考音色TTS；接口按开发机版本实现|https://github.com/index-tts/index-tts |
|edge-tts|微软在线语音的Python客户端|https://github.com/rany2/edge-tts |
|FunASR|给定正文和真实音频的时间戳对齐|https://github.com/modelscope/FunASR |
|ModelScope|模型加载基础设施；所用时间戳模型ID为 `iic/speech_timestamp_prediction-v1-16k-offline`|https://github.com/modelscope/modelscope |
|FFmpeg/FFprobe|音视频探测、转换、拼接、字幕烧录|https://github.com/FFmpeg/FFmpeg |
|Gradio / gradio_client|本地模型HTTP服务和调用|https://github.com/gradio-app/gradio |
|Codex CLI|根据文字、代表帧输出镜头JSON|https://github.com/openai/codex |
|Pillow|素材代表帧联系表排版|https://github.com/python-pillow/Pillow |
|SoundFile|读取对齐音频|https://github.com/bastibe/python-soundfile |
|GPT-SoVITS|原个人工作流中的另一种配音工具；公开版仅可导入其生成音频，并非直接API依赖|https://github.com/RVC-Boss/GPT-SoVITS |

OpenFilm通过npm安装时保留其包内的LICENSE和第三方声明。FFmpeg使用者须核对自己的构建配置及许可。各TTS模型代码许可、权重许可和音色使用权可能不同。本项目未取得或宣称任何上游作者、影视飓风或Tim的官方合作/背书。

开发与文案参考 Skill 另列于 [SKILLS.md](SKILLS.md)，不是配音模型，也不是每次生成视频都要运行的依赖。
