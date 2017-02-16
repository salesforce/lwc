/* @flow */
/* eslint-disable */

declare module "rollup" {
  declare module.exports: {
    rollup<T>(any): Promise<any> | any;
  };
}
