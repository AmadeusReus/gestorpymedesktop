#!/usr/bin/env node

/**
 * Script para generar hashes bcrypt correctos de las contraseñas de prueba
 * Uso: node generate-password-hashes.mjs
 */

import bcrypt from 'bcryptjs';

const passwords = {
  'admin123': 'admin',
  'empleado123': 'empleado1, empleado2',
  'supervisor123': 'supervisor',
};

console.log('\n🔐 Generando hashes bcrypt para contraseñas de prueba...\n');

for (const [password, users] of Object.entries(passwords)) {
  const hash = bcrypt.hashSync(password, 12);
  console.log(`Contraseña: ${password}`);
  console.log(`Usuarios: ${users}`);
  console.log(`Hash: ${hash}`);
  console.log('');
}

console.log('\n✅ Copia estos hashes en init-database.sql\n');
