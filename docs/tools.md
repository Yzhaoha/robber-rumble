# 劫匪大乱斗 · 测试工具

从 claude.ai 项目的 `劫匪大乱斗/tools.md`、`tools-cg.md` 整理。原文里还有一个离线车模渲染器（mini3.mjs + showroom.mjs，用来看 5 款车 × 5 档外观），现在可以直接用 playwright + swiftshader 真实渲染，所以没搬。

## 1. 电脑对战模拟（平衡、升级节奏、对抗强度）

把 index.html 里 `// ================= SIM START` 到 `// ================= SIM END` 之间的代码抽出来，后面接下面这段，存成 sim.mjs 用 node 跑：

```python
s = open('index.html').read()
sim = '//' + s.split('// ================= SIM START')[1].split('// ================= SIM END')[0]
open('sim.mjs', 'w').write(sim + open('sim_tail.js').read())
```

sim_tail.js：

```js
let NEAR=0,TOT=0; const N=20, wins=[0,0,0]; let lv=[], hits=0, sk=0, dep=0, spl=0, lvlT={}, looks=[0,0,0,0,0];
HOOK.event=(e)=>{ if(e.k==='hit')hits++; if(e.k==='skillhit')sk++; if(e.k==='dep')dep++; if(e.k==='spill')spl++; if(e.k==='lvl'){(lvlT[e.l]=lvlT[e.l]||[]).push(G.time);} };
const ts=[];
for(let m=0;m<N;m++){ G.roster=[]; startMatch(); for(const c of G.cars)c.bot=true; G.mySlot=-1;
  while(G.phase==='play'){ hostStep(1/60); for(const a of G.cars){ if(G.cars.some(b=>b.team!==a.team&&hyp(a.x-b.x,a.z-b.z)<15)) NEAR++; TOT++; } }
  const mx=Math.max(...G.teamScore); wins[G.teamScore.indexOf(mx)]++; ts.push(G.teamScore.join('/'));
  for(const c of G.cars){lv.push(c.lvl); looks[lookOf(c)]++;}
}
lv.sort((a,b)=>a-b);
console.log('wins',wins,'scores',ts.join(' '));
console.log('levels median',lv[lv.length>>1],'min',lv[0],'max',lv[lv.length-1],'maxcount',lv.filter(x=>x>=10).length,'/',lv.length);
console.log('looks',looks);
console.log('per match: hits',hits/N,'skillhits',sk/N,'deps',dep/N,'spills',spl/N);
for(const l in lvlT){const a=lvlT[l].sort((x,y)=>x-y);console.log('Lv'+l,'count/match',(a.length/N).toFixed(1),'median t',a[a.length>>1].toFixed(0));}
console.log('time near enemy(<15m) %', (NEAR/TOT*100).toFixed(1));
```

基准（第 27 版，30 局）：中位数 8 级、满级约 3%、黄金档约 25%；撞击约 75/局、技能命中约 148；三队平均分约 280。

## 2. stub3.js：假 three（浏览器冒烟测试用，不真实渲染）

```js
const mk = () => { const f = function () { return mk(); }; return new Proxy(f, {
  get(t, k) { if (k === Symbol.toPrimitive) return () => 0; if (k === 'then') return undefined; if (k in t && typeof k==='symbol') return t[k]; if (!(k in store(t))) store(t)[k] = mk(); return store(t)[k]; },
  set(t, k, v) { store(t)[k] = v; return true; }, construct() { return mk(); }, apply() { return mk(); } }); };
const S = new WeakMap(); function store(t){ if(!S.has(t)) S.set(t,{}); return S.get(t); }
const C = () => function () { return mk(); };
export const Scene=C(),Color=C(),OrthographicCamera=C(),HemisphereLight=C(),DirectionalLight=C(),MeshLambertMaterial=C(),Mesh=C(),BoxGeometry=C(),MeshBasicMaterial=C(),PlaneGeometry=C(),CylinderGeometry=C(),InstancedMesh=C(),Object3D=C(),Group=C(),ConeGeometry=C(),RingGeometry=C(),SphereGeometry=C(),OctahedronGeometry=C(),CircleGeometry=C(),WebGLRenderer=C(),PerspectiveCamera=C(),MeshPhongMaterial=C(),Shape=C(),ExtrudeGeometry=C(),TorusGeometry=C(),MeshStandardMaterial=C(),AmbientLight=C(),Fog=C(),CanvasTexture=C(),SpriteMaterial=C(),Sprite=C(),BufferGeometry=C(),Float32BufferAttribute=C(),LineBasicMaterial=C(),Line=C(),Matrix4=C(),Quaternion=C(),Euler=C(),Vector2=C();
export const DoubleSide=2, AdditiveBlending=2, BackSide=1, FrontSide=0;
export class Vector3 { constructor(){this.x=0;this.y=0;this.z=0;} set(x,y,z){this.x=x/300;this.y=z/300;this.z=0;return this;} project(){return this;} copy(){return this;} clone(){return new Vector3();} }
```

用法：`page.route(/three\.module/, r => r.fulfill({ contentType: 'application/javascript', body: STUB }))`。

## 3. fakesdk.js：假 CrazyGames SDK v3

所有调用记在 `window.__cgLog`。地址参数：`fakeLocale=de-DE`、`fakeUser=1`（用户名 CoolDriver77）、`fakeInstant=1`、`fakeInvite=CODE`。广告 0.1 秒开播、0.6 秒结束。

```js
window.__cgLog = [];
const P = new URLSearchParams(location.search);
const log = (...a) => window.__cgLog.push(a.join(' '));
window.CrazyGames = { SDK: {
  environment: 'local',
  async init() { log('init'); },
  game: {
    settings: { muteAudio: false, disableChat: false },
    addSettingsChangeListener(f) { window.__cgSettings = f; },
    loadingStart() { log('loadingStart'); }, loadingStop() { log('loadingStop'); },
    gameplayStart() { log('gameplayStart'); }, gameplayStop() { log('gameplayStop'); },
    happytime() { log('happytime'); },
    inviteParams: P.get('fakeInvite') ? { room: P.get('fakeInvite') } : null,
    getInviteParam(k) { return this.inviteParams ? this.inviteParams[k] : null; },
    isInstantMultiplayer: P.has('fakeInstant'),
    updateRoom(o) { log('updateRoom', JSON.stringify(o)); }, leftRoom() { log('leftRoom'); },
    inviteLink(p) { return 'https://www.crazygames.com/game/robber-rumble?room=' + p.room; },
    addJoinRoomListener(f) { window.__cgJoin = f; },
  },
  user: {
    isUserAccountAvailable: true,
    systemInfo: { locale: P.get('fakeLocale') || 'en-US', countryCode: 'US', device: { type: 'desktop' } },
    async getUser() { return P.has('fakeUser') ? { username: 'CoolDriver77', profilePictureUrl: '' } : null; },
    addAuthListener(f) { window.__cgAuth = f; },
  },
  ad: { requestAd(type, cb) { log('requestAd', type); setTimeout(() => cb.adStarted(), 100); setTimeout(() => cb.adFinished(), 600); }, async hasAdblock() { return false; } },
} };
```

期望调用顺序：init > loadingStart > loadingStop > gameplayStart > gameplayStop > happytime > requestAd midgame > gameplayStart。还要用「SDK 延迟 1.5 秒 init」测一次 loadingStop 不会漏发。

## 4. fakenet.js：假 Poki netlib

`page.route(/netlib/, …)` 换掉。create 后 30ms 给房间码 QX42。测剪贴板要用本地 http 服务器（`python3 -m http.server 8765`），file:// 下剪贴板不可用。

```js
export class Network {
  constructor(id) { this.h = {}; setTimeout(() => this.emit('ready'), 30); }
  on(e, f) { (this.h[e] = this.h[e] || []).push(f); }
  emit(e, ...a) { (this.h[e] || []).forEach(f => f(...a)); }
  create(o) { window.__netCreate = o; setTimeout(() => this.emit('lobby', 'QX42'), 30); }
  join(c) { setTimeout(() => this.emit('lobby', c), 30); }
  async list() { return []; }
  send() {} broadcast() {} close() {}
}
```

## 5. 冒烟测试要点

- 无 SDK：英语、单人玩一局（`?debug` 后用 `__G` 改等级/技能/敌人位置，按 Space/J/K/L 放技能），`__G.time = 179.5` 快进到结果页，点「再来一局」。
- 假 SDK：`&fakeLocale=de-DE&fakeUser=1` 检查德语、用户名锁定、广告期间 `#adblock` 显示且 `__CG.muted` 为 true。
- `&fakeInstant=1` 应直接开私人房进大厅；`&fakeInvite=AB12` 应自动加入。
- 排版：11 种语言在 907×510、1216×684、1280×720、390×844 下，用 `__setLang`、`__showOffer(5, [{id:'rally',lv:3},{id:'magnet',lv:3},{id:'cash'}])`、`__banner(最长文案)` 检查选卡、横幅、技能按钮不溢出不重叠。
- 手机：playwright 用 `Input.dispatchTouchEvent` 多点触控测摇杆 + 第二根手指点技能。开局车起步慢，出生点往下是楼，测摇杆要往左拖。
