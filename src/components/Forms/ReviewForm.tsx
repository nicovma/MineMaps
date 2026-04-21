'use client';
import { useState } from 'react';
import { submitReview } from '@/app/actions/miningActions';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ReviewForm({ campId, campName, onSuccess }: { campId: string, campName: string, onSuccess: (reviewId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('camp_id', campId);
    
    const res = await submitReview(formData);
    setLoading(false);
    
    if (res.success && res.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`minemaps_pending_${campId}`, res.data as string);
      }
      setSuccessStatus(true);
      setTimeout(() => {
        onSuccess(res.data as string);
      }, 4000);
    }
  }

  if (successStatus) {
    return (
      <div className="mt-8 text-center bg-zinc-950 border border-yellow-500/30 rounded-2xl p-8 animate-in slide-in-from-bottom">
         <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black p-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
         </div>
         <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">{t('review_sent')}</h3>
         <p className="text-zinc-400 font-medium pb-2">{t('review_pending_msg')}</p>
      </div>
    );
  }

  const categoryKeys = ['food', 'bed', 'vibe', 'wifi'];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-[16px] mt-6 pb-6 animate-in slide-in-from-bottom border-t border-zinc-800 pt-8">
      <div className="text-center mb-2">
         <h3 className="text-xl font-black text-white uppercase tracking-wider">{t('new_review')}</h3>
         <p className="text-yellow-500 font-bold uppercase tracking-widest text-xs mt-1">{campName}</p>
      </div>
      
      <div className="flex flex-col gap-4">
        
        {/* 1. Agency */}
        <div className="relative">
          <select required name="agency" defaultValue="" className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 pr-12 outline-none focus:border-yellow-500 transition-all font-medium appearance-none text-[16px]">
            <option value="" disabled>{t('agency')}</option>
            <option value="Hays">Hays</option>
            <option value="IPA">IPA</option>
            <option value="Otro">{t('other')}</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-500">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* 2. Type */}
        <div className="relative">
          <select required name="type" defaultValue="" className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 pr-12 outline-none focus:border-yellow-500 transition-all font-medium appearance-none text-[16px]">
            <option value="" disabled>{t('emp_type')}</option>
            <option value="Casual">{t('casual')}</option>
            <option value="Full time">{t('full_time')}</option>
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-500">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* 3. Position and Rate */}
        <div className="grid grid-cols-2 gap-4">
           <div className="relative">
             <select required name="role" defaultValue="" className="w-full bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 pr-10 outline-none focus:border-yellow-500 transition-all font-medium appearance-none text-[16px]">
               <option value="" disabled>{t('position')}</option>
               <option value="Kitchen-hand">Kitchen-hand</option>
               <option value="Housekeeping">Housekeeping</option>
               <option value="Chef">Chef</option>
               <option value="Facilities">Facilities</option>
             </select>
             <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-zinc-500">
               <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
           </div>
           <input required name="rate" type="number" step="0.01" placeholder={t('hour_rate')} className="bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 outline-none focus:border-yellow-500 transition-all font-medium placeholder:text-zinc-600 text-[16px]" />
        </div>

        {/* 4. Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
             <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t('hour_start')}</label>
             <input required name="swing_start" type="text" placeholder="00:00" pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" title="HH:MM" className="bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 outline-none focus:border-yellow-500 transition-all font-medium placeholder-zinc-700 font-mono tracking-widest text-center text-[16px]" />
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs font-bold text-zinc-500 uppercase px-1">{t('hour_end')}</label>
             <input required name="swing_end" type="text" placeholder="00:00" pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" title="HH:MM" className="bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 outline-none focus:border-yellow-500 transition-all font-medium placeholder-zinc-700 font-mono tracking-widest text-center text-[16px]" />
          </div>
        </div>

      </div>

      {/* 5. Ratings */}
      <div className="grid grid-cols-2 gap-4">
        {categoryKeys.map(cat => (
          <div key={cat} className="flex flex-col bg-zinc-950/50 p-3 rounded-xl border border-zinc-800">
            <label className="text-zinc-500 mb-2 font-bold uppercase tracking-wider text-xs">{t(cat)}</label>
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {[1,2,3,4,5].map(num => (
                <label key={num} className="cursor-pointer">
                  <input type="radio" required name={`rating_${cat}`} value={num} className="peer sr-only" />
                  <div className="w-full py-2 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-500 font-bold peer-checked:bg-yellow-500 peer-checked:text-black transition-colors text-sm">
                    {num}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <textarea name="comment" placeholder={t('comment_placeholder')} className="bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 outline-none focus:border-yellow-500 transition-all resize-none h-24 font-medium placeholder:text-zinc-600 text-[16px]" />

      <button disabled={loading} type="submit" className="w-full mt-2 bg-yellow-500 text-black font-black uppercase tracking-wider py-4 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]">
        {loading ? t('submitting') : t('submit_review')}
      </button>
    </form>
  );
}
