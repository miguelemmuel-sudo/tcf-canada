const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/reservations/page.tsx',
  'src/app/dashboard/messages/page.tsx'
];

const target = `  useEffect(() => {
    setPack(getCurrentUserPack());
  }, []);`;

const target_unix = `  useEffect(() => {\n    setPack(getCurrentUserPack());\n  }, []);`;
const target_win = `  useEffect(() => {\r\n    setPack(getCurrentUserPack());\r\n  }, []);`;

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  content = content.replace(target, '');
  content = content.replace(target_unix, '');
  content = content.replace(target_win, '');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed', file);
}
