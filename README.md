# Raptor Engine

## Getting Start

### Requirements

 * Node 6.x

### Installation

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
