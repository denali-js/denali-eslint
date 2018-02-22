import { Blueprint } from '@denali-js/cli';

const packages = [
  'babel-eslint'
];

export default class DenaliEslintBlueprint extends Blueprint {

  static blueprintName = 'default';
  static description = 'Generate the default .eslintrc and installs the babel-eslint parser';

  postInstall() {
    this.installPackages(packages, true);
  }

  postUninstall() {
    this.uninstallPackages(packages);
  }

}
