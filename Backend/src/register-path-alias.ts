// tslint:disable
import * as moduleAlias from 'module-alias';

moduleAlias.addAliases({
    '@apis': __dirname + '/apis',
    '@middlewares': __dirname + '/middlewares',
    '@models': __dirname + '/models',
    '@root': __dirname,
    '@utils': __dirname + '/utils',
});
