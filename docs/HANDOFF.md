# 劫匪大乱斗 Robber Rumble · 交接（给 Claude Code）

更新：2026-11-17。来源：claude.ai 项目「POKI and CrazyGames」里的《劫匪大乱斗-开发交接》《游戏提交记录》《总交接》。
全程中文回复；用户不看代码，只看效果，说话直白、少术语；意见很短，要自己推断。

## 用户规矩
- 测试链接一律用 GitHub Pages：https://yzhaoha.github.io/robber-rumble/ （本仓库根目录 = 无 SDK 网页版；`_config.yml` 排除了 docs/ tools/）。给手机测加 `?v=提交号` 避缓存。
- **提交表单永远不选任何 AI 相关选项**（引擎 / Tools 不填 Claude、ChatGPT、AI）。
- 不替用户注册账号、不输密码；确认框由用户自己勾；最终提交前先截图给用户确认。
- 用户邮箱是隐私，不写进仓库、不发给外部服务。
- 删除 CrazyGames 条目不可恢复，先问用户。
- 云端会话用不了用户的 Chrome；要登录平台提交的步骤回到本机做。

## 现在的状态（11-17）
- **Poki**：11-08 22:33 提交（引擎填 ThreeJS）。11-10 收到模板信：「暂时不给 Poki for Developers 抢先体验 / Playtesting 资格，名额有限」，没提游戏名。Poki 对用户所有游戏都是这封信，跟游戏好坏关系不大。
- **CrazyGames**：11-13 约 18:45 提交（Stone Tech 账号，Game ID **171340**，build 6e9d211a），**11-14 16:19 被拒**，通用理由「The overall quality of the game does not yet meet the expectations of our platform」。后台 developer.crazygames.com/games/772f4dee-de5e-4c02-b129-99ce5dfea236。
- 用户在 CG 一共被拒 5 次（怪物糖果夜 ×2、坑勇者、劫匪大乱斗、坑前男友），全是这句通用理由。
- **用户想把它做成「完整游戏」**（11-14）：**保留现有美术风格（不换 Unity、不改方块/像素风）+ 统一配色**。顺序：①第一印象 → ②留存 → ③内容 → ④收尾。动手前先跟用户确认这一步。
- 可以发邮件到 submissions@crazygames.com 附 Game ID 171340 要具体反馈（要用户同意，从用户邮箱发）。

## 玩法规矩（用户定的）
- 不要加回：警车、钉刺带、两种货币。
- 不能完全照抄《野蛮人大作战》（可以借鉴机制）。
- 用户最在意：效果要明显、对抗要多、不要乱。

## 玩法和数值（第 27–28 版）
三队（红/蓝/绿）各 3 辆车，吃路上飘的金币堆成车顶「钱塔」，同时涨经验升级选技能，开回本队车库停 1 秒（DEP_T）存钱算分，3 分钟后存款最多的队赢。撞人、技能能把别人车顶的钱打掉，空位由电脑补。

- 地图 4×4 街区；金币每 5 米一个点位、每局随机富矿区（底密度 0.22），吃掉 30–45 秒刷新。
- 全图一座金库（7 米内每 0.3 秒 +$3，共 30 次，搬空换位置，金色光柱）。
- 钱塔越多越慢（每块 -0.8%，最多 -30%），12 块以上急转弯甩掉 10%；最多者超过 20 块成「头号肥羊」（MOST WANTED）。
- 车头撞侧面/车尾撞掉 30% + 每档外观 +10%；车头对撞等级高的赢。
- 最高 10 级，`XP_NEED = [0, 8, 12, 17, 23, 30, 39, 50, 62, 74]`；2/3/4 级各选一个主动技能，之后每级升级。被车撞掉 40% 经验，被技能打中掉 15%。
- 5 款车纯外观（闪电跑车、野牛肌肉车、大牛皮卡、山猫越野、豆豆甲壳虫），5 档进化外观（LOOK）。
- 主动：氮气（自带，空格）、钩爪、震荡波（16/21/26 米）、护盾、地雷、追踪火箭。被动：磁铁、引擎改装、稳固车顶、加厚装甲、快速存钱、快速冷却。最多 3 主动 + 3 被动。
- 按键两套自动切换：方向键 + A/S/D（技能）Q/W/E（选卡），或 WASD + J/K/L / U/I/O；M 开关音乐。手机：全屏任意位置摇杆，右下弧形技能键；右手摇杆时技能镜像到左边。
- 背景音乐代码合成（Am-F-C-G，124 BPM，最后 30 秒 148 BPM）。
- 模拟基准（30 局）：中位数 8 级、满级约 3%；撞击约 75/局、技能命中约 148。

## 代码说明
- 本仓库：`index.html`（网页版，无平台 SDK）+ `three.module.min.js`（r160）+ `netlib.js`（@poki/netlib 0.0.21 的 +esm，import 改成 `./eventemitter3.js`）+ `eventemitter3.js`（自写兼容版）。完全不依赖外部网站，联机可用。
- 结构：`SIM START … SIM END` 段是纯逻辑（node 能跑）；`I18N`：11 语言 `en fr it de es tr zh ja ko pt ru`，翻译表 `TL`，取字函数叫 **tl**（不是 t）；`CG` 对象 = 平台包装层（init / locale / userName / inviteRoom / loadingDone / setPlaying / midgame / room / inviteLink / muted），SDK 不在时全部静默跳过。
- 联机：Poki netlib（WebRTC，房主权威），消息类型 s/S/A/P/H/W/R/O/K/B/G/E/full；4 位房间码；客户端固定 1/60 步长。已知限制：房主离开对局就结束。
- **InstancedMesh 必须 `frustumCulled = false`**（不然镜头一动整批金币消失）。
- 调试：`?debug` 暴露 `__G`、`__CG`、`__setLang`、`__showOffer`、`__banner`、`__tl`、`__MUSIC`；录视频用的 `window.__auto / __autoCards / __fast / __zoom`。
- 存档只用 localStorage：`heist_lang`、`heist_name`、`heist_car`、`heist_music`、`heist_hand`。

### 平台版
- **CG 版** = 网页版 head 里加两段：`<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js">` + `window.__cgInit`（尽早 init + loadingStart），CG 包装层调 SDK v3：gameplayStart/Stop、happytime、midgame（只在一局结束后）、muteAudio、getUser、updateRoom、inviteLink、addJoinRoomListener、Instant Multiplayer。CG 允许 CDN（three / netlib 可以走 jsdelivr）。上传只要一个 index.html。
- **Poki 版** = head 换成 `https://game-cdn.poki.com/scripts/v2/poki-sdk.js` + `window.__pkInit`，包装层换成 PokiSDK（gameLoadingFinished、gameplayStart/Stop、commercialBreak、shareableURL/getURLParam），变量名仍叫 CG。Poki 不许外部请求，库必须打包进 zip（index.html + three.module.min.js + netlib.js + eventemitter3.js，约 268KB）。
- 原来生成三个版本的 `build.py` / `gameplay.py` / `cg.js` / `pk.js` 只在旧的 claude.ai 容器里，**没有保存下来**。claude.ai 项目文档里有 `claude/劫匪大乱斗/index.html`（CG 版）和 `index-poki.html`（Poki 版），但比本仓库旧（没有 11-13 修的 loadingStop 补报）。以后要平台版，以本仓库网页版为准，按上面两段重新加 SDK 包装层（记得 loadingStop 补报：SDK init 比第一帧慢时，init 完成后再调一次 loadingDone）。

## 提交材料（表单文字，英文）
- **Title**：Robber Rumble
- **Short description**：Grab cash, stack it on your roof and race it home! 3-team car brawl: ram rivals, fire homing rockets and level up.
- **Description**：Robber Rumble is a fast 3-team car brawl. Red, Blue and Green crews race through the city scooping up floating cash. Every coin stacks on your roof, so your money tower grows taller and taller — and so does the target on your back. Drive back to your team's garage and park for one second to bank the cash. After 3 minutes, the team with the most money banked wins. Ram to rob / Level up to 10 / Raid the vault / Mind your stack / Play with friends (invite link or Quick Match; bots fill empty seats).
- **Controls**：WASD or Arrow keys: drive / Space or Left click: Nitro / J K L (A S D with arrows): skills / Right click: first skill / U I O, Q W E or 1 2 3: pick upgrade cards / M: music on/off / Mobile: drag anywhere to steer, tap the round buttons for Nitro and skills.
- CG 详情页用过：分类 Driving；Tags Car, 3D, Battle, Arena, Collect；联机 Online with Friends 2–9；支持 SDK 静音；存档选 No；手机 Both。
- 封面 3 张 + 预览视频 2 段在用户 Windows 电脑 `Downloads\cg-rr\`（云端拿不到，需要时找用户要）。

## 测试方法
见 `docs/tools.md`：node 跑 SIM 段做平衡模拟、playwright + 假 three / 假 CG SDK / 假 netlib 冒烟测试、11 语言排版检查。真实渲染可用 playwright + swiftshader 加载本仓库的 three.module.min.js。

## 其他游戏
全部游戏的总交接在私有仓库 Yzhaoha/burnt-again 的 `docs/总交接-全部游戏.md`。
