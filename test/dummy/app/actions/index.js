import ApplicationAction from './application';

export default class IndexAction extends ApplicationAction {

  respond() {
    // console.log('this should error eslint');
    return { message: 'Welcome to Denali!' };
  }

}
