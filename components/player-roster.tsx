import { ChevronDown, Users } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from '@/components/ui/popover';

export function PlayerRoster({players}:{players:string[]}){
  return <Popover><PopoverTrigger className="player-roster-trigger" aria-label={`查看 ${players.length} 位选手名单`}><Users size={14}/>{players.length} 位选手合并<ChevronDown size={14}/></PopoverTrigger>
    <PopoverContent align="end" sideOffset={10} className="player-roster-panel">
      <PopoverTitle>选手名单 <span>{players.length} 位</span></PopoverTitle>
      <PopoverDescription>这些选手的对局合并参与统计。</PopoverDescription>
      <ul>{players.map(player=><li key={player}><span className="roster-dot"/>{player}</li>)}</ul>
    </PopoverContent>
  </Popover>;
}
