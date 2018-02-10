import * as path from 'path';
import * as fs from 'fs';
import test from 'ava';
import { CommandAcceptanceTest } from 'denali-cli';

test('prints eslint errors', async (t) => {
  let server = new CommandAcceptanceTest('build');

  // Insert eslint violation - we can't bake this into the actual dummy app
  // source, because the dummy app is automatically compiled when running tests,
  // and it would fail the linting test
  let actionPath = path.join(server.dir, 'app', 'actions', 'index.js');
  let actionContents = fs.readFileSync(actionPath, 'utf8');
  actionContents = actionContents.replace('// console.log', 'console.log');
  fs.writeFileSync(actionPath, actionContents);

  let { output } = await server.run({});
  t.true(output.includes('Unexpected console statement. (no-console) at line 6:5'));
});

test('fails tests when eslint errors', async (t) => {
  let server = new CommandAcceptanceTest('test', { environment: 'test' });

  // Insert eslint violation - we can't bake this into the actual dummy app
  // source, because the dummy app is automatically compiled when running tests,
  // and it would fail the linting test
  let actionPath = path.join(server.dir, 'app', 'actions', 'index.js');
  let actionContents = fs.readFileSync(actionPath, 'utf8');
  actionContents = actionContents.replace('// console.log', 'console.log');
  fs.writeFileSync(actionPath, actionContents);

  let { output } = await server.run({});
  t.true(output.includes('app/actions/index.js should pass ESLint'));
  t.true(output.includes('6:5 - Unexpected console statement. (no-console)'));
});