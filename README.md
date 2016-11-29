# Raptor compiler

## Installation

Add this to your bash configuration:

```
export PATH="./node_modules/.bin:$PATH"
```

Or alternatively you can install globally `babel-cli` and `lerna` packages:

```
$ npm install -g babel-cli
$ npm install -g lerna
``` 
With all global binaries available you can either run `npm install` or: 

```
yarn install
``` 

Note that this repo contains several sub-packages and we use `lerna` to build them all `npm install` will them all.

## Test the compiler:

To run the compiler with an example:
```
cd packages/raptor-compiler-core
./bin/cli.js
```

## Test the packages

We have an [internal npm repo](http://npm.sfdc.es:8081) where you can fetch the packages.
If you want to use it, set is as part of your npm config:

```
npm config set registry "http://npm.sfdc.es:8080"
```