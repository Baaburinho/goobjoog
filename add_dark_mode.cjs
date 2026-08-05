const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components')
];

// Regex Replacements mapping light mode classes to their dark mode equivalents.
// The negative lookahead (?!\s*dark:) ensures we don't append if a dark class is already there.
// Note: \b ensures we match exact class names (e.g. bg-white and not bg-white-500 if that existed)
const replacements = [
  { regex: /\bbg-white(?!\s*dark:bg-)/g, replacement: 'bg-white dark:bg-slate-900' },
  { regex: /\bbg-slate-50(?!\s*dark:bg-)/g, replacement: 'bg-slate-50 dark:bg-slate-950/50' },
  { regex: /\bbg-slate-100(?!\s*dark:bg-)/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /\bborder-slate-100(?!\s*dark:border-)/g, replacement: 'border-slate-100 dark:border-slate-800/50' },
  { regex: /\bborder-slate-200(?!\s*dark:border-)/g, replacement: 'border-slate-200 dark:border-slate-800' },
  { regex: /\btext-slate-900(?!\s*dark:text-)/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /\btext-slate-800(?!\s*dark:text-)/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { regex: /\btext-slate-700(?!\s*dark:text-)/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /\btext-slate-600(?!\s*dark:text-)/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /\btext-slate-500(?!\s*dark:text-)/g, replacement: 'text-slate-500 dark:text-slate-500' }
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

targetDirs.forEach(dir => {
  console.log(`Scanning ${dir}...`);
  walkDir(dir);
});

console.log('Done!');
