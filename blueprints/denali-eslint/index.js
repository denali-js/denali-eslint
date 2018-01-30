import { Blueprint } from 'denali-cli';

const packages = [
  'babel-eslint'
];

export default class DenaliEslintBlueprint extends Blueprint {

  static blueprintName = 'denali-eslint';
  static description = 'Generate the default .eslintrc and installs the babel-eslint parser';

  postInstall() {
    this.installPackages(packages, true);
  }

  postUninstall() {
    this.uninstallPackages(packages);
  }

}
