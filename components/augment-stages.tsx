import type { Entry } from '@/lib/statistics';
export function AugmentStages({entry}:{entry:Entry}){
  return <section className="availability" aria-label="可出现阶段">
    <h3>可出现阶段</h3>
    {entry.stages===null?<p className="availability-unknown">阶段资料待补充</p>:<>
      <div className="stage-badges">{['2-1','3-2','4-2'].map(stage=>{
        const available=entry.stages!.includes(stage);
        return <span className={available?'stage-badge available':'stage-badge unavailable'} key={stage} aria-label={`${stage}：${available?'可出现':'不出现'}`}><b>{stage}</b><small>{available?'可出现':'不出现'}</small></span>;
      })}</div>
      <p className="stage-note">常规强化选择阶段，额外获得的海克斯另计。<a href={entry.stageSource!} target="_blank" rel="noreferrer">阶段资料 ↗</a></p>
    </>}
  </section>;
}
