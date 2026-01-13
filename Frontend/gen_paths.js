const fs = require('fs');

try {
    const content = fs.readFileSync('vite.config.ts', 'utf8');
    const aliasMatch = content.match(/alias:\s*{([^}]+)}/s);

    const paths = {
        "@/*": ["./src/*"]
    };

    if (aliasMatch) {
        const block = aliasMatch[1];
        const lines = block.split('\n');

        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('//')) return;

            // Simple package alias: 'pkg@ver': 'pkg'
            const simpleMatch = line.match(/'([^']+)'\s*:\s*'([^']+)'/);
            if (simpleMatch) {
                const key = simpleMatch[1];
                const val = simpleMatch[2];
                // Map to node_modules
                paths[key] = [`./node_modules/${val}`];
                return;
            }

            // Asset alias: 'figma:...': path.resolve(...)
            // 'figma:asset/...' : path.resolve(__dirname, './src/assets/img.png')
            const assetMatch = line.match(/'([^']+)'\s*:\s*path\.resolve\(__dirname,\s*'([^']+)'\)/);
            if (assetMatch) {
                const key = assetMatch[1];
                const val = assetMatch[2]; // ./src/assets/...
                paths[key] = [val];
            }
        });
    }

    console.log(JSON.stringify(paths, null, 4));
} catch (e) {
    console.error(e);
}
