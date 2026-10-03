export type Entry={id:string;name:string;tier:number;icon:string|null;description:string;stages:string[]|null;stageSource:string|null;stageCheckedAt:string|null};
export type Game={key:string;names:string[];placement:number;status:string;player:string;date:string;url:string;complete:boolean;sourceType?:string;seconds?:number|null;patch?:string|null};
export type Row=Entry&{n:number;mean:number;top4:number;user:number;reviewed:number;auto:number;samples:Game[]};
export function gradeFor(mean:number){return mean<3.5?'S':mean<4?'A':mean<4.5?'B':'C';}
export function selectGames<T extends Game>(games:T[],source:string,patch='all'):T[]{
  return games.filter(g=>(source==='all'||g.status!=='auto_consistent')&&(patch==='all'||(patch==='unknown'?!g.patch:g.patch===patch)));
}
export function aggregate(entries:Entry[],games:Game[],source:string,patch='all'):Row[]{
  const active=selectGames(games,source,patch);
  return entries.map(entry=>{
    const samples=active.filter(g=>g.names.includes(entry.name));
    return {...entry,n:samples.length,mean:samples.length?samples.reduce((n,g)=>n+g.placement,0)/samples.length:Infinity,
      top4:samples.filter(g=>g.placement<=4).length,user:samples.filter(g=>g.status==='user_verified').length,
      reviewed:samples.filter(g=>g.status==='assistant_reviewed').length,auto:samples.filter(g=>g.status==='auto_consistent').length,samples};
  }).sort((a,b)=>a.mean-b.mean||b.n-a.n||a.name.localeCompare(b.name,'zh-CN'));
}
