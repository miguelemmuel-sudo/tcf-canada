const fs = require('fs');
const dir = 'c:/Users/HP/Desktop/tati.html/monprojet1/projet/tcf-canada-pro/src/app/dashboard';
const { execSync } = require('child_process');

// Find all tsx files in the dashboard directory
const files = execSync(`dir /s /b ${dir.replace(/\//g, '\\')} | findstr /e ".tsx"`).toString().split('\r\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('useState(getCurrentUserPack())')) {
    
    // Replace the import
    if (!content.includes('useUserPack')) {
      content = content.replace(
        /import \{.*?getCurrentUserPack.*\} from "@\/utils\/subscriptionEngine";/,
        (match) => {
          return match + '\nimport { useUserPack } from "@/hooks/useUserPack";';
        }
      );
    }
    
    // Replace the declaration
    // From: const [pack, setPack] = useState(getCurrentUserPack());
    // And remove useEffect related to pack updates if any
    content = content.replace(
      /const \[pack, setPack\] = useState\(getCurrentUserPack\(\)\);/,
      'const { pack, mounted } = useUserPack();'
    );
    
    // Replace time initialization if present
    content = content.replace(
      /const \[timeLeft, setTimeLeft\] = useState\(\(\) => getExamDurationSecondsForPack\(getCurrentUserPack\(\), TOTAL_TIME\)\);/,
      'const [timeLeft, setTimeLeft] = useState(() => getExamDurationSecondsForPack("griffon", TOTAL_TIME));'
    );
    
    // Add early return if not mounted
    // We need to inject `if (!mounted) return null;` at the beginning of the component, just after hooks
    // For simplicity, we can just replace `useEffect(() => { const p = getCurrentUserPack();...` entirely because we don't need it.
    content = content.replace(
      /useEffect\(\(\) => \{\s*const p = getCurrentUserPack\(\);\s*setPack\(p\);\s*(?:setTimeLeft\(.*?\);\s*)?\}, \[\]\);/g,
      'useEffect(() => {\n    setTimeLeft(getExamDurationSecondsForPack(pack, TOTAL_TIME));\n  }, [pack]);'
    );

    // If it didn't have the useEffect for time, just remove the setPack(p) part
    content = content.replace(
      /useEffect\(\(\) => \{\s*const p = getCurrentUserPack\(\);\s*setPack\(p\);\s*\}, \[\]\);/g,
      ''
    );
    
    // Let's add `if (!mounted) return null;` before the first return
    // Since return might be complex, we just replace the first `return (` or `return <` or `return ` with `if (!mounted) return null;\n  return `
    content = content.replace(
      /\n\s*return \(/,
      '\n\n  if (!mounted) return null;\n\n  return ('
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
