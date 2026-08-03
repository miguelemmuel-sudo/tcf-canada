const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/courses/reading/page.tsx',
  'src/app/dashboard/courses/writing/page.tsx',
  'src/app/dashboard/courses/speaking/page.tsx'
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  const oldBlock = `  if (!mounted) return null;

  return () => clearInterval(timer);
  }, []);`;

  const newBlock = `  return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;`;

  content = content.replace(oldBlock, newBlock);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed', file);
}
