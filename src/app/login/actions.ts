'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const remember = formData.get('remember') === 'on'

  // 1. Validación básica para evitar inyección de payloads masivos
  if (!email || !password || email.length > 100 || password.length > 100) {
    redirect('/login?error=true&message=' + encodeURIComponent('Credenciales inválidas.'))
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // 2. Retraso artificial (Time-based mitigation) para ralentizar ataques de fuerza bruta
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    console.error("Login Error details:", error)
    // Usar mensaje genérico para no dar pistas al atacante sobre si el correo existe
    redirect('/login?error=true&message=' + encodeURIComponent('Correo o contraseña incorrectos.'))
  }

  const cookieStore = await cookies()
  if (remember) {
    cookieStore.set('rememberedEmail', email, { maxAge: 30 * 24 * 60 * 60, path: '/' })
  } else {
    cookieStore.delete('rememberedEmail')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
