// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportSetDevCORS from '../../../app/middleware/setDevCORS';

declare module 'egg' {
  interface IMiddleware {
    setDevCORS: typeof ExportSetDevCORS;
  }
}
