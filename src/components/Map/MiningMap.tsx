'use client';
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AddCampForm from '@/components/Forms/AddCampForm';
import ReviewForm from '@/components/Forms/ReviewForm';
import ReviewList from '@/components/Forms/ReviewList';
import { useLanguage } from '@/contexts/LanguageContext';
import { checkReviewStatus, getApprovedReviewCount } from '@/app/actions/miningActions';

// Dynamic import for Leaflet purely on client side
const ClientLeafletMap = dynamic(() => import('./ClientLeafletMap'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-full bg-zinc-950 text-yellow-500 font-mono tracking-widest uppercase">MAP SYSTEM OFFLINE...</div>
});

const FLAG_MAP = {
  en: 'EN',
  es: 'ES',
  it: 'IT'
};

export default function MiningMap({ initialCamps }: { initialCamps: any[] }) {
  const [addingLocation, setAddingLocation] = useState<{lat: number, lng: number} | null>(null);
  const [drawerCamp, setDrawerCamp] = useState<any | null>(null);
  const [drawerMode, setDrawerMode] = useState<'detail' | 'write' | 'read'>('detail');
  const [flyTarget, setFlyTarget] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -21.144, lng: 149.186 }); // Mackay fallback
  const [pendingReviews, setPendingReviews] = useState<Record<string, boolean>>({});
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    async function loadCampData() {
      if (!drawerCamp) return;
      
      // 1. Always fetch the approved review count first
      const countRes = await getApprovedReviewCount(drawerCamp.id);
      if (countRes.success) {
         setReviewCount(countRes.count);
      } else {
         setReviewCount(0);
      }

      // 2. Check for personal pending reviews
      const reviewId = localStorage.getItem(`minemaps_pending_${drawerCamp.id}`);
      if (!reviewId) return;

      // Compatibility fix for old cached "true" string instead of a valid UUID:
      if (reviewId === 'true') {
         localStorage.removeItem(`minemaps_pending_${drawerCamp.id}`);
         return;
      }
      
      // We stored a reviewId, let's verify if it's still pending on the server
      const res = await checkReviewStatus(reviewId);
      
      // If it fails to fetch (maybe invalid ID or network), or if success but not pending
      if (!res.success || (res.success && res.status !== 'pending')) {
         // Review was either approved, rejected, or lost. User is free to post again
         localStorage.removeItem(`minemaps_pending_${drawerCamp.id}`);
         setPendingReviews(prev => {
            const next = {...prev};
            delete next[drawerCamp.id];
            return next;
         });
      } else {
         // Still pending
         setPendingReviews(prev => ({ ...prev, [drawerCamp.id]: true }));
      }
    }
    loadCampData();
  }, [drawerCamp]);
  
  const filteredCamps = useMemo(() => {
    if (!searchQuery) return [];
    return initialCamps.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.company.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, initialCamps]);

  return (
    <>
      {/* HUD HEADER & SEARCH */}
      <div className="absolute top-0 left-0 right-0 z-[40] px-4 py-6 md:py-8 pointer-events-none flex flex-col bg-gradient-to-b from-black/90 via-black/40 to-transparent pb-10">
        
        <div className="flex justify-between items-center w-full max-w-md mx-auto mb-6">
           {/* Language Switcher */}
           <div className="pointer-events-auto relative z-[50]">
               <button 
                 onClick={() => setLangMenuOpen(!langMenuOpen)}
                 className="bg-zinc-900/90 backdrop-blur-md border border-zinc-700 text-2xl w-12 h-12 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-lg"
                 title="Change Language"
               >
                 {language === 'en' ? '🇬🇧' : language === 'es' ? '🇪🇸' : '🇮🇹'}
               </button>
               {langMenuOpen && (
                 <div className="absolute top-14 left-0 bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col w-12 mt-1 animate-in slide-in-from-top-2">
                   {(['en', 'es', 'it'] as const).map((lang) => (
                     <button 
                       key={lang}
                       onClick={() => { setLanguage(lang); setLangMenuOpen(false); }}
                       className={`py-3 flex justify-center items-center text-xl hover:bg-zinc-800 transition-colors ${language === lang ? 'bg-zinc-800 bg-opacity-70 border-l-2 border-yellow-500' : ''}`}
                     >
                       {lang === 'en' ? '🇬🇧' : lang === 'es' ? '🇪🇸' : '🇮🇹'}
                     </button>
                   ))}
                 </div>
               )}
           </div>

           {/* Brand Logo */}
           <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-yellow-500 drop-shadow-lg pointer-events-auto cursor-default text-center">
             SWING<span className="text-white">REVIEWS</span> <span className="text-sm font-bold text-yellow-500/50">AU</span>
           </h1>
           
           {/* Spacer balancing right side */}
           <div className="w-12"></div>
        </div>
        
        {/* Searchbar */}
        <div className="w-full max-w-md mx-auto relative pointer-events-auto">
           <input 
             type="text" 
             placeholder={t('search_placeholder')}
             value={searchQuery}
             onChange={e => setSearchQuery(e.target.value)}
             className="w-full bg-zinc-900/80 backdrop-blur-md border border-zinc-700 text-white rounded-full py-4 px-6 outline-none focus:border-yellow-500 transition-colors shadow-lg shadow-black/50 tracking-wide font-medium text-[16px]"
           />
           {filteredCamps.length > 0 && (
             <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden shadow-2xl">
               {filteredCamps.map(camp => (
                 <button 
                   key={camp.id}
                   onClick={() => {
                     setFlyTarget({ lat: camp.lat, lng: camp.lng });
                     setDrawerCamp(camp);
                     setDrawerMode('detail');
                     setSearchQuery('');
                   }}
                   className="w-full text-left px-6 py-4 hover:bg-zinc-800 transition-colors border-b border-zinc-800/50 last:border-0 flex justify-between items-center"
                 >
                   <span className="font-black text-white max-w-[70%] truncate tracking-tight">{camp.name}</span>
                   <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 truncate">{camp.company}</span>
                 </button>
               ))}
             </div>
           )}
        </div>
      </div>

      <div className="w-full h-full absolute inset-0 z-0 bg-zinc-950">
         <ClientLeafletMap 
           camps={initialCamps} 
           flyTarget={flyTarget}
           onCenterChange={(pos: any) => setMapCenter(pos)}
           onMapClick={() => {
             if (drawerCamp) {
               setDrawerCamp(null);
             }
           }}
           onCampClick={(camp: any) => {
             setDrawerCamp(camp);
             setDrawerMode('detail');
           }}
         />
         
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 z-[35]">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
             <line x1="12" y1="0" x2="12" y2="8"></line>
             <line x1="12" y1="16" x2="12" y2="24"></line>
             <line x1="0" y1="12" x2="8" y2="12"></line>
             <line x1="16" y1="12" x2="24" y2="12"></line>
           </svg>
         </div>
      </div>

      {addingLocation && !drawerCamp && (
        <AddCampForm 
          lat={addingLocation.lat} 
          lng={addingLocation.lng} 
          onClose={() => setAddingLocation(null)}
        />
      )}

      {/* FAB */}
      <button 
        onClick={() => {
           setAddingLocation({lat: mapCenter.lat, lng: mapCenter.lng});
        }}
        className="absolute bottom-8 right-6 md:right-10 z-[30] w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-4xl hover:scale-110 active:scale-95 shadow-[0_4px_25px_rgba(255,215,0,0.5)] text-black transition-transform"
      >
         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      {/* Details/Review Drawer */}
      <div className={`absolute bottom-0 left-0 right-0 z-[60] bg-zinc-900 border-t border-yellow-500/20 pt-3 px-6 pb-12 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] ${drawerCamp ? 'translate-y-0' : 'translate-y-full'} ${drawerMode === 'write' || drawerMode === 'read' ? 'h-[102dvh] rounded-none' : 'rounded-t-3xl'} md:w-[500px] md:left-10 md:right-auto md:border md:border-b-0`}>
        {drawerCamp && (
          <div className={`overflow-y-auto no-scrollbar transition-all duration-500 h-full ${drawerMode === 'detail' ? 'max-h-[60vh]' : ''}`}>
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 cursor-pointer hover:bg-zinc-700 transition" onClick={() => setDrawerCamp(null)}></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-1">{drawerCamp.name}</h2>
                <p className="text-yellow-500 text-sm font-bold uppercase tracking-widest">{drawerCamp.company}</p>
              </div>
              <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-2 rounded-full transition-colors flex items-center justify-center" onClick={() => setDrawerCamp(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"></path></svg>
              </button>
            </div>
            
            {drawerMode === 'detail' && (
               <div className="mt-8 flex flex-col gap-3">
                 {reviewCount === 0 ? (
                    <div className="w-full bg-zinc-950/30 border border-zinc-800/30 text-zinc-500 font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                       📭 {t('no_reviews_yet')}
                    </div>
                 ) : reviewCount === null ? (
                    <div className="w-full bg-zinc-950/30 border border-zinc-800/30 py-3.5 rounded-xl flex items-center justify-center h-[52px] animate-pulse"></div>
                 ) : (
                    <button 
                      onClick={() => setDrawerMode('read')}
                      className="w-full bg-zinc-900 border border-zinc-800/50 text-white font-medium py-3.5 rounded-xl hover:bg-zinc-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      {t('ver_reviews')} ({reviewCount})
                    </button>
                 )}
                 
                 {pendingReviews[drawerCamp.id] ? (
                   <div className="w-full bg-zinc-950/50 border border-yellow-500/20 text-yellow-500/70 font-bold uppercase tracking-widest text-center py-5 rounded-xl text-xs flex flex-col items-center gap-2">
                     <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     {t('pending_moderation')}
                   </div>
                 ) : (
                   <button 
                     onClick={() => setDrawerMode('write')}
                     className="w-full bg-zinc-950 border border-yellow-500/50 text-yellow-500 font-bold tracking-wider py-4 rounded-xl hover:bg-zinc-900 transition-colors shadow-sm flex items-center justify-center gap-2"
                   >
                     <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                     {t('post_review')}
                   </button>
                 )}
               </div>
            )}

            {drawerMode === 'write' && (
              <ReviewForm campId={drawerCamp.id} campName={drawerCamp.name} onSuccess={(reviewId: string) => {
                setPendingReviews(prev => ({ ...prev, [drawerCamp.id]: true }));
              }} />
            )}

            {drawerMode === 'read' && (
              <ReviewList campId={drawerCamp.id} onBack={() => setDrawerMode('detail')} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
