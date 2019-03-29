// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportIndex from '../../../app/model/index';

declare module 'egg' {
  interface IModel {
    Index: ReturnType<typeof ExportIndex>;
  }
}
