'use client';
import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { Search, Sparkles, ArrowUpRight, ShieldCheck, Info, X, Layers3, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import data from '@/lib/dataset.json';
import { aggregate, selectGames, gradeFor, type Row } from '@/lib/statistics';
import { AugmentStages } from '@/components/augment-stages';
import { PlayerRoster } from '@/components/player-roster';
import { assetUrl } from '@/lib/asset-url';
const colors = [{value:3,name:'彩色',en:'PRISMATIC'},{value:2,name:'金色',en:'GOLD'},{value:1,name:'银色',en:'SILVER'}];
const grades = [{name:'S',label:'优先关注',range:'平均排名 < 3.5'},{name:'A',label:'表现良好',range:'3.5 ≤ 平均排名 < 4'},{name:'B',label:'中等表现',range:'4 ≤ 平均排名 < 4.5'},{name:'C',label:'谨慎选择',range:'平均排名 ≥ 4.5'}];
const statusLabel:Record<string,string> = {user_verified:'用户确认',assistant_reviewed:'助手复核',auto_consistent:'自动筛选'};
function Icon({entry,large=false}:{entry:{icon:string|null;name:string};large?:boolean}) {
  return <span className={`augment-icon ${large?'large':''}`}>{entry.icon?<img src={assetUrl(entry.icon)} alt="" width={large?80:48} height={large?80:48} loading="lazy"/>:<Layers3 aria-label="暂无图标"/>}</span>;
}
export default function Home() {
  const [color,setColor]=useState(2),[query,setQuery]=useState(''),[source,setSource]=useState('all'),[minimum,setMinimum]=useState(1),[selected,setSelected]=useState<string|null>(null);
  const [patch,setPatch]=useState('all');
  const rows=useMemo(()=>aggregate(data.entries,data.games,source,patch),[source,patch]);
  const currentPatch=data.patches.versions.find(p=>p.id===patch);
  const unknownPatchCount=data.games.filter(g=>!g.patch).length;
  const filtered=rows.filter(r=>r.tier===color&&r.n>=minimum&&r.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedRow=rows.find(r=>r.name===selected);
  const activeGames=selectGames(data.games,source,patch);
  const activePlayers=Array.from(new Set(activeGames.map(g=>g.player))).sort();
  const activeDates=activeGames.map(g=>g.date).sort();
  const activeTournaments=activeGames.filter(g=>g.sourceType==='tournament');
  const facts=activeGames.reduce((n,g)=>n+g.names.length,0), totalKnown=rows.filter(r=>r.n>0).length;
  const unknown=rows.filter(r=>r.tier===color&&r.n===0&&r.name.toLowerCase().includes(query.trim().toLowerCase()));
  const choose=(row:Row)=>setSelected(row.name);
  useEffect(()=>{
    type Context={registerTool:(tool:{name:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown},options:{signal:AbortSignal})=>void|Promise<void>};
    const context=(document as Document&{modelContext?:Context}).modelContext;
    if(!context?.registerTool)return;
    const lifecycle=new AbortController();
    try{void Promise.resolve(context.registerTool({name:'filter_augment_tiers',description:'筛选强化评级并更新页面，返回当前条件下有样本的强化与均值。',
      inputSchema:{type:'object',properties:{tier:{type:'integer',enum:[1,2,3]},source:{type:'string',enum:['all','reviewed']},query:{type:'string'},minimum:{type:'integer',minimum:1,maximum:999}},required:['tier','source','query','minimum'],additionalProperties:false},
      annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
        const value=input as {tier:number;source:string;query:string;minimum:number};
        if(!value||![1,2,3].includes(value.tier)||!['all','reviewed'].includes(value.source)||typeof value.query!=='string'||!Number.isInteger(value.minimum)||value.minimum<1||value.minimum>999)throw new Error('筛选条件无效');
        flushSync(()=>{setColor(value.tier);setSource(value.source);setQuery(value.query);setMinimum(value.minimum);setSelected(null)});
        return aggregate(data.entries,data.games,value.source,patch).filter(r=>r.tier===value.tier&&r.n>=value.minimum&&r.name.toLowerCase().includes(value.query.trim().toLowerCase())).map(r=>({name:r.name,n:r.n,mean:r.mean,grade:gradeFor(r.mean)}));
      }},{signal:lifecycle.signal})).catch(()=>{});}catch{/* Browsers without WebMCP retain all visible controls. */}
    return()=>lifecycle.abort();
  },[patch]);
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href={assetUrl('/')} aria-label="弈览首页"><span className="brand-mark"><Layers3 size={23}/></span><span>弈览<span className="brand-en">TFT INSIGHTS</span></span></a><span className="nav-current">强化评级</span><div className="header-right"><span className="season-dot"/>{data.season}<label className="patch-badge" data-patch={patch}>资料版本<select aria-label="资料版本" value={patch} onChange={e=>{setPatch(e.target.value);setSelected(null)}}><option value="all">S18 全版本</option>{data.patches.versions.map(p=><option key={p.id} value={p.id}>{p.id}（{data.games.filter(g=>g.patch===p.id).length} 人次）</option>)}<option value="unknown">版本待核（{unknownPatchCount} 人次）</option></select></label><span className="header-divider"/><span>选手对局观察</span></div></header>
    <main>
      <div className="page-heading"><div><div className="eyebrow">AUGMENT TIER LIST <span>／</span> S18</div><h1>强化评级<span className="heading-spark">✦</span></h1><p>从实战中，找到值得选择的海克斯。</p></div><div className="date-box"><span className="live-dot"/>样本日期<strong>{activeDates.length?`${activeDates[0].slice(5).replace('-','.')} — ${activeDates[activeDates.length-1].slice(5).replace('-','.')}`:'暂无样本'}</strong><span className="roster-line">2026 · <PlayerRoster players={activePlayers}/></span></div></div>
      <section className="metrics" aria-label="样本概览"><div><span>选手对局</span><strong>{activeGames.length}<small>人次</small></strong></div><div><span>海克斯样本</span><strong>{facts}<small>条</small></strong></div><div><span>已观察海克斯</span><strong>{totalKnown}<small>种</small></strong></div><div><span>录像范围</span><strong>{data.recordings}<small>份</small></strong></div><div className="metric-note"><ShieldCheck size={19}/><span>复核与自动样本分开标记<br/><b>少于 5 个样本，评级暂定</b></span></div></section>
      <div className="patch-context" aria-live="polite"><strong>{patch==='all'?'S18 全版本综合评价':patch==='unknown'?'版本待核样本':`${patch} 版本评价`}</strong><span>{patch==='all'?`包含 ${unknownPatchCount} 人次版本待核样本；单版本筛选仅使用已确认版本的对局。`:patch==='unknown'?'这些对局暂不归入任何单独版本。':`当前版本 ${activeGames.length} 人次${activeGames.length?'':'，尚无已确认样本，暂不评级'}。`}</span>{currentPatch&&<a href={currentPatch.source} target="_blank" rel="noreferrer">国服公告 · {currentPatch.effectiveDate} ↗</a>}<small>图标、介绍与出现阶段目录：18.1；尚未同步后续版本的文字改动。</small></div>
      <div className="workspace">
        <div className="toolbar"><Tabs value={color} onValueChange={v=>setColor(Number(v))}><TabsList className="color-tabs" aria-label="强化品质">{colors.map(c=><TabsTrigger key={c.value} value={c.value} className={`color-tab color-${c.value}`}><Sparkles size={16}/>{c.name}<span>{rows.filter(r=>r.tier===c.value&&r.n>0).length}</span></TabsTrigger>)}</TabsList></Tabs><label className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索海克斯名称…" aria-label="搜索海克斯名称"/>{query&&<button onClick={()=>setQuery('')} aria-label="清空搜索"><X size={16}/></button>}</label></div>
        <div className="filterbar"><Tabs value={source} onValueChange={v=>setSource(String(v))}><TabsList className="source-tabs" aria-label="样本来源"><TabsTrigger value="all">全部样本</TabsTrigger><TabsTrigger value="reviewed">仅复核样本</TabsTrigger></TabsList></Tabs><label className="sample-filter">最少样本<input type="number" min="1" max="999" value={minimum} onChange={e=>setMinimum(Math.max(1,Math.min(999,Number(e.target.value)||1)))} aria-label="最少样本量"/></label><span className="result-count" aria-live="polite">{filtered.length} 项强化 · 按平均排名排序</span></div>
        <div className="legend"><Info size={15}/><span>平均排名越低越好。<span className="tentative-dot"/> 表示小样本暂定；点击卡片查看介绍与对局来源。</span></div>
        <section className="tier-board" aria-label={`${colors.find(c=>c.value===color)?.name}强化评级`}>
          {grades.map(grade=>{const items=filtered.filter(r=>gradeFor(r.mean)===grade.name);return <section className={`tier-row grade-${grade.name}`} key={grade.name}><div className="tier-label"><strong>{grade.name}</strong><span>{grade.label}</span><small>{items.length} 项</small></div><div className="tier-content"><div className="tier-caption">{grade.range}</div><div className="augment-grid">{items.map(row=><button className={`augment-card color-${row.tier}`} key={row.id} onClick={()=>choose(row)} aria-label={`${row.name}，平均排名 ${row.mean.toFixed(2)}，${row.n} 个样本${row.n<5?'，评级暂定':''}`}><Icon entry={row}/><span className="card-info"><span className="card-name">{row.name}{row.n<5&&<i className="tentative-dot" title="少于 5 个样本，暂定"/>}</span><span className="card-stat"><b>{row.mean.toFixed(2)}</b><span>平均排名</span><span className="card-n">{row.n} 局</span></span></span><ChevronRight size={14} className="card-arrow"/></button>)}</div>{!items.length&&<p className="empty-row">{filtered.length?'当前条件下暂无此等级':'当前筛选下暂无样本，试试其他品质、名称或样本量。'}</p>}</div></section>})}
        </section>
        {unknown.length>0&&minimum===1&&<details className="unobserved"><summary>尚无样本 <span>{unknown.length} 项</span><small>不参与评级</small></summary><div className="augment-grid">{unknown.map(row=><button className={`augment-card color-${row.tier}`} key={row.id} onClick={()=>choose(row)}><Icon entry={row}/><span className="card-info"><span className="card-name">{row.name}</span><span className="card-stat">尚无对局样本</span></span></button>)}</div></details>}
      </div>
      <details className="methodology"><summary><Info size={16}/>统计口径与数据覆盖</summary><div className="method-grid"><div><h3>如何计算评级</h3><p>每局同名海克斯只计一次，包含额外海克斯；基础版、+、++ 和不同阶位独立统计。每个样本使用该局最终排名，所有选手等权合并。</p><p>这是容易识别样本的阶段性统计，尚未覆盖全部对局；评级反映样本表现，不能单独证明海克斯的强度。</p></div><div><h3>数据来源</h3><p>{activePlayers.join('、')||'当前筛选暂无选手'}。自动筛选尚未人工复核，未识别的海克斯不参与均值；“仅复核样本”包含用户确认与助手复核。</p><p>图标与介绍来自 <a href="https://tftable.cc/s18#items-augments" target="_blank" rel="noreferrer">TFT 符文大陆攻略站 ↗</a>，目录版本 18.1。国服版本时间已核对官方公告，赛事服以对局证据为准；未确认版本不进入单版本评级。18.1含未单独命名的国服热修。</p></div></div><p>已纳入精英巡回赛 {new Set(activeTournaments.map(g=>g.matchId)).size} 场中的 {activeTournaments.length} 人次，部分场次尚未收齐八人。优先整理清晰样本，疑难记录留待补核。同一选手同一场跨录像去重。天龙合集暂未找到标题日期 09-02 的录像。页面为数据快照。</p></details>
      <footer><span>弈览 <span className="footer-dot">·</span> S18 强化观察</span><span>数据快照 {data.generatedAt.slice(0,10)} · 非官方统计</span></footer>
    </main>
    <Sheet open={!!selectedRow} onOpenChange={open=>{if(!open)setSelected(null)}}><SheetContent className="detail-sheet">{selectedRow&&<><SheetHeader><div className={`detail-top color-${selectedRow.tier}`}><Icon entry={selectedRow} large/><div><div className="eyebrow">{colors.find(c=>c.value===selectedRow.tier)?.en} AUGMENT</div><SheetTitle className="detail-title">{selectedRow.name}</SheetTitle><span className={`grade-pill grade-${gradeFor(selectedRow.mean)}`}>{selectedRow.n?`${gradeFor(selectedRow.mean)} 级${selectedRow.n<5?' · 暂定':''}`:'尚未评级'}</span></div></div><SheetDescription className="detail-description">{selectedRow.description||'暂无介绍。'}</SheetDescription></SheetHeader><div className="detail-body"><AugmentStages entry={selectedRow}/><div className="detail-stats"><div><span>平均排名</span><strong>{selectedRow.n?selectedRow.mean.toFixed(2):'—'}</strong></div><div><span>样本量</span><strong>{selectedRow.n}<small>局</small></strong></div><div><span>前四率</span><strong>{selectedRow.n?Math.round(selectedRow.top4/selectedRow.n*100)+'%':'—'}</strong></div></div><div className="evidence-breakdown"><ShieldCheck size={16}/><span>用户确认 {selectedRow.user} · 助手复核 {selectedRow.reviewed} · 自动筛选 {selectedRow.auto}</span></div>{selectedRow.n<5&&<p className="sample-warning">{selectedRow.n?'样本较少，当前评级仅供参考。':'尚无样本，因此不赋予 SABC 等级。'}</p>}<h3>排名分布</h3><div className="distribution" aria-label="第一至第八名样本数">{Array.from({length:8},(_,i)=>{const n=selectedRow.samples.filter(g=>g.placement===i+1).length;return <div key={i}><span>{n}</span><div className="bar-track"><i style={{height:`${selectedRow.n?n/Math.max(...Array.from({length:8},(_,j)=>selectedRow.samples.filter(g=>g.placement===j+1).length))*100:0}%`}}/></div><span>#{i+1}</span></div>})}</div><h3>对局来源 <span>{selectedRow.n} 局</span></h3><p className="source-help">B站来源可跳转；虎牙来源请手动定位至标注时间。选手仅用于追溯来源。</p><div className="game-list">{selectedRow.samples.map(g=><a key={g.key} href={g.url} target="_blank" rel="noreferrer"><span className={`placement ${g.placement<=4?'top-four':''}`}>#{g.placement}</span><span className="game-info"><strong>{g.player}<small>{g.date.slice(5)}</small></strong><span>{statusLabel[g.status]} · {g.patch||'版本待核'}{g.sourceType==='tournament'?' · 精英巡回赛':''}{g.sourceType==='tournament'&&g.seconds!=null?' · '+new Date(g.seconds*1000).toISOString().slice(11,19):''}{!g.complete?' · 部分海克斯':''}</span></span><ArrowUpRight size={16}/></a>)}</div></div></>}</SheetContent></Sheet>
  </div>;
}
