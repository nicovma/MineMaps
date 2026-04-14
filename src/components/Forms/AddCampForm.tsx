'use client';
import { useState } from 'react';
import { createCamp } from '@/app/actions/miningActions';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddCampFormProps {
  lat: number;
  lng: number;
  onClose: () => void;
}

export default function AddCampForm({ lat, lng, onClose }: AddCampFormProps) {
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('lat', lat.toString());
    formData.append('lng', lng.toString());
    
    const res = await createCamp(formData);
    setLoading(false);
    
    if (res.success) {
      setSuccessStatus(true);
      setTimeout(() => {
        onClose();
      }, 3500);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-zinc-900 border border-yellow-500/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl relative shadow-yellow-500/10 transition-all">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {successStatus ? (
          <div className="text-center py-6 animate-in zoom-in-95">
             <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black p-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
             </div>
             <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{t('received')}</h2>
             <p className="text-sm text-yellow-500/80 font-medium">{t('camp_pending_msg')}</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">{t('register_camp')}</h2>
            <p className="text-xs text-yellow-500/80 mb-6 font-mono tracking-widest">LOC: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required name="name" className="bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-zinc-600" placeholder={t('camp_name')} />
              <input required name="company" className="bg-zinc-950/50 border border-zinc-800 text-white rounded-xl p-4 outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-zinc-600" placeholder={t('mining_company')} />
              
              <button disabled={loading} type="submit" className="mt-4 bg-yellow-500 text-black font-black uppercase tracking-wider py-4 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all w-full flex justify-center items-center">
                {loading ? (
                   <span className="opacity-70 flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     {t('processing')}
                   </span>
                ) : t('add_location')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
