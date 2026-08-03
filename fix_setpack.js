const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/courses/speaking/page.tsx',
  'src/app/dashboard/exams/speaking/page.tsx'
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  if (file.includes('courses/speaking')) {
    content = content.replace(
      /  useEffect\(\(\) => \{\s+setPack\(getCurrentUserPack\(\)\);\s+\}, \[\]\);/g,
      ''
    );
  } else if (file.includes('exams/speaking')) {
    content = content.replace(
      /  useEffect\(\(\) => \{\s+const p = getCurrentUserPack\(\);\s+setPack\(p\);\s+setGlobalTimeLeft\(getExamDurationSecondsForPack\(p, 40 \* 60\)\);\s+\}, \[\]\);/g,
      `  useEffect(() => {
    const p = getCurrentUserPack();
    setGlobalTimeLeft(getExamDurationSecondsForPack(p, 40 * 60));
  }, []);`
    );
  }

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed', file);
}
