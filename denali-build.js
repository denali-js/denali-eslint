import { Builder } from 'denali';
import Funnel from 'broccoli-funnel';
import MergeTree from 'broccoli-merge-trees';
import LintTree from './lib/lint-tree';

export default class DenaliEslintBuilder extends Builder {

  processParent(tree, dir) {
    if (this.project.lint) {
      // If it's in test environment, generate test modules for each linted file
      if (this.project.environment === 'test') {
        let lintTestTree = new LintTree(tree, { generateTests: true, rootDir: this.dir });
        lintTestTree = new Funnel(lintTestTree, { destDir: 'test/lint' });
        return new MergeTree([ lintTestTree, tree ]);
      }
      // Otherwise, just lint and move on
      console.log(dir);
      return new LintTree(tree, { rootDir: dir });
    }
    return tree;
  }

}
