# 使用和参考的 Skill

这里区分开发指导、视频制作说明、宣传文案方法。Skill 通常是给编码智能体的工作说明，不是本工作台自动运行的额外模型。

## OpenFilm

- 本地 Skill 名：`openfilm`。
- 来源：[OpenFilm](https://github.com/openfilm/openfilm)，其仓库与软件包包含 Skill 和制作手册。
- 用途：理解网页视频工程、检查和渲染流程。实现阶段同时读取了本机安装包的 MANUAL。

## Superpowers 开发方法

- 上游：[obra/superpowers](https://github.com/obra/superpowers)。
- 本次开发过程中读取/应用的同名方法包括：`brainstorming`、`writing-plans`、`executing-plans`、`test-driven-development`、`systematic-debugging`、`verification-before-completion`；并进行了独立代码复查。
- 用途：澄清方案、拆分实现、排查故障、验证输出。它们不是生产运行时依赖；本仓库没有复制整套第三方 Skill 源文件。

## 第五期文案：Tim 视角定制 Skill

- 本地名称：`tim-yingshijufeng-perspective`。
- 来源：用户环境中定制生成的 Skill，基于公开材料整理；**不是影视飓风或Tim官方发布的Skill**。
- 生成框架署名：[女娲 nuwa-skill](https://github.com/alchaincyf/nuwa-skill)，作者花叔（alchaincyf）。该框架署名不表示花叔或Tim审核、撰写或认可本地定制内容。
- 实际用途：第五期宣传口播采用「具体问题→可展示验证→取舍与边界」结构，保留待拍内容，不把约5秒样片测试夸大为所有长视频的质量保证。
- 公开版只注明来源与用途，没有上传用户的整套本地Skill、研究文件或私人创作资料。

补充：改稿前阅读过本地 `conversational-koubo` 的气口与自然口语建议；它属于用户环境定制资源，没有可核验的独立公开仓库，因此不杜撰下载链接。第五期最终方向以用户指定的Tim视角Skill为准。

你不必安装上述开发/写作Skill才能运行本工作台；运行所需软件见README。
