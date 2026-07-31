const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('const { pack, mounted } = useUserPack();') && !content.includes('if (!mounted) return null;')) {
    content = content.replace(
      /const \{\s*pack,\s*mounted\s*\}\s*=\s*useUserPack\(\);/g,
      'const { pack, mounted } = useUserPack();\n  if (!mounted) return null;'
    );
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
