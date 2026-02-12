# 🚀 GUÍA DE DEPLOY - RenovaFácil Copies

## Opción 1: Deploy rápido en Vercel (Recomendada - 5 minutos)

### Paso 1: Preparar archivos
```bash
cd /Users/hipojoachim/Desktop/app

# Crear una carpeta limpia sin node_modules
mkdir -p ../renovafacil-deploy
cp -r src ../renovafacil-deploy/
cp -r public ../renovafacil-deploy/ 2>/dev/null || true
cp index.html package.json vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json tailwind.config.js postcss.config.js components.json eslint.config.js README.md ../renovafacil-deploy/

# Comprimir
cd ..
zip -r renovafacil-copies.zip renovafacil-deploy/
```

### Paso 2: Subir a Vercel
1. Andá a https://vercel.com
2. Creá cuenta con tu email
3. Click en "Add New..." → "Project"
4. Click en "Upload" (abajo a la izquierda)
5. Subí el archivo `renovafacil-copies.zip`
6. En "Framework Preset" seleccioná "Vite"
7. Click en "Deploy"

---

## Opción 2: GitHub + Vercel (Más profesional)

### Paso 1: Crear repo en GitHub
1. Andá a https://github.com/new
2. Repository name: `renovafacil-copies`
3. Dejalo en Público
4. NO marques "Add a README"
5. Click "Create repository"

### Paso 2: Subir código
```bash
cd /Users/hipojoachim/Desktop/app

# Configurar git
git config user.name "renovafacilarg-png"
git config user.email "tu-email@gmail.com"

# Inicializar y commitear
git init
git add .
git commit -m "Primera version"

# Conectar con GitHub (reemplazá TU_TOKEN por tu token de GitHub)
git remote add origin https://renovafacilarg-png:TU_TOKEN@github.com/renovafacilarg-png/renovafacil-copies.git
git branch -M main
git push -u origin main
```

### Paso 3: Conectar Vercel
1. Andá a https://vercel.com
2. Login con GitHub
3. Click "Add New Project"
4. Seleccioná el repo `renovafacil-copies`
5. Framework: Vite
6. Deploy

---

## 📋 Checklist para la Editora

Cuando le pases el link a tu editora, decile que:

1. **Entre a la URL** (ej: `https://renovafacil-copies.vercel.app`)
2. **Pegue su API key de Gemini** en el campo correspondiente
3. **Haga clic en "Probar"** para verificar que funcione
4. **Genere los copies** usando el "Generador de Lotes"
5. **Exporte la guía de audio** para vos

---

## 🔑 Cómo obtener API Key de Gemini

1. Andá a https://aistudio.google.com/app/apikey
2. Login con cuenta de Google
3. "Create API Key"
4. Copiar y pegar en la app

---

## ⚠️ Notas importantes

- La app usa la API key de cada usuario (no hay key compartida)
- Los datos se guardan en el navegador de cada uno
- El límite gratuito de Gemini es 20 requests por día
- Con la versión actual (v4.3), 1 lote de 6 videos = 1 request

---

¿Necesitás ayuda con algún paso?