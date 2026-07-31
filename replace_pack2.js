const fs = require('fs');
const dir = 'c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard';
const { execSync } = require('child_process');

const files = execSync(`dir /s /b ${dir.replace(/\//g, '\\')} | findstr /e ".tsx"`).toString().split('\r\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('const { pack, mounted } = useUserPack();') && !content.includes('if (!mounted) return null;')) {
    content = content.replace(
      /const \{ pack, mounted \} = useUserPack\(\);/g,
      'const { pack, mounted } = useUserPack();\n  if (!mounted) return null;'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
