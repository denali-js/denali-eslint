const { AddonBuilder } = require('denali-cli');
const Funnel = require('broccoli-funnel');
const Concat = require('broccoli-concat');
const MergeTree = require('broccoli-merge-trees');

module.exports = class DenaliEslintBuilder extends AddonBuilder {

  processParent(tree, dir) {
    return this.lint(tree);
  }

  lint(tree) {
    // Require here to avoid loading when we build this addon itself
    const LintTree = require('./lib/lint-tree').default;
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
