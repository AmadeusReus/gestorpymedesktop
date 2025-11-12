/**
 * Script Maestro de Pruebas
 *
 * Ejecutar con: node run-tests.mjs [test-name]
 * Opciones:
 *   - auth      : Pruebas de autenticación
 *   - turno     : Pruebas de inicialización de turnos
 *   - all       : Todas las pruebas
 *   - help      : Mostrar ayuda
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const tests = {
  auth: 'test-auth.mjs',
  turno: 'test-turno.mjs'
}

function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         Script de Pruebas - GestorPyME Desktop                ║
╚════════════════════════════════════════════════════════════════╝

USO:
  node run-tests.mjs [opción]

OPCIONES:
  auth      - Ejecutar pruebas de autenticación
  turno     - Ejecutar pruebas de inicialización de turnos
  all       - Ejecutar todas las pruebas
  help      - Mostrar esta ayuda

EJEMPLOS:
  node run-tests.mjs auth
  node run-tests.mjs turno
  node run-tests.mjs all

REQUISITOS:
  - Variables de entorno en .env configuradas (DB_HOST, DB_USER, etc.)
  - PostgreSQL ejecutándose
  - Base de datos inicializada con el schema
  `)
}

async function runTest(testName) {
  return new Promise((resolve) => {
    const testFile = tests[testName]
    if (!testFile) {
      console.error(`❌ Test desconocido: ${testName}`)
      resolve(false)
      return
    }

    const testPath = path.join(__dirname, testFile)
    console.log(`\n▶️  Ejecutando: ${testFile}...\n`)

    const child = spawn('node', [testPath])

    child.stdout.on('data', (data) => {
      process.stdout.write(data)
    })

    child.stderr.on('data', (data) => {
      process.stderr.write(data)
    })

    child.on('close', (code) => {
      resolve(code === 0)
    })
  })
}

async function main() {
  const args = process.argv.slice(2)
  const testName = args[0] || 'help'

  if (testName === 'help') {
    printHelp()
    process.exit(0)
  }

  if (testName === 'all') {
    console.log('\n🔄 Ejecutando todas las pruebas...\n')

    for (const [name] of Object.entries(tests)) {
      const success = await runTest(name)
      if (!success) {
        console.error(`\n❌ Prueba ${name} falló`)
        process.exit(1)
      }
    }

    console.log('\n✅ ¡Todas las pruebas pasaron!')
    process.exit(0)
  }

  if (tests[testName]) {
    const success = await runTest(testName)
    process.exit(success ? 0 : 1)
  } else {
    console.error(`❌ Opción desconocida: ${testName}`)
    console.error('Usa: node run-tests.mjs help')
    process.exit(1)
  }
}

main()
