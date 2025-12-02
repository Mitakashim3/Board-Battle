import { BattleArena } from '@/components/game';

interface BattlePageProps {
  params: {
    battleId: string;
  };
}

export default function BattleSessionPage({ params }: BattlePageProps) {
  return <BattleArena battleId={params.battleId} />;
}
