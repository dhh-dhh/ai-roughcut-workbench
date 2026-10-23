# AI创趣一键初剪工作台

选好口播文案和素材，把配音、字幕、AI 镜头编排和视频导出接成一个本地流程。

这是 **AI创趣工坊** 的工作流整合项目。底层配音、语音对齐与渲染由下方开源项目提供，本项目贡献网页、任务调度、输入校验、分段缓存、字幕转换和 OpenFilm 工程生成。**输出是需要人工检查的初剪，不是自动发布的最终作品。**

界面采用黑色与炭灰表面、柔白主操作和细分隔线。设计约定见 [DESIGN.md](DESIGN.md)。

## 能做什么

- 从 Markdown 的 `## 模块2` 提取纯口播；前面的分镜提示供 AI 参考。
- 选择主素材文件夹，可选额外参考文件夹；额外素材可以使用，也可以完全不用。合计最多80个视频或图片，同一路径去重。
- 调用 VoxCPM2、IndexTTS 的 Gradio 服务，或附带的 edge-tts 适配服务；也支持导入已有配音。
- 按实际语音做字幕时间对齐，生成可编辑 VTT 和 SRT；最终 MP4 烧录字幕。
- 使用已登录的 Codex CLI 输出受校验的镜头方案，通过 OpenFilm 生成可编辑工程和视频。
- 阶段进度、失败重试、取消、配音缓存、预览及打开工程。

## 当前支持范围

**Windows 本地实验版，Node.js 22.2+，建议 Python 3.10–3.12。** 文件选择、进程取消和文件夹打开使用 Windows API。上游模型、显卡环境、账号和浏览器需自行安装，不是下载即用的一体包。没有包含模型权重、第三方程序、个人声音、账号凭据或作者的生产任务。

原工作流通过短样片验证了配音→对齐→AI编排→OpenFilm渲染；本公开包做了路径配置化与测试，不声称在全新机器上完成所有模型安装验收。上游 WebUI 接口变化可能需要调整 `production/audio.py`。

## 安装与启动

1. 安装 Node.js、Python、带 `subtitles`/libass 与 H.264 编码支持的现代 FFmpeg，以及 Codex CLI，完成你自己的 Codex 登录。安装方式以各上游官方说明为准。
2. 克隆本仓库，运行 `npm install` 安装 OpenFilm 0.2.5。按 OpenFilm 官方说明准备 Playwright 浏览器；已有桌面安装可在配置中覆盖 `openfilm` 为其 `bin/openfilm.mjs`，并设置 `browsers` 为浏览器目录。
3. 为适配器建立独立 Python 环境，再安装 `requirements.txt`。PyTorch/CUDA 需按机器与模型要求安装；VoxCPM/IndexTTS 各自依赖由上游管理，不建议混装一个环境。
4. 准备 FunASR 的本地时间戳模型 `iic/speech_timestamp_prediction-v1-16k-offline`；把完整模型目录填入 `alignModel`。运行时使用本地模型，不自动下载。
5. 将 `config.example.json` 复制为 `config.local.json`，把示例路径换为你的真实路径。`python` 指装有适配器依赖的解释器；`ffmpeg`、`ffprobe` 指实际程序。
6. 先手动启动所选配音服务；或为对应 `engines` 配置 `directory` 和 PowerShell `launcher`，使工作台按需启动。脚本应以前台方式运行服务，不要再次派生脱离控制的后台程序。默认端口：Vox 8808、Index 7860、edge 7863。
7. 运行 `npm run check` 检查程序和模型路径，再运行 `npm start`，访问 **http://127.0.0.1:7865/production**。

本地配置不会进入 Git。`outputRoot` 是独立任务输出目录；`data` 可覆盖任务状态目录。默认使用仓库下 `output/` 和 `runtime/`。`desktop` 可选，填 OpenFilm 桌面程序路径；为空时使用 OpenFilm 自身的打开方式。不要与另一份7865工作台同时启动。

### 配音接口

|方式|接入|备注|
|---|---|---|
|VoxCPM2|本机 Gradio `/generate`|参考音频可选，需匹配该版本接口|
|IndexTTS|本机 Gradio `/gen_single`|参考音频必填，适配开发机2.5 WebUI的 `ZH` 参数与情感选项|
|edge-tts|本仓库 `integrations/edge_app.py` 的 `/synthesize`|运行 `python integrations/edge_app.py`；调用微软在线服务|
|已有配音|WAV/MP3等文件|包括用户在 GPT-SoVITS 等工具中生成的音频；未实现 GPT-SoVITS 自动合成接口|

先用 `examples/script.md` 和少量自己的图片/视频验证。选择已有配音时，音频内容应与模块2一致。

## 结果与恢复

每期独立保存文案快照、素材副本、`film.html`、`初剪.mp4`、`assets/narration.wav`、同名 VTT、`captions.srt` 和日志。`picture.mp4` 是未烧录字幕的中间视频。

重试使用任务创建时的快照；改稿后新建任务，文本和音色参数一致的段落可以复用缓存。取消共享配音服务的任务会等待当前段完成。意外退出后若旧进程仍活着，会阻止重复提交；请先确认旧任务结束。

## 开源项目与 Skill 致谢

- [OpenFilm](https://github.com/openfilm/openfilm)：可编辑网页视频工程、检查与渲染。
- [VoxCPM / VoxCPM2](https://github.com/OpenBMB/VoxCPM)、[IndexTTS](https://github.com/index-tts/index-tts)：可选本地语音生成。
- [edge-tts](https://github.com/rany2/edge-tts)：可选在线语音适配，开源客户端不意味着服务本身开源。
- [FunASR](https://github.com/modelscope/FunASR)：实际语音时间戳对齐；[FFmpeg](https://github.com/FFmpeg/FFmpeg)：探测、音频转换与字幕烧录。
- [Codex CLI](https://github.com/openai/codex)：通过用户已登录的智能体生成镜头方案。CLI 开源不等于模型服务免费或离线。
- [Gradio](https://github.com/gradio-app/gradio)：模型服务及客户端调用。
- [OpenFilm Skill](https://github.com/openfilm/openfilm/tree/main/skills)、[Superpowers](https://github.com/obra/superpowers)：视频工作流说明和开发方法参考。
- [女娲 nuwa-skill（花叔）](https://github.com/alchaincyf/nuwa-skill)：第五期文案所用定制人物视角 Skill 的生成框架来源。

完整用途、非运行依赖的 Skill、许可证边界见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [SKILLS.md](SKILLS.md)。没有把上游代码或模型重新声明为本项目原创。

## 网络、成本与限制

只监听127.0.0.1；不要直接公开到互联网。页面会发送操作请求并访问本机所选文件。Codex 会将本期文案、素材描述和代表帧交给其服务，需要对应账号额度；edge-tts 将正文发给微软语音服务。其他本地配音、对齐是否额外联网取决于你安装的上游版本。

AI 只看代表帧、时长、文件名与分镜，不会逐帧理解长视频。尚未测量整期节省时间或通用剪辑质量；必须检查选镜、读音、字幕与版权。没有自动发布和音乐素材生成。适配器启动的子进程默认移除代理环境变量，不改变系统代理；安装依赖和模型时自行选择直连方式。

## 测试

```powershell
npm test
python production/audio_test.py
```

测试覆盖文案解析、时间线校验、字幕格式、取消、状态恢复和可选素材去重。完整生成还需本地模型、Codex账号和OpenFilm渲染环境。

本仓库原创代码采用 [MIT](LICENSE)。第三方项目、模型权重和在线服务分别遵循其自己的许可和条款。
