const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/exams/writing/page.tsx',
  'src/app/dashboard/exams/speaking/page.tsx',
  'src/app/dashboard/exams/reading/page.tsx'
];

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  let content = fs.readFileSync(fullPath, 'utf8');

  // We want to remove `if (!mounted) return null;` ONLY if it comes right before `return (` in the Timer component.
  // Actually, let's just search for the exact string of the Timer component.
  
  // reading/page.tsx and writing/page.tsx
  let oldStr1 = `  const isLow = seconds < 300;\r\n\r\n  if (!mounted) return null;\r\n\r\n  return (`;
  let newStr1 = `  const isLow = seconds < 300;\r\n\r\n  return (`;
  
  let oldStr1_unix = `  const isLow = seconds < 300;\n\n  if (!mounted) return null;\n\n  return (`;
  let newStr1_unix = `  const isLow = seconds < 300;\n\n  return (`;

  // speaking/page.tsx
  let oldStr2 = `  const secs = (seconds % 60).toString().padStart(2, "0");\r\n\r\n  if (!mounted) return null;\r\n\r\n  return (`;
  let newStr2 = `  const secs = (seconds % 60).toString().padStart(2, "0");\r\n\r\n  return (`;
  
  let oldStr2_unix = `  const secs = (seconds % 60).toString().padStart(2, "0");\n\n  if (!mounted) return null;\n\n  return (`;
  let newStr2_unix = `  const secs = (seconds % 60).toString().padStart(2, "0");\n\n  return (`;

  content = content.replace(oldStr1, newStr1);
  content = content.replace(oldStr1_unix, newStr1_unix);
  content = content.replace(oldStr2, newStr2);
  content = content.replace(oldStr2_unix, newStr2_unix);

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Fixed', file);
}
