/* @flow */
/* eslint-disable */

declare module "rollup" {
  declare module.exports: {
    rollup<T>(any): Promise<any> | any;
  };
}

declare module "babel-core" {
  declare module.exports: {
    transform(string, any): any;
    types: any;
    template (string, any): ((Object) => BabelNode);
  };
}

declare module "babel-plugin-syntax-jsx" {
  declare module.exports: {};
}

declare module "babel-plugin-transform-raptor-class" {
  declare module.exports: {};
}

declare module "babel-plugin-transform-raptor-template" {
  declare module.exports: {};
}

declare module "raptor-html-cleanup-transform" {
  declare module.exports: {};
}

declare module "to-camel-case" {
  declare module.exports: {
      toCamelCase(string): string;
  };
}

type MetaConfig = {

};
