// tslint:disable-next-line: no-import-side-effect
import './register-path-alias';

import { registerMetricsApis } from '@apis/index';
import { registerInitialMiddlewares, registerTrailerMiddlewares } from '@middlewares/index';
import express from 'express';
import serverlessHttp from 'serverless-http';

const application: express.Application = express();
registerInitialMiddlewares(application);
registerMetricsApis(application);
registerTrailerMiddlewares(application);

export = { handler: serverlessHttp(application) };
