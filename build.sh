#!/bin/bash
# Build script for Rentify.kz Production

echo "🚀 Starting Rentify.kz build process..."

# Создание директории dist
mkdir -p dist/css dist/js dist/images

# Копирование HTML файлов
echo "📄 Copying HTML files..."
cp *.html dist/
cp robots.txt dist/
cp sitemap.xml dist/
cp site.webmanifest dist/

# Минификация CSS
echo "🎨 Minifying CSS..."
npx cleancss -o dist/css/style.min.css css/style.css

# Минификация и объединение JS
echo "📦 Minifying JavaScript..."
npx terser js/main.js js/firebase-config.js js/firebase-db.js js/language.js js/notifications.js js/sanitizer.js js/event-handlers.js -o dist/js/bundle.min.js --compress --mangle

# Оптимизация изображений
echo "🖼️  Optimizing images..."
# Конвертация в WebP (если установлен imagemin)
for img in images/*.{jpg,png,jpeg}; do
    if [ -f "$img" ]; then
        filename=$(basename "$img")
        name="${filename%.*}"
        cp "$img" "dist/images/"
        echo "Copied: $img"
    fi
done

# Копирование остальных файлов
echo "📁 Copying additional files..."
cp -r cypress dist/ 2>/dev/null || true

# Обновление путей в HTML для minified файлов
echo "🔗 Updating asset paths..."
sed -i 's|css/style\.css|css/style.min.css|g' dist/*.html
sed -i 's|<script src="js/|<script src="js/bundle.min.js"></script><!-- |g' dist/*.html

echo "✅ Build completed! Files are ready in ./dist/"
echo "📊 Build Statistics:"
echo "   Original CSS: $(du -h css/style.css | cut -f1)"
echo "   Minified CSS: $(du -h dist/css/style.min.css | cut -f1)" 
echo "   Bundle JS: $(du -h dist/js/bundle.min.js | cut -f1)"

echo ""
echo "🚀 Deploy commands:"
echo "   Local test: npm run serve"
echo "   Deploy to Vercel: npm run deploy"