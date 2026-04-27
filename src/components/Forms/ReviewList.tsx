'use client';
import { useState, useEffect } from 'react';
import { getApprovedReviews } from '@/app/actions/miningActions';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ReviewList({ campId, onBack }: { campId: string, onBack: () => void }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getApprovedReviews(campId);
      if (res.success) {
        setReviews(res.data);
      }
      setLoading(false);
    }
    load();
  }, [campId]);

  const filteredReviews = roleFilter 
    ? reviews.filter(r => r.role === roleFilter)
    : reviews;

  const uniqueRoles = Array.from(new Set(reviews.map((r: any) => r.role)));

  if (loading) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-12 text-zinc-500 animate-pulse">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-8 h-8 mb-4 animate-spin text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        <span className="uppercase tracking-widest text-xs font-bold">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-zinc-800 pt-6 animate-in slide-in-from-bottom">
      <div className="flex justify-between items-center mb-6">
         <button onClick={onBack} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase font-bold tracking-wider">
           <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
           {t('back')}
         </button>
         {reviews.length > 0 && (
           <div className="relative">
             <select 
               value={roleFilter} 
               onChange={e => setRoleFilter(e.target.value)}
               className="bg-zinc-950 border border-zinc-800 text-yellow-500 font-bold text-xs uppercase tracking-wider rounded-lg py-2 pl-3 pr-8 outline-none focus:border-yellow-500 appearance-none shadow-sm cursor-pointer"
             >
               <option value="">{t('all_roles')}</option>
               {uniqueRoles.map(role => (
                 <option key={role} value={role as string}>{role as string}</option>
               ))}
             </select>
             <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-500">
               <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
             </div>
           </div>
         )}
      </div>

      {reviews.length === 0 ? (
        <div className="bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl text-center">
           <span className="text-4xl block mb-2 opacity-30">📭</span>
           <p className="text-zinc-500 font-medium">{t('no_reviews')}</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-zinc-950/50 border border-zinc-800/50 p-8 rounded-2xl text-center">
           <p className="text-zinc-500 font-medium">{t('no_reviews_role')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredReviews.map(rev => (
            <div key={rev.id} className="bg-zinc-950/50 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-3">
               <div className="flex justify-between items-start">
                  <div>
                     <h4 className="text-white font-black text-lg tracking-tight leading-none mb-1">{rev.role}</h4>
                     <p className="text-yellow-500 text-xs font-bold uppercase tracking-widest">{rev.agency}</p>
                  </div>
                  <div className="text-right">
                     <span className="text-white font-mono font-bold text-base block">${rev.rate}/hr</span>
                     {(rev.swing_start && rev.swing_end) && (
                        <span className="text-zinc-500 font-mono text-[10px] tracking-wider bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 inline-block mt-1">
                          {rev.swing_start} - {rev.swing_end}
                        </span>
                     )}
                  </div>
               </div>
               
               <div className="grid grid-cols-4 gap-2 mt-1">
                 {Object.entries(rev.ratings || {}).map(([key, val]) => (
                   <div key={key} className="bg-zinc-900 rounded p-1.5 flex flex-col items-center border border-zinc-800/50">
                     <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black mb-1">{t(key)}</span>
                     <span className="text-white font-bold text-sm block">{(typeof val === 'number') ? val.toFixed(1) : Number(val).toFixed(1)}</span>
                   </div>
                 ))}
               </div>

               {rev.comment && (
                 <p className="text-zinc-400 text-sm italic font-medium leading-relaxed bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 mt-1">&quot;{rev.comment}&quot;</p>
               )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
