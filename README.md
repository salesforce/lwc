# Raptor Engine

## Getting Start

### Requirements

 * Node 6.x

### Installation

Add this to your bash configuration:

```
export PATH="./node_modules/.bin:$PATH"
```

That will put in your path all the necessary binaries.
Alternatively you can install globally `babel-cli` and `lerna` packages:

```
$ npm install -g babel-cli
$ npm install -g lerna
``` 
With all global binaries available you can either run `npm install` or: 

```
yarn install
``` 


### Setting internal npm

You need to configure npm to point to our [internal npm repo](http://npm.sfdc.es:8081) where you can fetch the package dependencies.
Set it as part of your npm config running:

```
npm config set registry "http://npm.sfdc.es:8080"
```


### Installing raptor

```bash
git clone https://git.soma.salesforce.com/raptor/raptor.git
cd raptor
npm install .
npm start
```

At this point, the app is running in watch mode, and it is accessible via http://localhost:8181/

## TODO

 * 2ways data binding is pending to be discussed.
 * returning null when calling render discussion.
 * [x] implement memoization `m()` in api.
 * implement the tricks to determine when an array or object was passed as attributes down, and do the corresponding getters to detect changes and re-render the component that owns the data structure. (the `watcher`).
 * [x] activate decorators.
 * [x] connect `@attribute` and `@method` decorator with the validation of the attributes in `vm.js`.
 * implement `@required` decorator.
 * template parser.
 * [x] finish an example of ADS, and finish the ADS service.
