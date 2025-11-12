// electron/security.ts

import * as bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    const hash = await bcrypt.hash(password, salt)
    return hash
  } catch (error) {
    console.error('Error al hashear la contraseña:', error)
    throw new Error('No se pudo procesar la contraseña.')
  }
}

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
  } catch (error) {
    console.error('Error al verificar la contraseña:', error)
    return false
  }
}