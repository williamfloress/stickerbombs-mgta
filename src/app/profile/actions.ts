'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const telefono = (formData.get('telefono') as string)?.trim()
  const direccion = (formData.get('direccion') as string)?.trim()

  const { error } = await supabase
    .from('users')
    .update({ telefono, direccion })
    .eq('id', user.id)

  if (error) {
    console.error("Profile update error:", error)
    redirect('/profile?error=true')
  }

  revalidatePath('/')
  revalidatePath('/profile')
  revalidatePath('/checkout')
  redirect('/profile?success=true')
}
