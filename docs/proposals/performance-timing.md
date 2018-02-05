# LWC Performance Timing

> TODO: add information about the stage of the proposal.

## Context

**Challenges:**

* For people that doesn't have an extended knowledge of Raptor rendering lifecycle, it can be hard to read and analyse performance profiles
* Browsers like IE11 doesn't offer the capability to view the generated profile as a flamechart. It's requires to put markers in the components code to identify potential performance bottlenecks.
* Measuring programatically where we spend time rendering a component tree, requires to parser to parse chrome logs / timeline to retrieve timing information.

**Goals:**

* Improve performance investigation productivity.
* Fill the gap between the different browsers.
* Allow programatic access to the timing information for automated performance test.

## Existing implementations

### React timing marks

In version `v15.4.0`, React added support for marker on the timeline with the different lifecycle events ([changelog](https://reactjs.org/blog/2016/11/16/react-v15.4.0.html#profiling-components-with-chrome-timeline)). This functionality is disabled by default, can only get turned on in `DEV` mode using the `?react_perf` query string. See example at: https://olz8m97rz5.codesandbox.io/?react_perf

**Observed lifecycle hooks:**
_ rendering phases: `mount`, `constructor`, `update`, `commitChanges`
_ component phases: `componentWillMount`, `componentWillUnmount`, `componentWillReceiveProps`, `shouldComponentUpdate`, `componentWillUpdate`, `componentDidUpdate`, `componentDidMount`, `getChildContext`
**Implementation:** [ReactDebugFiberPerf.js](https://github.com/facebook/react/blob/b77b12311f0c66aad9b50f805c53dcc05d2ea75c/packages/react-reconciler/src/ReactDebugFiberPerf.js)

### React performance tools (deprecated with v16)

Before releasing the timing marks, React offered the capability to introspect performance timing via the `Perf` object. This object is only available in `DEV` mode. The object exposes the following APIs:

* Measurement:

    * `Perf.start()`, `Perf.stop()`: Start and stop the measurement
    * `Perf.getLastMeasurements()`: Get the last measurement object. It's an opaque object that's consumed by analysis methods

* Analysis:
    * `Perf.printInclusive(measurements)`: print component inclusive time and #instances
    * `Perf.printExclusive(measurements)`: print component exclusive time for the different lifecycle hooks
    * `Perf.printWasted(measurements)`: print time waited rendering component that didn't led to any change in the DOM
    * `Perf.printOperations(measurements)`: print time for DOM operations
    * `Perf.printDOM(measurements)`: print generated DOM

You can find more detail in the React documentation: [performance tools](https://reactjs.org/docs/perf.html)

### Vue

After React anouncement, In version `2.2.3`, Vue added support for markers ([config](https://vuejs.org/v2/api/#performance)). This functionality is also disabled by default, and can be turned on using a global config flag `Vue.config.performance = true;` in `DEV` mode. Originally the functionality was enabled by default, it then get disabled because of the performance impact [issue#5174](https://github.com/vuejs/vue/issues/5174). See example at: https://l4xqw3qn5z.codesandbox.io/

**Observed lifecycle hooks:** `init`, `render`, `patch`
**Implementation:** [perf.js](https://github.com/vuejs/vue/blob/master/src/core/util/perf.js)

### Implementation

In both framework, the timing marks is based on [`performance.mark`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark) and [`performance.measure`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure). The following snippet is extracted from Vue implementation:

```js
/** perf.js */
const mark = tag => perf.mark(tag);
const measure = (name, startTag, endTag) => {
    perf.measure(name, startTag, endTag);

    // Avoid performance entry buffer overflow
    perf.clearMarks(startTag);
    perf.clearMarks(endTag);
    perf.clearMeasures(name);
};

/** init.js */
mark('vue-perf-start:init');

// ... Do the init work ...

mark('vue-perf-end:init');
measure('init', 'vue-perf-start:init', 'vue-perf-end:init');
```

The Chrome devetool timeline surface the `performance.measure`s as a flamechart above the javascript callstack. Firefox and Safari doesn't display the performance measures in the timeline. IE11 and Edge shows markers in a waterfall manner in their timeline.

**Consuming programatically markers:**

The `PerformanceObserver` API is used to observe performance events. The `PerformanceObserver` constructor accepts a callback methods invoked when a performance event is recorded. An instance of the `PerformanceObserver` start listening to performance events after calling the `observe` method with a list of [entry type](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry/entryType) to listen. 

Even if this API is not available in IE11, it's possible to create a polyfill specifically for `performance.mark` and `performance.measure`. 

```js
const observer = new PerformanceObserver(list => {
    console.log(list.getEntries())
});

observer.observe({
    entryTypes: ['measure']
});
```

After running some tests, it appears the `PerformanceObserver` doesn't have a maximum buffer size.

**Measuring performance impact:**

Test: https://jsfiddle.net/hd4mzwwo/

Adding performance `marks` and `measures` has a visible impact on performance

=> Chrome

1 0
10 0
100 0.4000000189989805
1000 3.499999991618097
10000 36.20000003138557
100000 352.5000000372529

=> Firefox

1 0.040000000000020464
10 0.19999999999998863
100 0.19999999999998863
1000 1.8199999999999932
10000 16.54000000000002
100000 166.28000000000003

=> Safari

1 0 
10 0 
100 0 
1000 2 
10000 9.999999999999943 
100000 85 

=> IE11

1 0.036655870291014025
10 0.2664881770155887
100 1.3628652574195143
1000 15.220250462230524
10000 145.58098821293836
100000 1454.5833767094466
