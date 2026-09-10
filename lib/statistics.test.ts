import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { aggregate, gradeFor } from './statistics.ts';
test('SABC boundaries preserve the agreed cutoffs',()=>{
  assert.deepEqual([3.49,3.5,3.99,4,4.49,4.5].map(gradeFor),['S','A','A','B','B','C']);
});
test('stage data preserves variants and corrected icon tiers',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('./dataset.json',import.meta.url),'utf8'));
  const byId=(id:string)=>data.entries.find((e:{id:string})=>e.id===id);
  assert.deepEqual(byId('DA_WovenMagic').stages,['2-1']);
  assert.equal(byId('DA_WovenMagic').icon,'/icons/DA_WovenMagic.jpg');
  assert.deepEqual(byId('DA_PandorasBench').stages,['2-1','3-2']);
  assert.equal(byId('DA_PandorasBench').icon,'/icons/DA_PandorasBench.jpg');
  assert.deepEqual(byId('DA_PandorasItemsI').stages,['2-1','3-2','4-2']);
  assert.equal(byId('DA_ConstructACompanion').stages,null);
  for(const e of data.entries)if(e.stages)assert.ok(e.stages.every((s:string)=>['2-1','3-2','4-2'].includes(s)));
});
test('website matches every accepted mean and sample count',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('./dataset.json',import.meta.url),'utf8'));
  // The independent extraction summary is available in the research workspace,
  // while the public repository contains only the exported website snapshot.
  const summaryPath=new URL('../../data/streamer_batch/summary_fast.json',import.meta.url);
  const summary=fs.existsSync(summaryPath)?JSON.parse(fs.readFileSync(summaryPath,'utf8')):null;
  const rows=aggregate(data.entries,data.games,'all');
  assert.equal(rows.reduce((n,r)=>n+r.n,0),data.games.reduce((n:number,g:{names:string[]})=>n+g.names.length,0));
  for(const game of data.games)assert.ok(Number.isInteger(game.placement)&&game.placement>=1&&game.placement<=8);
  if(summary){
  assert.equal(data.games.length,summary.total_games);
  assert.equal(rows.reduce((n,r)=>n+r.n,0),summary.total_augment_facts);
  for(const expected of summary.augments){
    const actual=rows.find(r=>r.name===expected.name)!;
    assert.equal(actual.n,expected.n);assert.equal(actual.mean,expected.mean_placement);assert.equal(gradeFor(actual.mean),expected.grade);
  }
  }
  for(const row of aggregate(data.entries,data.games,'reviewed'))assert.equal(row.auto,0);
  for(const entry of data.entries)if(entry.icon)assert.ok(fs.existsSync(new URL('../public'+entry.icon,import.meta.url)));
  assert.equal(new Set(data.games.map((g:{key:string})=>g.key)).size,data.games.length);
});
