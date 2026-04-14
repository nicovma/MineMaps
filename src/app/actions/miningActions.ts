'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createCamp(formData: FormData) {
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const lat = parseFloat(formData.get('lat') as string);
  const lng = parseFloat(formData.get('lng') as string);

  const { data, error } = await supabase
    .from('camps')
    .insert([{ name, company, lat, lng, status: 'pending' }])
    .select();

  if (error) {
    console.error('Error creating camp:', error);
    return { success: false, error: error.message };
  }

  // We still revalidate so the UI gets fresh data if admin approves, but this pending one won't show
  revalidatePath('/');
  return { success: true, data };
}

export async function submitReview(formData: FormData) {
  const camp_id = formData.get('camp_id') as string;
  const comment = formData.get('comment') as string;
  const agency = formData.get('agency') as string;
  const role = formData.get('role') as string;
  const rate = parseFloat(formData.get('rate') as string) || 0;
  const swing_start = formData.get('swing_start') as string || null;
  const swing_end = formData.get('swing_end') as string || null;
  
  const ratings = {
    food: parseInt(formData.get('rating_food') as string, 10) || 1,
    bed: parseInt(formData.get('rating_bed') as string, 10) || 1,
    wifi: parseInt(formData.get('rating_wifi') as string, 10) || 1,
    vibe: parseInt(formData.get('rating_vibe') as string, 10) || 1,
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ camp_id, ratings, comment, agency, role, rate, status: 'pending', swing_start, swing_end }])
    .select();

  if (error || !data || data.length === 0) {
    console.error('Error submitting review:', error);
    return { success: false, error: error?.message || 'Error saving review' };
  }

  revalidatePath('/');
  return { success: true, data: data[0].id };
}

export async function checkReviewStatus(reviewId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('status')
    .eq('id', reviewId)
    .single();

  if (error) {
    return { success: false, status: null };
  }
  
  return { success: true, status: data?.status };
}

export async function getApprovedReviews(campId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('camp_id', campId)
    .ilike('status', '%approved%')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return { success: false, data: [] };
  }
  
  return { success: true, data: data || [] };
}

export async function getApprovedReviewCount(campId: string) {
  const { count, error } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('camp_id', campId)
    .ilike('status', '%approved%');

  if (error) {
    return { success: false, count: 0 };
  }
  
  return { success: true, count: count || 0 };
}
