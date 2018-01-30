const path = require('path');
const { AddonBuilder } = require('denali-cli');
const Funnel = require('broccoli-funnel');
const Concat = require('broccoli-concat');
const MergeTree = require('broccoli-merge-trees');
const escape = require('js-string-escape');
const Filter = require('broccoli-filter');
const chalk = require('chalk');
const dedent = require('dedent-js');


module.exports = class DenaliEslintBuilder extends AddonBuilder {

  processParent(tree, dir) {
    return this.lint(tree, dir);
  }

  lint(tree, dir) {
    // If it's in test environment, generate test modules for each linted file
    if (this.environment === 'test') {
      let lintTestTree = new LintTree(tree, { generateTests: true, rootDir: dir });
      lintTestTree = new Funnel(lintTestTree, { destDir: 'test/lint' });
      lintTestTree = new Concat(lintTestTree, {
        outputFile: 'test/linting.js',
        header: `import test from 'ava';`,
        inputFiles: [ '**/*.lint-test.js' ],
        sourceMapConfig: { enabled: true },
        allowNone: true
      });
      return new MergeTree([ lintTestTree, tree ]);
    }
    // Otherwise, just lint and move on
    return new LintTree(tree, { rootDir: dir });
  }

}

const IGNORED_FILE_MESSAGE_REGEXP = /(?:File ignored by default\.)|(?:File ignored because of a matching ignore pattern\.)/;

class LintTree extends Filter {

  constructor(inputNode, options = {}) {
    super(inputNode, options);

    this.extensions = [ 'js' ];
    this.targetExtension = 'js';

    this.rootDir = options.rootDir;
    this.generateTests = options.generateTests;
    if (this.generateTests) {
      this.targetExtension = 'lint-test.js';
    }

    const { CLIEngine } = require('eslint');
    this.cli = new CLIEngine({ cwd: this.rootDir });
  }

  processString(content, relativePath) {
    let report = this.cli.executeOnText(content, path.join(this.rootDir, relativePath));
    let result = report.results[0] || {};
    let messages = result.messages || [];

    messages = messages.filter((msg) => !IGNORED_FILE_MESSAGE_REGEXP.test(msg.message));

    if (this.generateTests) {
      return this.testGenerator(relativePath, messages);
    }

    if (messages.length > 0) {
      // eslint-disable-next-line no-console
      console.log(chalk.yellow(`\n${ path.join(this.rootDir, relativePath) } has ${ result.errorCount } errors and ${ result.warningCount } warnings.`));

      messages.forEach((error, index) => {
        // eslint-disable-next-line no-console
        console.log(chalk.yellow(dedent`
            ${ index + 1 }: ${ error.message } (${ error.ruleId }) at line ${ error.line }:${ error.column }
          ${ error.source }
        `));
      });
    }

    return content;
  }

  testGenerator(relativePath, errors) {
    let passed = errors.length === 0;
    let messages = `${ relativePath } should pass ESLint`;
    if (!passed) {
      messages += '\n\n';
      messages += errors.map((error) => {
        return `${ error.line }:${ error.column } - ${ error.message } (${ error.ruleId })`;
      }).join('\n');
    }
    let output = `test('${ relativePath } passes ESLint', (t) => {`;
    if (passed) {
      output += "  t.pass('Linting passed.')\n";
    } else {
      output += `  t.fail('${ escape(messages) }');\n`;
    }
    output += '});\n';
    return output;
  }

}
