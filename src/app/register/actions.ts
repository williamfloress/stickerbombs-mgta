'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const name = (formData.get('name') as string)?.trim()

  // 1. Validaciones para evitar payloads masivos o datos incompletos
  if (!email || !password || !name) {
    redirect('/register?error=true&message=' + encodeURIComponent('Todos los campos son obligatorios.'))
  }
  
  if (email.length > 100 || password.length > 100 || name.length > 50) {
    redirect('/register?error=true&message=' + encodeURIComponent('Datos proporcionados exceden el límite de caracteres.'))
  }

  // Prevención de contraseñas débiles que son fáciles de romper con fuerza bruta
  if (password.length < 6) {
    redirect('/register?error=true&message=' + encodeURIComponent('La contraseña debe tener al menos 6 caracteres.'))
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: name,
      }
    }
  })

  if (error) {
    // 2. Retraso artificial (Time-based mitigation) para ralentizar creación de cuentas masivas
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.error("Signup Error details:", error)
    redirect('/register?error=true&message=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
