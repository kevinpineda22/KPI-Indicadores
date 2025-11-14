#!/usr/bin/env node

/**
 * Script de verificación pre-despliegue
 * Verifica que todo esté listo para desplegar en Vercel
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const checks = [];
let hasErrors = false;

console.log('🔍 Verificando configuración para despliegue en Vercel...\n');

// 1. Verificar archivos requeridos
const requiredFiles = [
    'vercel.json',
    'package.json',
    'src/server.js',
    'api/index.js',
    '.vercelignore'
];

requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, '..', file));
    if (exists) {
        checks.push(`✅ ${file} existe`);
    } else {
        checks.push(`❌ ${file} NO ENCONTRADO`);
        hasErrors = true;
    }
});

// 2. Verificar package.json
try {
    const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
    );
    
    checks.push(`✅ package.json es válido`);
    
    if (packageJson.type === 'module') {
        checks.push(`✅ "type": "module" configurado`);
    } else {
        checks.push(`⚠️  Se recomienda "type": "module"`);
    }
    
    if (packageJson.scripts && packageJson.scripts.start) {
        checks.push(`✅ Script "start" existe`);
    } else {
        checks.push(`❌ Falta script "start" en package.json`);
        hasErrors = true;
    }
} catch (error) {
    checks.push(`❌ Error al leer package.json: ${error.message}`);
    hasErrors = true;
}

// 3. Verificar vercel.json
try {
    const vercelJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf-8')
    );
    
    checks.push(`✅ vercel.json es válido`);
    
    if (vercelJson.builds && vercelJson.builds.length > 0) {
        checks.push(`✅ Builds configurados correctamente`);
    }
    
    if (vercelJson.routes && vercelJson.routes.length > 0) {
        checks.push(`✅ Rutas configuradas correctamente`);
    }
} catch (error) {
    checks.push(`❌ Error al leer vercel.json: ${error.message}`);
    hasErrors = true;
}

// 4. Verificar imports en server.js
try {
    const serverJs = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'server.js'),
        'utf-8'
    );
    
    if (serverJs.includes('export default app')) {
        checks.push(`✅ server.js exporta app correctamente`);
    } else {
        checks.push(`⚠️  Verifica que server.js exporte app`);
    }
    
    if (serverJs.includes('import') && !serverJs.includes('require(')) {
        checks.push(`✅ Usando ES modules (import/export)`);
    }
} catch (error) {
    checks.push(`❌ Error al verificar server.js: ${error.message}`);
}

// 5. Verificar estructura de directorios
const requiredDirs = ['src', 'src/controllers', 'src/services', 'src/routes'];

requiredDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(__dirname, '..', dir));
    if (exists) {
        checks.push(`✅ Directorio ${dir}/ existe`);
    } else {
        checks.push(`⚠️  Directorio ${dir}/ no encontrado`);
    }
});

// 6. Verificar .env.example
const envExampleExists = fs.existsSync(path.join(__dirname, '..', '.env.example'));
if (envExampleExists) {
    checks.push(`✅ .env.example existe (referencia para variables)`);
} else {
    checks.push(`⚠️  Crea .env.example con las variables necesarias`);
}

// 7. Verificar .gitignore
const gitignoreExists = fs.existsSync(path.join(__dirname, '..', '.gitignore'));
if (gitignoreExists) {
    const gitignore = fs.readFileSync(path.join(__dirname, '..', '.gitignore'), 'utf-8');
    if (gitignore.includes('.env') && gitignore.includes('node_modules')) {
        checks.push(`✅ .gitignore configurado correctamente`);
    } else {
        checks.push(`⚠️  Verifica que .gitignore incluya .env y node_modules`);
    }
} else {
    checks.push(`⚠️  Crea .gitignore para excluir archivos sensibles`);
}

// Mostrar resultados
console.log(checks.join('\n'));
console.log('\n' + '='.repeat(60));

if (hasErrors) {
    console.log('\n❌ HAY ERRORES CRÍTICOS - Corrígelos antes de desplegar\n');
    process.exit(1);
} else {
    console.log('\n✅ TODO LISTO PARA DESPLEGAR EN VERCEL\n');
    console.log('📝 Próximos pasos:');
    console.log('   1. Sube tu código a GitHub');
    console.log('   2. Ve a https://vercel.com/new');
    console.log('   3. Conecta tu repositorio');
    console.log('   4. Configura las variables de entorno');
    console.log('   5. ¡Despliega!\n');
    console.log('📖 Guía completa en: DEPLOY_VERCEL.md\n');
}
