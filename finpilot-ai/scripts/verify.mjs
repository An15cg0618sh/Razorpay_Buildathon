#!/usr/bin/env node
/**
 * Foundation checks for FinPilot AI. Runs on plain Node — no dependencies —
 * so it works before `npm install` and in CI.
 *
 *   node scripts/verify.mjs
 *
 * It asserts the things that are easy to break as the app grows: imports that
 * point at nothing, sidebar entries with no route behind them, colour classes
 * that were never defined as theme tokens, and dependency creep.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'src');

const failures = [];
const notes = [];
const fail = (message) => failures.push(message);

/* ---------- helpers ------------------------------------------------------ */

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const files = walk(srcDir);
const read = (file) => readFileSync(file, 'utf8');
const rel = (file) => file.slice(root.length + 1).replace(/\\/g, '/');

/** Every `import ... from '<spec>'` in a file. */
function importsOf(source) {
  const found = [];
  const pattern = /import\s+(?:type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = pattern.exec(source)) !== null) {
    found.push({ clause: match[1], spec: match[2] });
  }
  return found;
}

/** Named bindings in an import clause, ignoring default and namespace forms. */
function namedBindings(clause) {
  const braces = clause.match(/\{([\s\S]*)\}/);
  if (!braces) return [];
  return braces[1]
    .split(',')
    .map((part) => part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim())
    .filter(Boolean);
}

/** Top-level exported names, good enough for a foundation check. */
function exportsOf(source) {
  const names = new Set();
  const declaration =
    /export\s+(?:declare\s+)?(?:async\s+)?(?:function|const|let|var|class|interface|type|enum)\s+([A-Za-z0-9_$]+)/g;
  let match;
  while ((match = declaration.exec(source)) !== null) names.add(match[1]);

  const listed = /export\s*\{([^}]*)\}/g;
  while ((match = listed.exec(source)) !== null) {
    for (const part of match[1].split(',')) {
      const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop();
      if (name) names.add(name.trim());
    }
  }
  if (/export\s+default/.test(source)) names.add('default');
  return names;
}

function resolveLocal(fromFile, spec) {
  const base = resolve(dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, 'index.ts'),
    join(base, 'index.tsx'),
  ];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

/* ---------- 1. required folders ------------------------------------------ */

const requiredDirs = [
  'components',
  'pages',
  'layouts',
  'services',
  'hooks',
  'types',
  'data',
  'utils',
];
for (const dir of requiredDirs) {
  if (!existsSync(join(srcDir, dir))) fail(`src/${dir}/ is missing`);
}

/* ---------- 2. local imports resolve, and named exports exist ------------ */

let checkedImports = 0;
for (const file of files) {
  const source = read(file);
  for (const { clause, spec } of importsOf(source)) {
    if (!spec.startsWith('.')) continue;
    checkedImports += 1;

    const target = resolveLocal(file, spec);
    if (!target) {
      fail(`${rel(file)} imports '${spec}', which does not resolve to a file`);
      continue;
    }

    const available = exportsOf(read(target));
    for (const name of namedBindings(clause)) {
      if (!available.has(name)) {
        fail(`${rel(file)} imports { ${name} } from '${spec}', but ${rel(target)} does not export it`);
      }
    }
  }
}

/* ---------- 3. sidebar entries and routes agree -------------------------- */

const navSource = read(join(srcDir, 'data', 'navigation.ts'));
const appSource = read(join(srcDir, 'App.tsx'));

const navPaths = [...navSource.matchAll(/to:\s*'([^']+)'/g)].map((match) => match[1]);
const routePaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);

if (navPaths.length === 0) fail('No nav destinations found in src/data/navigation.ts');

for (const path of navPaths) {
  if (!routePaths.includes(path)) fail(`Sidebar links to ${path} but App.tsx has no route for it`);
}
for (const path of routePaths) {
  if (path === '*' || path === '/login') continue;
  if (!navPaths.includes(path)) {
    notes.push(`Route ${path} is not reachable from the sidebar`);
  }
}
if (!routePaths.includes('*')) fail('App.tsx has no catch-all route for unknown addresses');
if (!routePaths.includes('/login')) fail('App.tsx has no /login route');
if (!/<Navigate\s+to="\/dashboard"/.test(appSource)) {
  fail('App.tsx does not redirect the index route to /dashboard');
}

/* ---------- 3b. each address resolves to a real page component ----------- */

// Walking the route table the way the router would: an exact path wins, and
// anything unmatched falls to the catch-all. This catches a path typo or an
// element pointing at a component that no longer exists, without a browser.
const routeTable = [...appSource.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<([A-Za-z0-9_]+)/g)].map(
  (match) => ({ path: match[1], component: match[2] }),
);
const pageComponents = new Set(
  readdirSync(join(srcDir, 'pages'))
    .filter((name) => name.endsWith('.tsx'))
    .map((name) => name.replace(/\.tsx$/, '')),
);

function resolveRoute(pathname) {
  const exact = routeTable.find((route) => route.path === pathname);
  if (exact) return exact.component;
  const catchAll = routeTable.find((route) => route.path === '*');
  return catchAll ? catchAll.component : undefined;
}

for (const path of [...navPaths, '/login']) {
  const component = resolveRoute(path);
  if (component === undefined) {
    fail(`${path} resolves to nothing`);
  } else if (!pageComponents.has(component)) {
    fail(`${path} resolves to <${component} />, but src/pages/${component}.tsx does not exist`);
  } else if (component === 'NotFound') {
    fail(`${path} falls through to the catch-all instead of its own page`);
  }
}
if (resolveRoute('/no-such-page') !== 'NotFound') {
  fail('An unknown address does not land on the NotFound page');
}

/* ---------- 4. every page has a route ----------------------------------- */

const pageFiles = readdirSync(join(srcDir, 'pages')).filter((name) => name.endsWith('.tsx'));
for (const page of pageFiles) {
  const component = page.replace(/\.tsx$/, '');
  if (!new RegExp(`\\b${component}\\b`).test(appSource)) {
    fail(`src/pages/${page} is never referenced by App.tsx`);
  }
}

/* ---------- 5. custom colour classes are defined tokens ------------------ */

const css = read(join(srcDir, 'index.css'));
const definedTokens = new Set(
  [...css.matchAll(/--color-([a-z0-9-]+)\s*:/g)].map((match) => match[1]),
);

// Root words of this project's palette. Any class built on one of these must
// name a token that actually exists.
const paletteRoots = [
  'canvas',
  'panel',
  'subtle',
  'line',
  'navy',
  'steel',
  'mist',
  'primary',
  'positive',
  'warning',
  'critical',
];
const utilityPrefixes = 'bg|text|border|fill|stroke|ring|outline|divide|from|via|to|placeholder';
const classPattern = new RegExp(
  `(?:${utilityPrefixes})-(${paletteRoots.join('|')})((?:-[a-z0-9]+)*)(?![a-z0-9])`,
  'g',
);

for (const file of files) {
  for (const match of read(file).matchAll(classPattern)) {
    const token = `${match[1]}${match[2] ?? ''}`;
    if (!definedTokens.has(token)) {
      fail(`${rel(file)} uses colour "${token}", which is not a --color-* token in src/index.css`);
    }
  }
}

// The dark palette this build replaced. These roots no longer exist as tokens,
// so a leftover class would silently render as no colour at all.
const retiredRoots = ['ink', 'surface', 'raised', 'rule', 'porcelain', 'brass', 'jade', 'clay'];
const retiredPattern = new RegExp(
  `(?:${utilityPrefixes})-(${retiredRoots.join('|')})(?:-[a-z0-9]+)*(?![a-z0-9])`,
  'g',
);
for (const file of [...files, join(root, 'index.html')]) {
  for (const match of read(file).matchAll(retiredPattern)) {
    fail(`${rel(file)} still uses retired dark-theme class "${match[0]}"`);
  }
}

/* ---------- 6. the shell shows the identity the brief specifies ---------- */

// These strings are what the user sees in the sidebar and header. Keeping them
// in the verifier means a refactor cannot quietly drop them.
const requiredNav = {
  Overview: ['Dashboard'],
  Finance: ['Transactions', 'Invoices', 'Expenses', 'Reconciliation'],
  Intelligence: ['Risk Center', 'Cash Flow', 'AI Controller'],
  Management: ['Vendors'],
  System: ['Settings'],
};

// Groups and items both use `label:`, so position in the file is what
// distinguishes them: a group label is followed by its own items.
const labelAt = (name) => navSource.indexOf(`label: '${name}'`);
let previousGroupAt = -1;

for (const [group, items] of Object.entries(requiredNav)) {
  const groupAt = labelAt(group);
  if (groupAt === -1) {
    fail(`Sidebar is missing the "${group}" group`);
    continue;
  }
  if (groupAt < previousGroupAt) {
    fail(`Sidebar group "${group}" is out of order: expected ${Object.keys(requiredNav).join(' → ')}`);
  }
  previousGroupAt = groupAt;

  for (const item of items) {
    const itemAt = labelAt(item);
    if (itemAt === -1) fail(`Sidebar is missing the "${item}" entry`);
    else if (itemAt < groupAt) fail(`Sidebar entry "${item}" sits outside the "${group}" group`);
  }
}

const orgSource = read(join(srcDir, 'data', 'mockData.ts'));
for (const value of ['Apex Technologies Pvt Ltd', 'John Smith', 'CFO']) {
  if (!orgSource.includes(value)) fail(`src/data/organisation.ts no longer contains "${value}"`);
}

const sidebarSource = read(join(srcDir, 'components', 'Sidebar.tsx'));
if (!/onToggleCollapse/.test(sidebarSource)) fail('Sidebar lost its desktop collapse control');
if (!/animate-drawer-in/.test(sidebarSource)) fail('Sidebar lost its mobile drawer');

const headerSource = read(join(srcDir, 'components', 'Header.tsx'));
for (const [what, pattern] of [
  ['a page title', /findNavItem/],
  ['a search control', /Search/],
  ['a notification control', /Bell/],
  ['the company name', /getCompany/],
  ['the user avatar', /getCurrentUser/],
]) {
  if (!pattern.test(headerSource)) fail(`Header no longer has ${what}`);
}

const logoSource = read(join(srcDir, 'components', 'Logo.tsx'));
for (const value of ['FinPilot AI', 'AI Finance Controller']) {
  if (!logoSource.includes(value)) fail(`src/components/Logo.tsx no longer renders "${value}"`);
}

/* ---------- 7. dependency discipline ------------------------------------ */

const pkg = JSON.parse(read(join(root, 'package.json')));
const allowedRuntime = ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'recharts'];
for (const name of Object.keys(pkg.dependencies ?? {})) {
  if (!allowedRuntime.includes(name)) {
    fail(`Unexpected runtime dependency "${name}". This step is meant to stay minimal.`);
  }
}

// The brief defers these deliberately; flag them if they sneak in early.
const deferred = /^(openai|@anthropic-ai\/|@ai-sdk\/|ai$|langchain|pg$|postgres|prisma|@prisma\/|drizzle-orm|passport|next-auth|@auth\/|firebase|bcrypt)/;
for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
  if (deferred.test(name)) {
    fail(`"${name}" belongs to a later step (AI, database or auth are out of scope here)`);
  }
}

/* ---------- report ------------------------------------------------------ */

console.log(`Checked ${files.length} source files and ${checkedImports} local imports.`);
console.log(`Sidebar destinations: ${navPaths.length}. Routes declared: ${routePaths.length}.`);
console.log(`Addresses resolved to a page component: ${navPaths.length + 2} (including /login and an unknown path).`);
console.log(`Theme colour tokens: ${definedTokens.size}.`);

for (const note of notes) console.log(`note: ${note}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):`);
  for (const problem of failures) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log('\nAll foundation checks passed.');
