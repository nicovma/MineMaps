import { supabase } from '@/lib/supabase';
import MiningMap from '@/components/Map/MiningMap';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function Page() {
  const { data: camps, error } = await supabase.from('camps').select('*').ilike('status', '%approved%');
  
  if (error) {
    console.error('Failed to fetch camps:', error);
  }

  return (
    <main className="w-full h-screen bg-zinc-950 overflow-hidden relative font-sans">
      <MiningMap initialCamps={camps || []} />
    </main>
  );
}
