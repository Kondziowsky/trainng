/**
 * Build-time guard for the two public Supabase values.
 *
 * `EXPO_PUBLIC_*` vars are inlined into the bundle when it is built, so a host
 * with them unset produces a bundle that throws on first import and renders a
 * blank page — a failure that is invisible in the deploy log. Failing the build
 * here turns that into an error you actually see.
 *
 * Locally the values come from `.env`; on a host they come from its build
 * environment. Either way they must be present before `expo export` runs.
 */
import { existsSync, readFileSync } from 'node:fs';

const REQUIRED = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];
const PLACEHOLDERS = ['your-project-ref', 'your-anon-public-key'];

// Expo loads .env itself, but that happens after this script runs, so read it here.
function fromDotEnv() {
  if (!existsSync('.env')) return {};
  return Object.fromEntries(
    readFileSync('.env', 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        return separator === -1
          ? null
          : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
      .filter((entry) => entry !== null),
  );
}

const dotEnv = fromDotEnv();
const resolve = (name) => process.env[name] ?? dotEnv[name];

const problems = [];

for (const name of REQUIRED) {
  const value = resolve(name);
  if (!value) {
    problems.push(`${name} is not set.`);
  } else if (PLACEHOLDERS.some((placeholder) => value.includes(placeholder))) {
    problems.push(`${name} still holds the .env.example placeholder.`);
  }
}

const url = resolve('EXPO_PUBLIC_SUPABASE_URL');
if (url && !/^https?:\/\//.test(url)) {
  problems.push(`EXPO_PUBLIC_SUPABASE_URL must start with http:// or https:// (got "${url}").`);
}

// The service_role key bypasses RLS. Anything EXPO_PUBLIC_ is readable by every
// user who downloads the bundle, so it must never be the one supplied here.
const key = resolve('EXPO_PUBLIC_SUPABASE_ANON_KEY');
if (key?.includes('service_role')) {
  problems.push(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY looks like a service_role key. That key bypasses ' +
      'Row Level Security and must never ship in a client bundle. Use the anon key.',
  );
}

if (problems.length > 0) {
  console.error('\nCannot build: Supabase configuration is incomplete.\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    '\nLocally: copy .env.example to .env and fill both values.' +
      '\nOn a host: set them in the project\'s build environment, then redeploy.' +
      '\n(They are read at build time, so changing them requires a rebuild.)\n',
  );
  process.exit(1);
}

console.log('Supabase configuration present.');
