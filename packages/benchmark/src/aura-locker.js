/**
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Bundle from LockerService-Core
 * Generated: 2018-05-10
 * Version: 0.4.10
 */

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Declare shorthand functions. Sharing these declarations accross modules
// improves both consitency and minification. Unused declarations are dropped
// by the tree shaking process.

const { isArray } = Array;

const {
  assign,
  create: create$1,
  defineProperties,
  freeze,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  isFrozen,
  seal
} = Object;

const {
  defineProperty,
  deleteProperty,
  getPrototypeOf,
  has,
  ownKeys,
  setPrototypeOf
} = Reflect;


const objectToString = Object.prototype.toString;
const objectHasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Converts ArrayBuffer to UTF-8 String
 * @param {ArrayBuffer} buf
 */
function ab2str(buf) {
  if (typeof TextDecoder !== 'undefined') {
    const dec = new TextDecoder('utf-8');
    return dec.decode(buf);
  }

  let str = '';
  const abLen = buf.byteLength;
  let offset = 0;
  const CHUNK_SIZE = 2 ** 16;

  do {
    const len = Math.min(CHUNK_SIZE, abLen - offset);
    const part = new Uint8Array(buf.slice(offset, offset + len));
    str += String.fromCharCode.apply(null, part);
    offset += len;
  } while (offset < abLen);
  return str;
}

/**
 * Converts String to ArrayBuffer
 * https://github.com/dfcreative/string-to-arraybuffer/blob/master/index.js
 * @param {String} str
 */

const DEFAULT = {};
const FUNCTION = { type: 'function' };
const FUNCTION_TRUST_RETURN_VALUE = { type: 'function', trustReturnValue: true };
const EVENT = { type: '@event' };
const SKIP_OPAQUE = { skipOpaque: true };
const SKIP_OPAQUE_ASCENDING = { skipOpaque: true, propertyName: 'parentNode' };
const FUNCTION_RAW_ARGS = { type: 'function', rawArguments: true };

const CTOR = { type: '@ctor' };
const RAW = { type: '@raw' };
const READ_ONLY_PROPERTY = { writable: false };

const domPurifyConfig = {
  // Allow SVG <use> element
  ADD_TAGS: ['use'],
  ADD_ATTR: [
    'aria-activedescendant',
    'aria-atomic',
    'aria-autocomplete',
    'aria-busy',
    'aria-checked',
    'aria-controls',
    'aria-describedby',
    'aria-disabled',
    'aria-readonly',
    'aria-dropeffect',
    'aria-expanded',
    'aria-flowto',
    'aria-grabbed',
    'aria-haspopup',
    'aria-hidden',
    'aria-disabled',
    'aria-invalid',
    'aria-label',
    'aria-labelledby',
    'aria-level',
    'aria-live',
    'aria-multiline',
    'aria-multiselectable',
    'aria-orientation',
    'aria-owns',
    'aria-posinset',
    'aria-pressed',
    'aria-readonly',
    'aria-relevant',
    'aria-required',
    'aria-selected',
    'aria-setsize',
    'aria-sort',
    'aria-valuemax',
    'aria-valuemin',
    'aria-valuenow',
    'aria-valuetext',
    'role',
    'target'
  ]
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let substituteMapForWeakMap = false;

if (typeof WeakMap !== 'undefined' && typeof Proxy !== 'undefined') {
  // Test for the Edge weakmap with proxies bug https://github.com/Microsoft/ChakraCore/issues/1662
  const map = new WeakMap();
  const proxyAsKey = new Proxy({}, {});
  map.set(proxyAsKey, true);
  substituteMapForWeakMap = map.get(proxyAsKey) !== true;
}

// TODO: RJ probably move this out to utils
function newWeakMap() {
  return typeof WeakMap !== 'undefined'
    ? !substituteMapForWeakMap ? new WeakMap() : new Map()
    : {
        /* WeakMap dummy polyfill */
        get: function() {
          return undefined;
        },
        set: function() {}
      };
}

// Keyed objects can only have one owner. We prevent "null" and "undefined"
// keys by guarding all set operations.
const keychain = newWeakMap();
// Map to store <key> to <Weakmap of <raw> to <Secure> pairs>, this is the primary cache
const rawToSecurePrimaryCacheByKey = new Map();
// Map to store <key> to <Map of <raw> to <Secure> pairs>, will be used for raw objects that cannot be stored in a WeakMap, this is the secondary cache
const rawToSecureSecondaryCacheByKey = new Map();
const secureToRaw = newWeakMap();
const opaqueSecure = newWeakMap();
const objectToKeyedData = newWeakMap();
const secureProxy = newWeakMap();
const filteringProxy = newWeakMap();
const secureFunction = newWeakMap();

const secureBlobTypes = newWeakMap();

function getKey(thing) {
  return keychain.get(thing);
}

function isOpaque(st) {
  return opaqueSecure.get(st) === true;
}

function setKey(thing, key) {
  if (!thing) {
    return;
  }
  if (!key) {
    throw new Error('Setting an empty key is prohibited.');
  }
  const hasKey = keychain.get(thing);
  if (hasKey === undefined) {
    keychain.set(thing, key);
  } else if (hasKey === key) {
    // noop.
  } else {
    // Prevent keyed objects from being keyed again.
    throw new Error('Re-setting of key is prohibited.');
  }
}

function trust$1(from, thing) {
  if (from) {
    const key = keychain.get(from);
    if (key) {
      setKey(thing, key);
    }
  }
}

function hasAccess(from, to) {
  return keychain.get(from) === keychain.get(to);
}

function verifyAccess(from, to, skipOpaque) {
  const fromKey = keychain.get(from);
  const toKey = keychain.get(to);
  if (fromKey !== toKey || (skipOpaque && isOpaque(to))) {
    throw new Error(
      `Access denied: ${JSON.stringify({
        from: fromKey,
        to: toKey
      })}`
    );
  }
}

function getRef(st, key, skipOpaque) {
  const toKey = keychain.get(st);
  if (toKey !== key || (skipOpaque && opaqueSecure.get(st))) {
    throw new Error(
      `Access denied: ${JSON.stringify({
        from: key,
        to: toKey
      })}`
    );
  }

  return secureToRaw.get(st);
}

function setRef(st, raw, key, isOpaque) {
  if (!st) {
    throw new Error('Setting an empty reference is prohibited.');
  }
  if (!key) {
    throw new Error('Setting an empty key is prohibited.');
  }
  setKey(st, key);
  secureToRaw.set(st, raw);
  if (isOpaque) {
    opaqueSecure.set(st, true);
  }
}

function getData(object, key) {
  const keyedData = objectToKeyedData.get(object);
  return keyedData ? keyedData.get(key) : undefined;
}

function setData(object, key, data) {
  let keyedData = objectToKeyedData.get(object);
  if (!keyedData) {
    keyedData = newWeakMap();
    objectToKeyedData.set(object, keyedData);
  }

  keyedData.set(key, data);
}

function isProxy(st) {
  return secureProxy.get(st) === true;
}

function registerProxy(st) {
  secureProxy.set(st, true);
}

function registerFilteringProxy(st) {
  filteringProxy.set(st, true);
}

function isFilteringProxy(st) {
  return filteringProxy.get(st) === true;
}

function registerSecureFunction(st) {
  secureFunction.set(st, true);
}

function isSecureFunction(st) {
  return secureFunction.get(st) === true;
}

function registerSecureBlob(st, type) {
  secureBlobTypes.set(st, type);
}

function isSecureBlob(st) {
  return secureBlobTypes.has(st);
}



function unwrap$1(from, st) {
  if (!st) {
    return st;
  }

  const key = keychain.get(from);
  let ref;

  if (isArray(st)) {
    // Only getRef on "secure" arrays
    if (secureToRaw.get(st)) {
      // Secure array - reconcile modifications to the filtered clone with the actual array
      ref = getRef(st, key);

      const originalLength = ref.length;
      let insertIndex = 0;
      for (let n = 0; n < st.length; n++) {
        // Find the next available location that corresponds to the filtered projection of the array
        while (insertIndex < originalLength && getKey(ref[insertIndex]) !== key) {
          insertIndex++;
        }

        ref[insertIndex++] = unwrap$1(from, st[n]);
      }
    } else {
      ref = [];
    }
  } else {
    ref = getRef(st, key);
  }

  return ref;
}

function addToCache(raw, st, key) {
  if (!raw) {
    throw new Error('Caching an empty reference is prohibited.');
  }

  if (!key) {
    throw new Error('Caching with an empty key is prohibited.');
  }

  let rawToSecurePrimary = rawToSecurePrimaryCacheByKey.get(key);
  let rawToSecureSecondary;
  if (!rawToSecurePrimary) {
    rawToSecurePrimary = new WeakMap();
    rawToSecurePrimaryCacheByKey.set(key, rawToSecurePrimary);
  }
  try {
    rawToSecurePrimary.set(raw, st);
  } catch (e) {
    /**
     * If caching raw object fails in a weakmap,
     * then create a secondary cache implemented using a Map(which is more fault tolerant).
     */
    rawToSecureSecondary = rawToSecureSecondaryCacheByKey.get(key);
    if (!rawToSecureSecondary) {
      // Created on demand
      rawToSecureSecondary = new Map();
      rawToSecureSecondaryCacheByKey.set(key, rawToSecureSecondary);
    }
    rawToSecureSecondary.set(raw, st);
  }
}

function getFromCache(raw, key) {
  const rawToSecurePrimaryCache = rawToSecurePrimaryCacheByKey.get(key);
  if (rawToSecurePrimaryCache) {
    let secureThing = rawToSecurePrimaryCache.get(raw);
    // If raw object was cached in primary WeakMap and we have used the secondary cache, look there
    if (!secureThing && rawToSecureSecondaryCacheByKey.size > 0) {
      const rawToSecureSecondary = rawToSecureSecondaryCacheByKey.get(key);
      secureThing = rawToSecureSecondary && rawToSecureSecondary.get(raw);
    }
    return secureThing;
  }
  return undefined;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const metadata$1 = {
  prototypes: {
    CanvasRenderingContext2D: {
      addHitRegion: FUNCTION,
      arc: FUNCTION,
      arcTo: FUNCTION,
      beginPath: FUNCTION,
      bezierCurveTo: FUNCTION,
      canvas: READ_ONLY_PROPERTY,
      clearHitRegions: FUNCTION,
      clearRect: FUNCTION,
      clip: FUNCTION,
      closePath: FUNCTION,
      createImageData: FUNCTION,
      createLinearGradient: FUNCTION,
      createPattern: FUNCTION_RAW_ARGS,
      createRadialGradient: FUNCTION,
      currentTransform: RAW,
      direction: DEFAULT,
      drawFocusIfNeeded: FUNCTION_RAW_ARGS,
      drawImage: FUNCTION_RAW_ARGS,
      ellipse: FUNCTION,
      fill: FUNCTION_RAW_ARGS,
      fillRect: FUNCTION,
      fillStyle: DEFAULT,
      fillText: FUNCTION,
      font: DEFAULT,
      getImageData: FUNCTION,
      getLineDash: FUNCTION,
      globalAlpha: DEFAULT,
      globalCompositeOperation: DEFAULT,
      imageSmoothingEnabled: DEFAULT,
      isPointInPath: FUNCTION,
      isPointInStroke: FUNCTION,
      lineCap: DEFAULT,
      lineDashOffset: DEFAULT,
      lineJoin: DEFAULT,
      lineTo: FUNCTION,
      lineWidth: DEFAULT,
      measureText: FUNCTION,
      miterLimit: DEFAULT,
      moveTo: FUNCTION,
      putImageData: FUNCTION_RAW_ARGS,
      quadraticCurveTo: FUNCTION,
      rect: FUNCTION,
      removeHitRegion: FUNCTION,
      restore: FUNCTION,
      resetTransform: FUNCTION,
      rotate: FUNCTION,
      save: FUNCTION,
      scale: FUNCTION,
      setLineDash: FUNCTION,
      setTransform: FUNCTION,
      scrollPathIntoView: FUNCTION_RAW_ARGS,
      strokeRect: FUNCTION,
      strokeStyle: DEFAULT,
      strokeText: FUNCTION,
      shadowBlur: DEFAULT,
      shadowColor: DEFAULT,
      shadowOffsetX: DEFAULT,
      shadowOffsetY: DEFAULT,
      stroke: FUNCTION_RAW_ARGS,
      textAlign: DEFAULT,
      textBaseline: DEFAULT,
      translate: FUNCTION,
      transform: FUNCTION
    }
  }
};

function SecureCanvasRenderingContext2D(ctx, key) {
  let o = getFromCache(ctx, key);
  if (o) {
    return o;
  }
  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureCanvasRenderingContext2D: ${ctx}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  SecureObject.addPrototypeMethodsAndProperties(metadata$1, o, ctx, key);

  setRef(o, ctx, key);
  addToCache(ctx, o, key);
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

// Mitigate proxy-related security issues
// https://github.com/tc39/ecma262/issues/272

// Objects that are deeply frozen
const frozenSet = new WeakSet();

/**
 * "deepFreeze()" acts like "Object.freeze()", except that:
 *
 * To deepFreeze an object is to freeze it and all objects transitively
 * reachable from it via transitive reflective property and prototype
 * traversal.
 */
function deepFreeze(node) {
  if (frozenSet.has(node)) {
    return;
  }

  // Objects that we're attempting to freeze.
  const freezingSet = new Set();

  // If val is something we should be freezing but aren't yet,
  // add it to freezingSet.
  function enqueue(val) {
    if (Object(val) !== val) {
      // ignore primitives
      return;
    }
    const type = typeof val;
    if (type !== 'object' && type !== 'function') {
      // future proof: break until someone figures out what it should do
      throw new TypeError(`Unexpected typeof: ${type}`);
    }
    if (frozenSet.has(val) || freezingSet.has(val)) {
      // Ignore if already frozen or freezing
      return;
    }
    freezingSet.add(val);
  }

  function doFreeze(obj) {
    const descs = getOwnPropertyDescriptors(obj);
    ownKeys(descs).forEach(name => {
      const desc = descs[name];
      if ('value' in desc) {
        enqueue(desc.value);
      } else {
        enqueue(desc.get);
        enqueue(desc.set);
      }
    });
    freeze(obj);
  }

  // Process the freezingSet.
  function dequeue() {
    // New values added before forEach() has finished will be visited.
    freezingSet.forEach(obj => {
      doFreeze(obj);
      enqueue(getPrototypeOf(obj));
    });
  }

  enqueue(node);
  dequeue();

  // "Committing" the changes upon exit guards against exceptions aborting
  // the deep freeze process, which could leave the system in a state
  // where unfrozen objects are never frozen when no longer discoverable by
  // subsequent invocations of deep-freeze because all object owning a reference
  // to them are frozen.

  freezingSet.forEach(frozenSet.add, frozenSet);
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Get all intrinsics:
 *
 * 1. Named intrinsics: available as data properties of
 * the global object.
 *
 * 2. Anonymous intrinsics: not otherwise reachable by own property
 * name traversal.
 *
 * https://tc39.github.io/ecma262/#table-7
 */
function getIntrinsics(realmRec) {
  const { unsafeGlobal: _ } = realmRec;

  // Anonymous intrinsics.

  const SymbolIterator = (typeof _.Symbol && _.Symbol.iterator) || '@@iterator';

  const ArrayIteratorInstance = new _.Array()[SymbolIterator]();
  const ArrayIteratorPrototype = getPrototypeOf(ArrayIteratorInstance);
  const IteratorPrototype = getPrototypeOf(ArrayIteratorPrototype);

  const AsyncFunctionInstance = _.eval('(async function(){})');
  const AsyncFunction = AsyncFunctionInstance.constructor;
  const AsyncFunctionPrototype = AsyncFunction.prototype;

  const GeneratorFunctionInstance = _.eval('(function*(){})');
  const GeneratorFunction = GeneratorFunctionInstance.constructor;
  const Generator = GeneratorFunction.prototype;
  const GeneratorPrototype = Generator.prototype;

  const hasAsyncIteration = typeof _.Symbol.asyncIterator !== 'undefined';

  const AsyncGeneratorFunctionInstance = hasAsyncIteration && _.eval('(async function*(){})');
  const AsyncGeneratorFunction = hasAsyncIteration && AsyncGeneratorFunctionInstance.constructor;
  const AsyncGenerator = hasAsyncIteration && AsyncGeneratorFunction.prototype;
  const AsyncGeneratorPrototype = hasAsyncIteration && AsyncGenerator.prototype;

  const AsyncFromSyncIteratorPrototype = hasAsyncIteration && undefined; // TODO
  const AsyncIteratorPrototype = hasAsyncIteration && getPrototypeOf(AsyncGeneratorPrototype);

  const MapIteratorObject = new _.Map()[SymbolIterator]();
  const MapIteratorPrototype = getPrototypeOf(MapIteratorObject);

  const SetIteratorObject = new _.Set()[SymbolIterator]();
  const SetIteratorPrototype = getPrototypeOf(SetIteratorObject);

  const StringIteratorObject = new _.String()[SymbolIterator]();
  const StringIteratorPrototype = getPrototypeOf(StringIteratorObject);

  const ThrowTypeError = _.eval(
    '(function () { "use strict"; return Object.getOwnPropertyDescriptor(arguments, "callee").get; })()'
  );

  const TypedArray = getPrototypeOf(Int8Array);
  const TypedArrayPrototype = TypedArray.prototype;

  // Named intrinsics

  return {
    // *** Table 7

    // %Array%
    Array: _.Array,
    // %ArrayBuffer%
    ArrayBuffer: _.ArrayBuffer,
    // %ArrayBufferPrototype%
    ArrayBufferPrototype: _.ArrayBuffer.prototype,
    // %ArrayIteratorPrototype%
    ArrayIteratorPrototype,
    // %ArrayPrototype%
    ArrayPrototype: _.Array.prototype,
    // %ArrayProto_entries%
    ArrayProto_entries: _.Array.prototype.entries,
    // %ArrayProto_foreach%
    ArrayProto_foreach: _.Array.prototype.forEach,
    // %ArrayProto_keys%
    ArrayProto_keys: _.Array.prototype.forEach,
    // %ArrayProto_values%
    ArrayProto_values: _.Array.prototype.values,
    // %AsyncFromSyncIteratorPrototype%
    AsyncFromSyncIteratorPrototype,
    // %AsyncFunction%
    AsyncFunction,
    // %AsyncFunctionPrototype%
    AsyncFunctionPrototype,
    // %AsyncGenerator%
    AsyncGenerator,
    // %AsyncGeneratorFunction%
    AsyncGeneratorFunction,
    // %AsyncGeneratorPrototype%
    AsyncGeneratorPrototype,
    // %AsyncIteratorPrototype%
    AsyncIteratorPrototype,
    // %Boolean%
    Boolean: _.Boolean,
    // %BooleanPrototype%
    BooleanPrototype: _.Boolean.prototype,
    // %DataView%
    DataView: _.DataView,
    // %DataViewPrototype%
    DataViewPrototype: _.DataView.prototype,
    // %Date%
    Date: _.Date,
    // %DatePrototype%
    DatePrototype: _.Date.prototype,
    // %decodeURI%
    decodeURI: _.decodeURI,
    // %decodeURIComponent%
    decodeURIComponent: _.decodeURIComponent,
    // %encodeURI%
    encodeURI: _.encodeURI,
    // %encodeURIComponent%
    encodeURIComponent: _.encodeURIComponent,
    // %Error%
    Error: _.Error,
    // %ErrorPrototype%
    ErrorPrototype: _.Error.prototype,
    // %eval%
    // eval: sandbox.eval,
    // %EvalError%
    EvalError: _.EvalError,
    // %EvalErrorPrototype%
    EvalErrorPrototype: _.EvalError.prototype,
    // %Float32Array%
    Float32Array: _.Float32Array,
    // %Float32ArrayPrototype%
    Float32ArrayPrototype: _.Float32Array.prototype,
    // %Float64Array%
    Float64Array: _.Float64Array,
    // %Float64ArrayPrototype%
    Float64ArrayPrototype: _.Float64Array.prototype,
    // %Function%
    Function: _.Function,
    // %FunctionPrototype%
    FunctionPrototype: Function.prototype,
    // %Generator%
    Generator,
    // %GeneratorFunction%
    GeneratorFunction,
    // %GeneratorPrototype%
    GeneratorPrototype,
    // %Int8Array%
    Int8Array: _.Int8Array,
    // %Int8ArrayPrototype%
    Int8ArrayPrototype: _.Int8Array.prototype,
    // %Int16Array%
    Int16Array: _.Int16Array,
    // %Int16ArrayPrototype%,
    Int16ArrayPrototype: _.Int16Array.prototype,
    // %Int32Array%
    Int32Array: _.Int32Array,
    // %Int32ArrayPrototype%
    Int32ArrayPrototype: _.Int32Array.prototype,
    // %isFinite%
    isFinite: _.isFinite,
    // %isNaN%
    isNaN: _.isNaN,
    // %IteratorPrototype%
    IteratorPrototype,
    // %JSON%
    JSON: _.JSON,
    // %JSONParse%
    JSONParse: _.JSON.parse,
    // %Map%
    Map: _.Map,
    // %MapIteratorPrototype%
    MapIteratorPrototype,
    // %MapPrototype%
    MapPrototype: _.Map.prototype,
    // %Math%
    Math: _.Math,
    // %Number%
    Number: _.Number,
    // %NumberPrototype%
    NumberPrototype: _.Number.prototype,
    // %Object%
    Object: _.Object,
    // %ObjectPrototype%
    ObjectPrototype: _.Object.prototype,
    // %ObjProto_toString%
    ObjProto_toString: _.Object.prototype.toString,
    // %ObjProto_valueOf%
    ObjProto_valueOf: _.Object.prototype.valueOf,
    // %parseFloat%
    parseFloat: _.parseFloat,
    // %parseInt%
    parseInt: _.parseInt,
    // %Promise%
    Promise: _.Promise,
    // %Promise_all%
    Promise_all: _.Promise.all,
    // %Promise_reject%
    Promise_reject: _.Promise.reject,
    // %Promise_resolve%
    Promise_resolve: _.Promise.resolve,
    // %PromiseProto_then%
    PromiseProto_then: _.Promise.prototype.then,
    // %PromisePrototype%
    PromisePrototype: _.Promise.prototype,
    // %Proxy%
    Proxy: _.Proxy,
    // %RangeError%
    RangeError: _.RangeError,
    // %RangeErrorPrototype%
    RangeErrorPrototype: _.RangeError.prototype,
    // %ReferenceError%
    ReferenceError: _.ReferenceError,
    // %ReferenceErrorPrototype%
    ReferenceErrorPrototype: _.ReferenceError.prototype,
    // %Reflect%
    Reflect: _.Reflect,
    // %RegExp%
    RegExp: _.RegExp,
    // %RegExpPrototype%
    RegExpPrototype: _.RegExp.prototype,
    // %Set%
    Set: _.Set,
    // %SetIteratorPrototype%
    SetIteratorPrototype,
    // %SetPrototype%
    SetPrototype: _.Set.prototype,
    // %SharedArrayBuffer%
    // SharedArrayBuffer: undefined, // Deprecated on Jan 5, 2018
    // %SharedArrayBufferPrototype%
    // SharedArrayBufferPrototype: undefined, // Deprecated on Jan 5, 2018
    // %String%
    String: _.String,
    // %StringIteratorPrototype%
    StringIteratorPrototype,
    // %StringPrototype%
    StringPrototype: _.String.prototype,
    // %Symbol%
    Symbol: _.Symbol,
    // %SymbolPrototype%
    SymbolPrototype: _.Symbol.prototype,
    // %SyntaxError%
    SyntaxError: _.SyntaxError,
    // %SyntaxErrorPrototype%
    SyntaxErrorPrototype: _.SyntaxError.prototype,
    // %ThrowTypeError%
    ThrowTypeError,
    // %TypedArray%
    TypedArray,
    // %TypedArrayPrototype%
    TypedArrayPrototype,
    // %TypeError%
    TypeError: _.TypeError,
    // %TypeErrorPrototype%
    TypeErrorPrototype: _.TypeError.prototype,
    // %Uint8Array%
    Uint8Array: _.Uint8Array,
    // %Uint8ArrayPrototype%
    Uint8ArrayPrototype: _.Uint8Array.prototype,
    // %Uint8ClampedArray%
    Uint8ClampedArray: _.Uint8ClampedArray,
    // %Uint8ClampedArrayPrototype%
    Uint8ClampedArrayPrototype: _.Uint8ClampedArray.prototype,
    // %Uint16Array%
    Uint16Array: _.Uint16Array,
    // %Uint16ArrayPrototype%
    Uint16ArrayPrototype: Uint16Array.prototype,
    // %Uint32Array%
    Uint32Array: _.Uint32Array,
    // %Uint32ArrayPrototype%
    Uint32ArrayPrototype: _.Uint32Array.prototype,
    // %URIError%
    URIError: _.URIError,
    // %URIErrorPrototype%
    URIErrorPrototype: _.URIError.prototype,
    // %WeakMap%
    WeakMap: _.WeakMap,
    // %WeakMapPrototype%
    WeakMapPrototype: _.WeakMap.prototype,
    // %WeakSet%
    WeakSet: _.WeakSet,
    // %WeakSetPrototype%
    WeakSetPrototype: _.WeakSet.prototype,

    // *** Annex B

    // %escape%
    escape: _.escape,
    // %unescape%
    unescape: _.unescape

    // TODO: other special cases
  };
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This whilelist represents properties of the global object
 * which, by definition, do not provide authority or access to globals.
 *
 * We want to declare these globals as constants to prevent de-optimization
 * by the with() and the Proxy() of the  evaluator.
 */
const stdlib = [
  // *** 18.2 Function Properties of the Global Object

  // 'eval', // This property must be sanitized.
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',

  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',

  // *** 18.3 Constructor Properties of the Global Object

  'Array',
  'ArrayBuffer',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'Float32Array',
  'Float64Array',
  // 'Function', // This property must be sanitized.
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Map',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  // 'SharedArrayBuffer', / Deprecated on Jan 5, 2018
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'URIError',
  'WeakMap',
  'WeakSet',

  // *** 18.4 Other Properties of the Global Object

  'Atomics',
  'JSON',
  'Math',
  'Reflect',

  // *** Annex B

  'escape',
  'unescape',

  // *** ECMA-402

  'Intl'
];

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
let evalEvaluatorFactory;

// Remove when SecureWindow is refactored to use sandbox
let unfrozenSet;
function setUnfrozenSet(names) {
  unfrozenSet = new Set(names);
}

/**
 * This ecaluator declares commonly used references like
 * "window" and the JS standard lib as constants to allow
 * the JIT optimizer to link to static references.
 */
function createEvalEvaluatorFactory(sandbox) {
  const { realmRec: { unsafeFunction } } = sandbox;

  // Function and eval are not in our standard lib. Only Function
  // is added here since eval needs to context switch and can't be
  // a constant.
  return unsafeFunction(`
    with (arguments[0]) {
      const {${stdlib.join(',')}, Function, window, document} = arguments[0];
      return function() {
        'use strict';
        return eval(arguments[0]);
      };
    }
  `);
}

class FreezingHandler {
  constructor(sandbox) {
    const { realmRec: { unsafeGlobal } } = sandbox;
    this.unsafeGlobal = unsafeGlobal;
  }
  setInternalEval() {
    // This sentinel allows one scoped direct eval.
    this.isInternalEval = true;
  }
  clearInternalEval() {
    // Return to safe eval.
    this.isInternalEval = false;
  }
  get(target, prop) {
    // Special treatment for eval.
    if (prop === 'eval') {
      if (this.isInternalEval) {
        this.isInternalEval = false;
        return this.unsafeGlobal.eval;
      }
      return target.eval;
    }
    // Properties of global.
    if (prop in target) {
      const value = target[prop];
      if (unfrozenSet && unfrozenSet.has(prop)) {
        deepFreeze(value);
        unfrozenSet.delete(prop);
      }
      return value;
    }
    // Prevent a lookup for other properties.
    return undefined;
  }
  has(target, prop) {
    if (prop === 'eval') {
      return true;
    }
    if (prop === 'arguments') {
      return false;
    }
    if (prop in target) {
      return true;
    }
    if (prop in this.unsafeGlobal) {
      return true;
    }
    return false;
  }
}

function createEvalEvaluator(sandbox) {
  const { globalObject } = sandbox;

  // This proxy has several functions:
  // 1. works with the sentinel to alternate between direct eval and confined eval.
  // 2. shadows all properties of the hidden global by declaring them as undefined.
  // 3. resolves all existing properties of the secure global.
  const handler = new FreezingHandler(sandbox);
  const proxy = new Proxy(globalObject, handler);

  // Lazy define and use the factory.
  if (!evalEvaluatorFactory) {
    evalEvaluatorFactory = createEvalEvaluatorFactory(sandbox);
  }
  const scopedEvaluator = evalEvaluatorFactory(proxy);

  function evaluator(src) {
    handler.setInternalEval();
    // Ensure that "this" resolves to the secure global.
    const result = scopedEvaluator.call(globalObject, src);
    handler.clearInternalEval();
    return result;
  }

  // Mimic the native eval() function. New properties are
  // by default non-writable and non-configurable.
  defineProperties(evaluator, {
    name: {
      value: 'eval'
    }
  });

  // This instance is namespace-specific, and therefore doesn't
  // need to be frozen (only the objects reachable from it).
  return evaluator;
}

/**
 * A safe version of the native Function which relies on
 * the safety of evalEvaluator for confinement.
 */
function createFunctionEvaluator(sandbox) {
  const { realmRec: { unsafeFunction } } = sandbox;

  const evaluator = function(...params) {
    const functionBody = params.pop() || '';
    // Conditionaly appends a new line to prevent execution during
    // construction.
    const functionParams = params.join(',') + (params.length > 0 ? '\n' : '');
    const src = `(function(${functionParams}){\n${functionBody}\n})`;
    // evalEvaluator is created after FunctionEvaluator,
    // so we can't link directly to it.
    return sandbox.evalEvaluator(src);
  };

  // Ensure that the different Function instances of the different
  // sandboxes all answer properly when used with the instanceof
  // operator to preserve indentity.
  const FunctionPrototype = unsafeFunction.prototype;

  // Mimic the native signature. New properties are
  // by default non-writable and non-configurable.
  defineProperties(evaluator, {
    name: {
      value: 'Function'
    },
    prototype: {
      value: FunctionPrototype
    }
  });

  // This instance is namespace-specific, and therefore doesn't
  // need to be frozen (only the objects reachable from it).
  return evaluator;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureScriptElement() {}

// TODO: this should be removed once Locker has a proper configuration mechanism in place
const TRUSTED_DOMAINS = /\.(force|salesforce)\.com$/;

SecureScriptElement.setOverrides = function(elementOverrides, prototype) {
  function getAttributeName(name) {
    const lowercasedName = name.toLowerCase();
    switch (lowercasedName) {
      case 'src':
        return 'data-locker-src';
      case 'href':
        return 'data-locker-href';
      default:
        return name;
    }
  }

  function isAttributeAllowed(name) {
    // null, undefined, ''
    // allow a passthrough of these values
    if (!name) {
      return true;
    }

    const BLACKLIST = ['xlink:href'];
    const lowercasedName = name.toLowerCase();
    return BLACKLIST.indexOf(lowercasedName) === -1;
  }

  elementOverrides['src'] = {
    enumerable: true,
    get: function() {
      return this.getAttribute.apply(this, ['src']);
    },
    set: function(value) {
      this.setAttribute.apply(this, ['src', value]);
    }
  };

  const orignalGetAttribute = prototype.getAttribute;
  elementOverrides['getAttribute'] = {
    value: function(name) {
      return orignalGetAttribute.apply(this, [getAttributeName(name)]);
    }
  };

  const orignalSetAttribute = prototype.setAttribute;
  elementOverrides['setAttribute'] = {
    value: function(name, value) {
      if (isAttributeAllowed(name)) {
        orignalSetAttribute.apply(this, [getAttributeName(name), value]);
      }
    }
  };

  const orignalGetAttributeNS = prototype.getAttributeNS;
  elementOverrides['getAttributeNS'] = {
    value: function(ns, name) {
      return orignalGetAttributeNS.apply(this, [ns, getAttributeName(name)]);
    }
  };

  const orignalSetAttributeNS = prototype.setAttributeNS;
  elementOverrides['setAttributeNS'] = {
    value: function(ns, name, value) {
      if (isAttributeAllowed(name)) {
        orignalSetAttributeNS.apply(this, [ns, getAttributeName(name), value]);
      }
    }
  };

  const orignalGetAttributeNode = prototype.getAttributeNode;
  elementOverrides['getAttributeNode'] = {
    value: function(name) {
      return orignalGetAttributeNode.apply(this, [getAttributeName(name)]);
    }
  };

  const orignalGetAttributeNodeNS = prototype.getAttributeNodeNS;
  elementOverrides['getAttributeNodeNS'] = {
    value: function(ns, name) {
      return orignalGetAttributeNodeNS.apply(this, [ns, getAttributeName(name)]);
    }
  };

  const orignalSetAttributeNode = prototype.setAttributeNode;
  elementOverrides['setAttributeNode'] = {
    value: function(attr) {
      let raw = unwrap$1(this, attr);
      if (!raw) {
        // this will allow the browser to throw TypeError using native error messages
        orignalGetAttributeNode.call(this, raw);
      }

      /* We are interested in the value of the given attribute but we want
            to avoid executing any getters so we will clone it and attach it
            to a floating element which is not going to be a script tag.
            According to https://dev.w3.org/html5/spec-preview/the-script-element.html section 14
            some browsers may initiate fetching the script before it has been
            added to the DOM. Not using a script tag will prevent that. */
      const clone = raw.cloneNode();
      const normalizer = document.createElement('span');
      normalizer.setAttributeNode(clone);

      const attrNode = normalizer.attributes[0];
      switch (attrNode.name) {
        case 'xlink:href': {
          return undefined;
        }
        case 'src':
        case 'href': {
          raw = document.createAttribute(getAttributeName(attrNode.name));
          raw.value = attrNode.value;
          break;
        }
        default: {
          break;
        }
      }

      const replacedAttr = orignalSetAttributeNode.call(this, raw);
      return SecureObject.filterEverything(this, replacedAttr);
    }
  };

  elementOverrides['attributes'] = SecureObject.createFilteredPropertyStateless(
    'attributes',
    prototype,
    {
      writable: false,
      afterGetCallback: function(attributes) {
        if (!attributes) {
          return attributes;
        }
        // Secure attributes
        const secureAttributes = [];
        const raw = SecureObject.getRaw(this);
        for (let i = 0; i < attributes.length; i++) {
          const attribute = attributes[i];

          // Only add supported attributes
          if (SecureElement.isValidAttributeName(raw, attribute.name, prototype)) {
            let attributeName = attribute.name;
            if (attribute.name === 'src') {
              continue;
            }
            if (attribute.name === 'data-locker-src') {
              attributeName = 'src';
            }

            if (attribute.name === 'data-locker-href') {
              attributeName = 'href';
            }

            secureAttributes.push({
              name: attributeName,
              value: SecureObject.filterEverything(this, attribute.value)
            });
          }
        }
        return secureAttributes;
      }
    }
  );
};

SecureScriptElement.run = function(st) {
  const src = st.getAttribute('src');
  const href = st.getAttribute('href');
  const scriptUrl = src || href;

  if (!scriptUrl) {
    return;
  }

  const el = SecureObject.getRaw(st);
  document.head.appendChild(el);

  if (href && !(el instanceof SVGScriptElement)) {
    return;
  }

  // Get source using XHR and secure it using
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    const key = getKey(st);
    if (xhr.readyState === 4 && xhr.status === 200) {
      const code = xhr.responseText;
      evaluate(code, key, scriptUrl);

      el.dispatchEvent(new Event('load'));
    }

    // DCHASMAN TODO W-2837800 Add in error handling for 404's etc
  };

  xhr.open('GET', scriptUrl, true);

  // send credentials only when performing CORS requests
  // TODO: this should be revisited once Locker has a proper configuration mechanism
  const normalized = document.createElement('a');
  normalized.href = scriptUrl;
  if (normalized.hostname.match(TRUSTED_DOMAINS)) {
    xhr.withCredentials = true;
  }

  xhr.send();
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let warn = typeof console !== 'undefined' ? console.warn : function() {}; // eslint-disable-line no-console
let error = Error;

function registerReportAPI(api) {
  if (api) {
    warn = api.warn;
    error = api.error;
  }
}

/**
 * Sanitizes a URL string . Will prevent:
 * - usage of UTF-8 control characters. Update BLACKLIST constant to support more
 * - usage of \n, \t in url strings
 * @param {String} urlString
 * @returns {String}
 */
function sanitizeURLString(urlString) {
  const BLACKLIST = /[\u2029\u2028\n\r\t]/gi;

  // false, '', undefined, null
  if (!urlString) {
    return urlString;
  }

  if (typeof urlString !== 'string') {
    throw new TypeError('URL argument is not a string');
  }

  return urlString.replace(BLACKLIST, '');
}

/**
 * Sanitizes for a DOM element. Typical use would be when wanting to sanitize for
 * an href or src attribute of an element or window.open
 * @param {*} url
 */
function sanitizeURLForElement(url) {
  const normalized = document.createElement('a');
  normalized.href = url;
  return sanitizeURLString(normalized.href);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function assert(condition) {
  if (!condition) {
    throw new Error();
  }
}

// TODO: remove these functions. Our filtering mechanism should not
// rely on the more expensive operation.

function isObjectObject(value) {
  return (
    typeof value === 'object' && value !== null && objectToString.call(value) === '[object Object]'
  );
}

// https://github.com/jonschlinkert/is-plain-object
// Copyright © 2017, Jon Schlinkert. Released under the MIT License.
function isPlainObject(value) {
  if (isObjectObject(value) === false) {
    return false;
  }

  // If has modified constructor
  const ctor = value.constructor;
  if (typeof ctor !== 'function') {
    return false;
  }

  try {
    // If has modified prototype
    const proto = ctor.prototype;
    if (isObjectObject(proto) === false) {
      return false;
    }
    // If constructor does not have an Object-specific method
    if (proto.hasOwnProperty('isPrototypeOf') === false) {
      return false;
    }
  } catch (e) {
    /* Assume is  object when throws */
  }

  // Most likely a plain Object
  return true;
}

/**
 * Basic URL Scheme checking utility.
 * Checks for http: and https: url schemes.
 * @param {String} url
 * @return {Boolean}
 */
function isValidURLScheme(url) {
  const normalized = document.createElement('a');
  normalized.href = url;
  return normalized.protocol === 'https:' || normalized.protocol === 'http:';
}

/**
 * Displays a popup asking if the user wants to exit the current domain.
 * Returns a boolean of the result of that popup.
 * @return {Boolean}
 */
function confirmNavigationAwayFromCurrentDomain() {
  let currentLocation = `${window.location.protocol}//${window.location.hostname}`;
  currentLocation += window.location.port.length ? `:${window.location.port}` : '';

  // eslint-disable-next-line
  if (confirm(`You are exiting ${currentLocation}. Continue?`)) {
    return true;
  }
  return false;
}

/**
 * Determines if a link points to a third-party domain.
 * @param {Object} currentDomain
 * @param {Object} newDomain
 * @return {Boolean}
 */
function isSameLocation(currentDomain, newDomain) {
  if (currentDomain.protocol !== newDomain.protocol) {
    return false;
  }

  if (currentDomain.hostname !== newDomain.hostname) {
    return false;
  }

  if (currentDomain.port !== newDomain.port) {
    return false;
  }

  return true;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const SecureIFrameElement = {
  addMethodsAndProperties: function(prototype) {
    defineProperties(prototype, {
      // Standard HTMLElement methods
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement#Methods
      blur: SecureObject.createFilteredMethodStateless('blur', prototype),
      focus: SecureObject.createFilteredMethodStateless('focus', prototype),
      contentWindow: {
        get: function() {
          const raw = SecureObject.getRaw(this);
          return raw.contentWindow
            ? SecureIFrameElement.SecureIFrameContentWindow(raw.contentWindow, getKey(this))
            : raw.contentWindow;
        }
      },
      // Reason: [W-4437391] Cure53 Report SF-04-004: Window access via encoded path segments.
      src: {
        get: function() {
          const raw = SecureObject.getRaw(this);
          return raw.src;
        },
        set: function(url) {
          const urlString = sanitizeURLForElement(url);
          if (urlString.length > 0) {
            if (!isValidURLScheme(urlString)) {
              warn(
                'SecureIframeElement.src supports http://, https:// schemes and relative urls.'
              );
            } else {
              const raw = SecureObject.getRaw(this);
              raw.src = urlString;
            }
          }
        }
      }
    });

    // Standard list of iframe's properties from:
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLIFrameElement
    // Note: Ignoring 'contentDocument', 'sandbox' and 'srcdoc' from the list above.
    ['height', 'width', 'name'].forEach(name =>
      defineProperty(prototype, name, SecureObject.createFilteredPropertyStateless(name, prototype))
    );
  },

  // TODO: Move this function into a separate file
  SecureIFrameContentWindow: function(w, key) {
    let sicw = getFromCache(w, key);
    if (sicw) {
      return sicw;
    }
    sicw = create$1(null, {
      toString: {
        value: function() {
          return `SecureIFrameContentWindow: ${w}{ key: ${JSON.stringify(key)} }`;
        }
      }
    });

    defineProperties(sicw, {
      postMessage: SecureObject.createFilteredMethod(sicw, w, 'postMessage', { rawArguments: true })
    });

    setRef(sicw, w, key);
    addToCache(w, sicw, key);
    registerProxy(sicw);

    return sicw;
  }
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const metadata$3 = {
  ATTRIBUTE_NODE: DEFAULT,
  CDATA_SECTION_NODE: DEFAULT,
  COMMENT_NODE: DEFAULT,
  DOCUMENT_FRAGMENT_NODE: DEFAULT,
  DOCUMENT_NODE: DEFAULT,
  DOCUMENT_POSITION_CONTAINED_BY: DEFAULT,
  DOCUMENT_POSITION_CONTAINS: DEFAULT,
  DOCUMENT_POSITION_DISCONNECTED: DEFAULT,
  DOCUMENT_POSITION_FOLLOWING: DEFAULT,
  DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: DEFAULT,
  DOCUMENT_POSITION_PRECEDING: DEFAULT,
  DOCUMENT_TYPE_NODE: DEFAULT,
  ELEMENT_NODE: DEFAULT,
  ENTITY_NODE: DEFAULT,
  ENTITY_REFERENCE_NODE: DEFAULT,
  NOTATION_NODE: DEFAULT,
  PROCESSING_INSTRUCTION_NODE: DEFAULT,
  TEXT_NODE: DEFAULT,
  appendChild: FUNCTION,
  baseURI: DEFAULT,
  childNodes: DEFAULT,
  cloneNode: FUNCTION,
  compareDocumentPosition: FUNCTION_RAW_ARGS,
  contains: FUNCTION_RAW_ARGS,
  firstChild: SKIP_OPAQUE,
  hasChildNodes: FUNCTION,
  insertBefore: FUNCTION,
  isDefaultNamespace: FUNCTION,
  isEqualNode: FUNCTION_RAW_ARGS,
  isSameNode: FUNCTION_RAW_ARGS,
  lastChild: SKIP_OPAQUE,
  lookupNamespaceURI: FUNCTION,
  lookupPrefix: FUNCTION,
  nextSibling: SKIP_OPAQUE,
  nodeName: DEFAULT,
  nodeType: DEFAULT,
  nodeValue: DEFAULT,
  normalize: FUNCTION,
  ownerDocument: DEFAULT,
  parentElement: SKIP_OPAQUE,
  parentNode: SKIP_OPAQUE,
  previousSibling: SKIP_OPAQUE,
  removeChild: FUNCTION,
  replaceChild: FUNCTION,
  textContent: DEFAULT
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const metadata$4 = {
  addEventListener: FUNCTION,
  dispatchEvent: FUNCTION,
  removeEventListener: FUNCTION
};

const CALLBACK_ERROR = `Failed to execute 'addEventListener' on 'EventTarget': The callback provided as parameter 2 is not an object.`;

function createSecureListener(st, listener, key) {
  // If the listener is a function, we need to ignore any
  // handleEvent property set on it.
  if (typeof listener === 'function') {
    return function(e) {
      verifyAccess(st, listener, true);
      const se = e && SecureDOMEvent(e, key);
      listener.call(st, se);
    };
  }

  if (typeof listener === 'object') {
    // capture the pointer to prevent shape-shifting
    const handleEvent = listener.handleEvent;
    if (typeof handleEvent === 'function') {
      return function(e) {
        verifyAccess(st, listener, true);
        const se = e && SecureDOMEvent(e, key);
        handleEvent.call(listener, se);
      };
    }
  }

  return undefined;
}

function getSecureListener(st, listener, key) {
  let sListener = getFromCache(listener, key);
  if (!sListener) {
    sListener = createSecureListener(st, listener, key);
    addToCache(listener, sListener, key);
    setKey(listener, key);
  }
  return sListener;
}

function createAddEventListenerDescriptor(st, el, key) {
  return {
    writable: true,
    // TODO: RJ Add back useCapture
    value: function(event, listener) {
      if (!listener) {
        return; // by spec, missing callback argument does not throw,
        // just ignores it.
      }
      if (Object(listener) !== listener) {
        throw new TypeError(CALLBACK_ERROR);
      }

      const sListener = getSecureListener(st, listener, key);
      el.addEventListener(event, sListener);
    }
  };
}

function addEventTargetMethods(st, raw, key) {
  defineProperties(st, {
    addEventListener: createAddEventListenerDescriptor(st, raw, key),
    dispatchEvent: SecureObject.createFilteredMethod(st, raw, 'dispatchEvent', {
      rawArguments: true
    }),

    // removeEventListener() is special in that we do not want to
    // unfilter/unwrap the listener argument or it will not match what
    // was actually wired up originally
    removeEventListener: {
      writable: true,
      value: function(type, listener, options) {
        const sCallback = getFromCache(listener, key);
        raw.removeEventListener(type, sCallback, options);
      }
    }
  });
}

function createAddEventListenerDescriptorStateless() {
  return {
    value: function(event, listener, useCapture) {
      if (!listener) {
        return; // by spec, missing callback argument does not throw,
        // just ignores it.
      }
      if (Object(listener) !== listener) {
        throw new TypeError(CALLBACK_ERROR);
      }

      const so = this;
      const el = SecureObject.getRaw(so);
      const key = getKey(so);

      const sListener = getSecureListener(so, listener, key);
      el.addEventListener(event, sListener, useCapture);
    }
  };
}

function createEventTargetMethodsStateless(config, prototype) {
  config['addEventListener'] = createAddEventListenerDescriptorStateless(prototype);

  config['dispatchEvent'] = SecureObject.createFilteredMethodStateless('dispatchEvent', prototype, {
    rawArguments: true
  });

  // removeEventListener() is special in that we do not want to
  // unfilter/unwrap the listener argument or it will not match what
  // was actually wired up originally
  config['removeEventListener'] = {
    value: function(type, listener, options) {
      const raw = SecureObject.getRaw(this);
      const sCallback = getFromCache(listener, getKey(this));
      raw.removeEventListener(type, sCallback, options);
    }
  };
}

const assert$1 = {
  block: fn => fn(),
  isTrue: (condition, message) => {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  },
  isFalse: (condition, message) => {
    if (condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  },
  invariant: (condition, message) => {
    if (!condition) {
      throw new Error(`Invariant violation: ${message}`);
    }
  }
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const proxyMap = newWeakMap();
function addProxy(proxy, raw) {
  proxyMap.set(proxy, raw);
}

const lsProxyFormatter = {
  header: proxy => {
    const raw = proxyMap.get(proxy);
    if (!raw) {
      return null;
    }
    // If SecureElement proxy, show the original element
    if (raw instanceof Element) {
      return ['object', { object: raw }];
    }
    // TODO: If Array proxy or HTMLCollection/NodeList proxy, we need to filter the elements and display only the raw values of those elements
    return null;
  },
  // let the browser display the object in its native format
  hasBody: () => false,
  body: () => null
};

/** Custom Formatter for Dev Tools
 * To enable this, open Chrome Dev Tools
 * Go to Settings,
 * Under console, select "Enable custom formatters"
 * For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
 */
if (typeof window !== 'undefined') {
  window.devtoolsFormatters = window.devtoolsFormatters || [];
  window.devtoolsFormatters.push(lsProxyFormatter);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let customElementHook;
function registerCustomElementHook(hook) {
  customElementHook = hook;
}

const REGEX_CONTAINS_IMPORT = /import/i;

// Remove when SecureElement is refactored to use sandbox
let shouldFreeze;
function setElementRealm(realmRec) {
  shouldFreeze = realmRec.shouldFreeze;
}

/* import { isValidURLScheme } from '../utils/checks';
import { sanitizeURLForElement } from '../utils/sanitize';
 */
const metadata$2 = {
  prototypes: {
    DocumentFragment: {
      childElementCount: DEFAULT,
      children: DEFAULT,
      firstElementChild: SKIP_OPAQUE,
      getElementById: FUNCTION,
      lastElementChild: SKIP_OPAQUE,
      querySelector: FUNCTION,
      querySelectorAll: FUNCTION
    },
    HTMLAnchorElement: {
      charset: DEFAULT,
      coords: DEFAULT,
      download: DEFAULT,
      hash: DEFAULT,
      host: DEFAULT,
      hostname: DEFAULT,
      href: DEFAULT,
      hreflang: DEFAULT,
      name: DEFAULT,
      origin: DEFAULT,
      password: DEFAULT,
      pathname: DEFAULT,
      ping: DEFAULT,
      port: DEFAULT,
      protocol: DEFAULT,
      referrerPolicy: DEFAULT,
      rel: DEFAULT,
      rev: DEFAULT,
      search: DEFAULT,
      shape: DEFAULT,
      target: DEFAULT,
      text: DEFAULT,
      type: DEFAULT,
      username: DEFAULT
    },
    HTMLAreaElement: {
      alt: DEFAULT,
      coords: DEFAULT,
      hash: DEFAULT,
      host: DEFAULT,
      hostname: DEFAULT,
      href: DEFAULT,
      noHref: DEFAULT,
      origin: DEFAULT,
      password: DEFAULT,
      pathname: DEFAULT,
      ping: DEFAULT,
      port: DEFAULT,
      protocol: DEFAULT,
      referrerPolicy: DEFAULT,
      search: DEFAULT,
      shape: DEFAULT,
      target: DEFAULT,
      username: DEFAULT
    },
    HTMLAudioElement: {},
    HTMLMediaElement: {
      HAVE_CURRENT_DATA: DEFAULT,
      HAVE_ENOUGH_DATA: DEFAULT,
      HAVE_FUTURE_DATA: DEFAULT,
      HAVE_METADATA: DEFAULT,
      HAVE_NOTHING: DEFAULT,
      NETWORK_EMPTY: DEFAULT,
      NETWORK_IDLE: DEFAULT,
      NETWORK_LOADING: DEFAULT,
      NETWORK_NO_SOURCE: DEFAULT,
      addTextTrack: FUNCTION,
      autoplay: DEFAULT,
      buffered: DEFAULT,
      canPlayType: FUNCTION,
      controls: DEFAULT,
      crossOrigin: DEFAULT,
      currentSrc: DEFAULT,
      currentTime: DEFAULT,
      defaultMuted: DEFAULT,
      defaultPlaybackRate: DEFAULT,
      disableRemotePlayback: DEFAULT,
      duration: DEFAULT,
      ended: DEFAULT,
      error: DEFAULT,
      load: FUNCTION,
      loop: DEFAULT,
      mediaKeys: DEFAULT,
      muted: DEFAULT,
      networkState: DEFAULT,
      onencrypted: EVENT,
      pause: FUNCTION,
      paused: DEFAULT,
      play: FUNCTION,
      playbackRate: DEFAULT,
      played: DEFAULT,
      preload: DEFAULT,
      readyState: DEFAULT,
      seekable: DEFAULT,
      seeking: DEFAULT,
      setMediaKeys: FUNCTION,
      setSinkId: FUNCTION,
      sinkId: DEFAULT,
      src: DEFAULT,
      srcObject: DEFAULT,
      textTracks: DEFAULT,
      volume: DEFAULT,
      webkitAudioDecodedByteCount: DEFAULT,
      webkitVideoDecodedByteCount: DEFAULT
    },
    HTMLBaseElement: {
      href: DEFAULT,
      target: DEFAULT
    },
    HTMLButtonElement: {
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      disabled: DEFAULT,
      form: DEFAULT,
      formAction: DEFAULT,
      formEnctype: DEFAULT,
      formMethod: DEFAULT,
      formNoValidate: DEFAULT,
      formTarget: DEFAULT,
      labels: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLCanvasElement: {
      captureStream: FUNCTION,
      getContext: FUNCTION,
      height: DEFAULT,
      toBlob: FUNCTION,
      toDataURL: FUNCTION,
      width: DEFAULT
    },
    HTMLTableColElement: {
      align: DEFAULT,
      ch: DEFAULT,
      chOff: DEFAULT,
      span: DEFAULT,
      vAlign: DEFAULT,
      width: DEFAULT
    },
    HTMLUnknownElement: {},
    HTMLModElement: {
      cite: DEFAULT,
      dateTime: DEFAULT
    },
    HTMLDetailsElement: {
      open: DEFAULT
    },
    HTMLEmbedElement: {
      align: DEFAULT,
      getSVGDocument: FUNCTION,
      height: DEFAULT,
      name: DEFAULT,
      src: DEFAULT,
      type: DEFAULT,
      width: DEFAULT
    },
    HTMLFieldSetElement: {
      checkValidity: FUNCTION,
      disabled: DEFAULT,
      elements: DEFAULT,
      form: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLFormElement: {
      acceptCharset: DEFAULT,
      action: DEFAULT,
      autocomplete: DEFAULT,
      checkValidity: FUNCTION,
      elements: DEFAULT,
      encoding: DEFAULT,
      enctype: DEFAULT,
      length: DEFAULT,
      method: DEFAULT,
      name: DEFAULT,
      noValidate: DEFAULT,
      reportValidity: FUNCTION,
      requestAutocomplete: FUNCTION,
      reset: FUNCTION,
      submit: FUNCTION,
      target: DEFAULT
    },
    HTMLIFrameElement: {
      align: DEFAULT,
      allowFullscreen: DEFAULT,
      frameBorder: DEFAULT,
      height: DEFAULT,
      longDesc: DEFAULT,
      marginHeight: DEFAULT,
      marginWidth: DEFAULT,
      name: DEFAULT,
      referrerPolicy: DEFAULT,
      scrolling: DEFAULT,
      src: DEFAULT,
      width: DEFAULT
    },
    HTMLImageElement: {
      align: DEFAULT,
      alt: DEFAULT,
      border: DEFAULT,
      complete: DEFAULT,
      crossOrigin: DEFAULT,
      currentSrc: DEFAULT,
      height: DEFAULT,
      hspace: DEFAULT,
      isMap: DEFAULT,
      longDesc: DEFAULT,
      lowsrc: DEFAULT,
      name: DEFAULT,
      naturalHeight: DEFAULT,
      naturalWidth: DEFAULT,
      referrerPolicy: DEFAULT,
      sizes: DEFAULT,
      src: DEFAULT,
      srcset: DEFAULT,
      useMap: DEFAULT,
      vspace: DEFAULT,
      width: DEFAULT,
      x: DEFAULT,
      y: DEFAULT
    },
    HTMLInputElement: {
      accept: DEFAULT,
      align: DEFAULT,
      alt: DEFAULT,
      autocapitalize: DEFAULT,
      autocomplete: DEFAULT,
      autocorrect: DEFAULT,
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      checked: DEFAULT,
      defaultChecked: DEFAULT,
      defaultValue: DEFAULT,
      dirName: DEFAULT,
      disabled: DEFAULT,
      files: DEFAULT,
      form: DEFAULT,
      formAction: DEFAULT,
      formEnctype: DEFAULT,
      formMethod: DEFAULT,
      formNoValidate: DEFAULT,
      formTarget: DEFAULT,
      height: DEFAULT,
      incremental: DEFAULT,
      indeterminate: DEFAULT,
      labels: DEFAULT,
      list: DEFAULT,
      max: DEFAULT,
      maxLength: DEFAULT,
      min: DEFAULT,
      minLength: DEFAULT,
      multiple: DEFAULT,
      name: DEFAULT,
      pattern: DEFAULT,
      placeholder: DEFAULT,
      readOnly: DEFAULT,
      reportValidity: FUNCTION,
      required: DEFAULT,
      results: DEFAULT,
      select: FUNCTION,
      selectionDirection: DEFAULT,
      selectionEnd: DEFAULT,
      selectionStart: DEFAULT,
      setCustomValidity: FUNCTION,
      setRangeText: FUNCTION,
      setSelectionRange: FUNCTION,
      size: DEFAULT,
      src: DEFAULT,
      step: DEFAULT,
      stepDown: FUNCTION,
      stepUp: FUNCTION,
      type: DEFAULT,
      useMap: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      valueAsDate: DEFAULT,
      valueAsNumber: DEFAULT,
      webkitEntries: DEFAULT,
      webkitdirectory: DEFAULT,
      width: DEFAULT,
      willValidate: DEFAULT,
      'x-moz-errormessage': DEFAULT
    },
    HTMLLabelElement: {
      control: DEFAULT,
      form: DEFAULT,
      htmlFor: DEFAULT
    },
    HTMLLIElement: {
      type: DEFAULT,
      value: DEFAULT
    },
    HTMLLinkElement: {
      as: DEFAULT,
      charset: DEFAULT,
      crossOrigin: DEFAULT,
      disabled: DEFAULT,
      href: DEFAULT,
      hreflang: DEFAULT,
      import: DEFAULT,
      integrity: DEFAULT,
      media: DEFAULT,
      rel: DEFAULT,
      relList: DEFAULT,
      rev: DEFAULT,
      sheet: DEFAULT,
      sizes: DEFAULT,
      target: DEFAULT,
      type: DEFAULT
    },
    HTMLMapElement: {
      areas: DEFAULT,
      name: DEFAULT
    },
    HTMLMetaElement: {
      content: DEFAULT,
      httpEquiv: DEFAULT,
      name: DEFAULT,
      scheme: DEFAULT
    },
    HTMLMeterElement: {
      high: DEFAULT,
      labels: DEFAULT,
      low: DEFAULT,
      max: DEFAULT,
      min: DEFAULT,
      optimum: DEFAULT,
      value: DEFAULT
    },
    HTMLObjectElement: {
      align: DEFAULT,
      archive: DEFAULT,
      border: DEFAULT,
      checkValidity: FUNCTION,
      code: DEFAULT,
      codeBase: DEFAULT,
      codeType: DEFAULT,
      contentDocument: DEFAULT,
      data: DEFAULT,
      declare: DEFAULT,
      form: DEFAULT,
      getSVGDocument: FUNCTION,
      height: DEFAULT,
      hspace: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      standby: DEFAULT,
      type: DEFAULT,
      useMap: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      vspace: DEFAULT,
      width: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLOListElement: {
      compact: DEFAULT,
      reversed: DEFAULT,
      start: DEFAULT,
      type: DEFAULT
    },
    HTMLOptGroupElement: {
      disabled: DEFAULT,
      label: DEFAULT
    },
    HTMLOptionElement: {
      defaultSelected: DEFAULT,
      disabled: DEFAULT,
      form: DEFAULT,
      index: DEFAULT,
      label: DEFAULT,
      selected: DEFAULT,
      text: DEFAULT,
      value: DEFAULT
    },
    HTMLOutputElement: {
      checkValidity: FUNCTION,
      defaultValue: DEFAULT,
      form: DEFAULT,
      htmlFor: DEFAULT,
      labels: DEFAULT,
      name: DEFAULT,
      reportValidity: FUNCTION,
      setCustomValidity: FUNCTION,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLParamElement: {
      name: DEFAULT,
      type: DEFAULT,
      value: DEFAULT,
      valueType: DEFAULT
    },
    HTMLProgressElement: {
      labels: DEFAULT,
      max: DEFAULT,
      position: DEFAULT,
      value: DEFAULT
    },
    HTMLQuoteElement: {
      cite: DEFAULT
    },
    HTMLScriptElement: {
      src: DEFAULT,
      type: DEFAULT
    },
    HTMLSelectElement: {
      add: FUNCTION,
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      disabled: DEFAULT,
      form: DEFAULT,
      item: FUNCTION,
      labels: DEFAULT,
      length: DEFAULT,
      multiple: DEFAULT,
      name: DEFAULT,
      namedItem: FUNCTION,
      options: DEFAULT,
      remove: FUNCTION,
      reportValidity: FUNCTION,
      required: DEFAULT,
      selectedIndex: DEFAULT,
      selectedOptions: DEFAULT,
      setCustomValidity: FUNCTION,
      size: DEFAULT,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT
    },
    HTMLSourceElement: {
      media: DEFAULT,
      sizes: DEFAULT,
      src: DEFAULT,
      srcset: DEFAULT,
      type: DEFAULT
    },
    HTMLTableCellElement: {
      abbr: DEFAULT,
      align: DEFAULT,
      axis: DEFAULT,
      bgColor: DEFAULT,
      cellIndex: DEFAULT,
      ch: DEFAULT,
      chOff: DEFAULT,
      colSpan: DEFAULT,
      headers: DEFAULT,
      height: DEFAULT,
      noWrap: DEFAULT,
      rowSpan: DEFAULT,
      scope: DEFAULT,
      vAlign: DEFAULT,
      width: DEFAULT
    },
    HTMLTableElement: {
      caption: DEFAULT,
      tHead: SKIP_OPAQUE,
      tFoot: SKIP_OPAQUE,
      tBodies: DEFAULT,
      createTHead: FUNCTION_TRUST_RETURN_VALUE,
      deleteTHead: FUNCTION,
      createTFoot: FUNCTION_TRUST_RETURN_VALUE,
      deleteTFoot: FUNCTION,
      createCaption: FUNCTION_TRUST_RETURN_VALUE,
      deleteCaption: FUNCTION,
      rows: DEFAULT,
      insertRow: FUNCTION_TRUST_RETURN_VALUE,
      deleteRow: FUNCTION,
      width: DEFAULT
    },
    HTMLTableRowElement: {
      cells: DEFAULT,
      rowIndex: DEFAULT,
      sectionRowIndex: DEFAULT,
      insertCell: FUNCTION_TRUST_RETURN_VALUE,
      deleteCell: FUNCTION
    },
    HTMLTableSectionElement: {
      rows: DEFAULT,
      insertRow: FUNCTION_TRUST_RETURN_VALUE,
      deleteRow: FUNCTION
    },
    HTMLTemplateElement: {
      content: DEFAULT
    },
    HTMLTextAreaElement: {
      autocapitalize: DEFAULT,
      autofocus: DEFAULT,
      checkValidity: FUNCTION,
      cols: DEFAULT,
      defaultValue: DEFAULT,
      dirName: DEFAULT,
      disabled: DEFAULT,
      form: DEFAULT,
      labels: DEFAULT,
      maxLength: DEFAULT,
      minLength: DEFAULT,
      name: DEFAULT,
      placeholder: DEFAULT,
      readOnly: DEFAULT,
      reportValidity: FUNCTION,
      required: DEFAULT,
      rows: DEFAULT,
      select: FUNCTION,
      selectionDirection: DEFAULT,
      selectionEnd: DEFAULT,
      selectionStart: DEFAULT,
      setCustomValidity: FUNCTION,
      setRangeText: FUNCTION,
      setSelectionRange: FUNCTION,
      textLength: DEFAULT,
      type: DEFAULT,
      validationMessage: DEFAULT,
      validity: DEFAULT,
      value: DEFAULT,
      willValidate: DEFAULT,
      wrap: DEFAULT
    },
    HTMLTrackElement: {
      ERROR: DEFAULT,
      LOADED: DEFAULT,
      LOADING: DEFAULT,
      NONE: DEFAULT,
      default: DEFAULT,
      kind: DEFAULT,
      label: DEFAULT,
      readyState: DEFAULT,
      src: DEFAULT,
      srclang: DEFAULT,
      track: DEFAULT
    },
    HTMLVideoElement: {
      height: DEFAULT,
      poster: DEFAULT,
      videoHeight: DEFAULT,
      videoWidth: DEFAULT,
      width: DEFAULT
    },
    HTMLElement: {
      accessKey: DEFAULT,
      blur: FUNCTION,
      click: FUNCTION,
      contentEditable: DEFAULT,
      dataset: DEFAULT,
      dir: DEFAULT,
      draggable: DEFAULT,
      focus: FUNCTION,
      hidden: DEFAULT,
      innerText: DEFAULT,
      isContentEditable: DEFAULT,
      lang: DEFAULT,
      offsetHeight: DEFAULT,
      offsetLeft: DEFAULT,
      offsetParent: DEFAULT,
      offsetTop: DEFAULT,
      offsetWidth: DEFAULT,
      onabort: EVENT,
      onautocomplete: EVENT,
      onautocompleteerror: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncuechange: EVENT,
      ondblclick: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      outerText: DEFAULT,
      spellcheck: DEFAULT,
      style: DEFAULT,
      tabIndex: DEFAULT,
      title: DEFAULT,
      translate: DEFAULT,
      webkitdropzone: DEFAULT
    },
    SVGAngle: {
      unitType: DEFAULT,
      value: DEFAULT,
      valueInSpecifiedUnits: DEFAULT,
      valueAsString: DEFAULT,
      newValueSpecifiedUnits: FUNCTION,
      convertToSpecifiedUnits: FUNCTION
    },
    SVGAnimatedAngle: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedBoolean: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedEnumeration: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedInteger: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedLength: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedLengthList: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedNumber: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedNumberList: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedPreserveAspectRatio: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedRect: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedString: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimatedTransformList: {
      baseVal: DEFAULT,
      animVal: DEFAULT
    },
    SVGAnimationElement: {
      targetElement: SKIP_OPAQUE,
      getCurrentTime: FUNCTION,
      getSimpleDuration: FUNCTION
    },
    SVGCircleElement: {
      cx: DEFAULT,
      cy: DEFAULT,
      r: DEFAULT
    },
    SVGClipPathElement: {
      clipPathUnits: DEFAULT
    },
    SVGEllipseElement: {
      cx: DEFAULT,
      cy: DEFAULT,
      rx: DEFAULT,
      ry: DEFAULT
    },
    SVGFilterElement: {
      filterUnits: DEFAULT,
      primitiveUnits: DEFAULT,
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      filterResX: DEFAULT,
      fitlerResY: DEFAULT
    },
    SVGForeignObjectElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT
    },
    SVGGeometryElement: {
      pathLength: DEFAULT,
      isPointInFill: FUNCTION,
      isPointInStroke: FUNCTION,
      getTotalLength: FUNCTION,
      getPointAtLength: FUNCTION
    },
    SVGGradientElement: {
      gradientUnits: DEFAULT,
      gradientTransform: DEFAULT,
      spreadMethod: DEFAULT
    },
    SVGGraphicsElement: {
      transform: DEFAULT,
      getBBox: FUNCTION,
      getCTM: FUNCTION,
      getScreenCTM: FUNCTION
    },
    SVGImageElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      preserveAspectRatio: DEFAULT,
      crossOrigin: DEFAULT
    },
    SVGLength: {
      SVG_LENGTHTYPE_UNKNOWN: DEFAULT,
      SVG_LENGTHTYPE_NUMBER: DEFAULT,
      SVG_LENGTHTYPE_PERCENTAGE: DEFAULT,
      SVG_LENGTHTYPE_EMS: DEFAULT,
      SVG_LENGTHTYPE_EXS: DEFAULT,
      SVG_LENGTHTYPE_PX: DEFAULT,
      SVG_LENGTHTYPE_CM: DEFAULT,
      SVG_LENGTHTYPE_MM: DEFAULT,
      SVG_LENGTHTYPE_IN: DEFAULT,
      SVG_LENGTHTYPE_PT: DEFAULT,
      SVG_LENGTHTYPE_PC: DEFAULT,
      unitType: DEFAULT,
      value: DEFAULT,
      valueInSpecifiedUnits: DEFAULT,
      valueAsString: DEFAULT,
      newValueSpecifiedUnits: FUNCTION,
      convertToSpecifiedUnits: FUNCTION
    },
    SVGLengthList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION
    },
    SVGLineElement: {
      x1: DEFAULT,
      x2: DEFAULT,
      y1: DEFAULT,
      y2: DEFAULT
    },
    SVGLinearGradientElement: {
      x1: DEFAULT,
      x2: DEFAULT,
      y1: DEFAULT,
      y2: DEFAULT
    },
    SVGMaskElement: {
      maskUnits: DEFAULT,
      maskContentUnits: DEFAULT,
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT
    },
    SVGNumber: {
      value: DEFAULT
    },
    SVGNumberList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION
    },
    SVGPatternElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      patternUnits: DEFAULT,
      patternContentUnits: DEFAULT,
      patternTransform: DEFAULT
    },
    SVGPreserveAspectRatio: {
      align: DEFAULT,
      meetOrSlice: DEFAULT,
      SVG_PRESERVEASPECTRATIO_UNKNOWN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_NONE: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMINYMIN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMIDYMIN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMAXYMIN: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMINYMID: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMIDYMID: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMAXYMID: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMINYMAX: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMIDYMAX: DEFAULT,
      SVG_PRESERVEASPECTRATIO_XMAXYMAX: DEFAULT,
      SVG_MEETORSLICE_UNKNOWN: DEFAULT,
      SVG_MEETORSLICE_MEET: DEFAULT,
      SVG_MEETORSLICE_SLICE: DEFAULT
    },
    SVGRadialGradientElement: {
      cx: DEFAULT,
      cy: DEFAULT,
      r: DEFAULT,
      fx: DEFAULT,
      fy: DEFAULT
    },
    SVGRect: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT
    },
    SVGRectElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      rx: DEFAULT,
      ry: DEFAULT
    },
    SVGScriptElement: {
      type: DEFAULT,
      crossOrigin: DEFAULT
    },
    SVGStopElement: {
      offset: DEFAULT
    },
    SVGStringList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION
    },
    SVGStyleElement: {
      type: DEFAULT,
      media: DEFAULT,
      title: DEFAULT
    },
    SVGSVGElement: {
      animationsPaused: FUNCTION,
      checkIntersection: FUNCTION,
      checkEnclosure: FUNCTION,
      contentScriptType: DEFAULT,
      contentStyleType: DEFAULT,
      createSVGAngle: FUNCTION,
      createSVGLength: FUNCTION,
      createSVGMatrix: FUNCTION,
      createSVGNumber: FUNCTION,
      createSVGPoint: FUNCTION,
      createSVGRect: FUNCTION,
      createSVGTransform: FUNCTION,
      createSVGTransformFromMatrix: FUNCTION,
      currentScale: DEFAULT,
      currentTranslate: DEFAULT,
      currentView: DEFAULT,
      forceRedraw: FUNCTION,
      height: DEFAULT,
      pauseAnimations: FUNCTION,
      pixelUnitToMillimeterX: DEFAULT,
      pixelUnitToMillimeterY: DEFAULT,
      getCurrentTime: FUNCTION,
      getEnclosureList: FUNCTION,
      getElementById: FUNCTION,
      getIntersectionList: FUNCTION,
      screenPixelToMillimeterX: DEFAULT,
      screenPixelToMillimeterY: DEFAULT,
      setCurrentTime: FUNCTION,
      suspendRedraw: FUNCTION,
      unpauseAnimations: FUNCTION,
      unsuspendRedraw: FUNCTION,
      unsuspendRedrawAll: FUNCTION,
      useCurrentView: DEFAULT,
      viewport: DEFAULT,
      width: DEFAULT,
      x: DEFAULT,
      y: DEFAULT
    },
    SVGTextContentElement: {
      LENGTHADJUST_UNKNOWN: DEFAULT,
      LENGTHADJUST_SPACING: DEFAULT,
      LENGTHADJUST_SPACINGANDGLYPHS: DEFAULT,
      textLength: DEFAULT,
      lengthAdjust: DEFAULT,
      getNumberOfChars: FUNCTION,
      getComputedTextLength: FUNCTION,
      getSubStringLength: FUNCTION,
      getStartPositionOfChar: FUNCTION,
      getEndPositionOfChar: FUNCTION,
      getExtentOfChar: FUNCTION,
      getRotationOfChar: FUNCTION,
      getCharNumAtPosition: FUNCTION
    },
    SVGTextPositioningElement: {
      x: DEFAULT,
      y: DEFAULT,
      dx: DEFAULT,
      dy: DEFAULT,
      rotate: DEFAULT
    },
    SVGTransform: {
      SVG_TRANSFORM_UNKNOWN: DEFAULT,
      SVG_TRANSFORM_MATRIX: DEFAULT,
      SVG_TRANSFORM_TRANSLATE: DEFAULT,
      SVG_TRANSFORM_SCALE: DEFAULT,
      SVG_TRANSFORM_ROTATE: DEFAULT,
      SVG_TRANSFORM_SKEWX: DEFAULT,
      SVG_TRANSFORM_SKEWY: DEFAULT,
      type: DEFAULT,
      angle: DEFAULT,
      matrix: DEFAULT,
      setMatrix: FUNCTION,
      setTranslate: FUNCTION,
      setScale: FUNCTION,
      setRotate: FUNCTION,
      setSkewX: FUNCTION,
      setSkewY: FUNCTION
    },
    SVGTransformList: {
      numberOfItem: DEFAULT,
      clear: FUNCTION,
      initialize: FUNCTION,
      getItem: SKIP_OPAQUE,
      insertItemBefore: FUNCTION,
      replaceItem: FUNCTION,
      removeItem: SKIP_OPAQUE,
      appendItem: FUNCTION,
      createSVGTransformFromMatrix: FUNCTION,
      consolidate: FUNCTION
    },
    SVGUseElement: {
      x: DEFAULT,
      y: DEFAULT,
      width: DEFAULT,
      height: DEFAULT,
      instanceRoot: DEFAULT,
      animatedInstanceRoot: DEFAULT
    },
    SVGViewElement: {
      viewTarget: DEFAULT
    },
    SVGElement: {
      blur: FUNCTION,
      focus: FUNCTION,
      getBBox: FUNCTION,
      ownerSVGElement: SKIP_OPAQUE,
      onabort: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncuechange: EVENT,
      ondblclick: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      style: DEFAULT,
      tabIndex: DEFAULT,
      viewportElement: SKIP_OPAQUE
    },
    Element: {
      animate: FUNCTION,
      attributes: DEFAULT,
      children: DEFAULT,
      classList: DEFAULT,
      className: DEFAULT,
      clientHeight: DEFAULT,
      clientLeft: DEFAULT,
      clientTop: DEFAULT,
      clientWidth: DEFAULT,
      closest: FUNCTION,
      getAttribute: FUNCTION,
      getAttributeNS: FUNCTION,
      getAttributeNode: FUNCTION,
      getAttributeNodeNS: FUNCTION,
      getBoundingClientRect: FUNCTION,
      getClientRects: FUNCTION,
      getDestinationInsertionPoints: FUNCTION,
      getElementsByClassName: FUNCTION,
      getElementsByTagName: FUNCTION,
      getElementsByTagNameNS: FUNCTION,
      hasAttribute: FUNCTION,
      hasAttributeNS: FUNCTION,
      hasAttributes: FUNCTION,
      id: DEFAULT,
      innerHTML: DEFAULT,
      insertAdjacentElement: FUNCTION,
      insertAdjacentHTML: FUNCTION,
      insertAdjacentText: FUNCTION,
      localName: DEFAULT,
      matches: FUNCTION,
      namespaceURI: DEFAULT,
      nextElementSibling: SKIP_OPAQUE,
      onbeforecopy: EVENT,
      onbeforecut: EVENT,
      onbeforepaste: EVENT,
      oncopy: EVENT,
      oncut: EVENT,
      onpaste: EVENT,
      onsearch: EVENT,
      onselectstart: EVENT,
      onwebkitfullscreenchange: EVENT,
      onwebkitfullscreenerror: EVENT,
      onwheel: EVENT,
      outerHTML: DEFAULT,
      prefix: DEFAULT,
      previousElementSibling: SKIP_OPAQUE,
      querySelector: FUNCTION,
      querySelectorAll: FUNCTION,
      remove: FUNCTION,
      removeAttribute: FUNCTION,
      removeAttributeNS: FUNCTION,
      removeAttributeNode: FUNCTION,
      requestPointerLock: FUNCTION,
      scrollHeight: DEFAULT,
      scrollIntoView: FUNCTION,
      scrollIntoViewIfNeeded: FUNCTION,
      scrollLeft: DEFAULT,
      scrollTop: DEFAULT,
      scrollWidth: DEFAULT,
      setAttribute: FUNCTION,
      setAttributeNS: FUNCTION,
      setAttributeNode: FUNCTION,
      setAttributeNodeNS: FUNCTION,
      tagName: DEFAULT
    },
    CharacterData: {
      after: FUNCTION,
      appendData: FUNCTION,
      before: FUNCTION,
      data: DEFAULT,
      deleteData: FUNCTION,
      insertData: FUNCTION,
      length: DEFAULT,
      nextElementSibling: SKIP_OPAQUE,
      previousElementSibling: SKIP_OPAQUE,
      remove: FUNCTION,
      replaceData: FUNCTION,
      replaceWith: FUNCTION,
      substringData: FUNCTION
    },
    Text: {
      assignedSlot: DEFAULT,
      isElementContentWhitespace: DEFAULT,
      replaceWholeText: FUNCTION,
      splitText: FUNCTION,
      wholeText: DEFAULT
    },
    Attr: {
      name: DEFAULT,
      namespaceURI: DEFAULT,
      localName: DEFAULT,
      prefix: DEFAULT,
      ownerElement: DEFAULT,
      specified: DEFAULT,
      value: DEFAULT
    },
    Node: metadata$3,
    EventTarget: metadata$4
  }
};

function cloneFiltered(el, st) {
  const root = el.cloneNode(false);
  function cloneChildren(parent, parentClone) {
    const childNodes = parent.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];
      if (hasAccess(st, child) || child.nodeType === Node.TEXT_NODE) {
        const childClone = child.cloneNode(false);
        parentClone.appendChild(childClone);
        trust$1(st, childClone);
        cloneChildren(child, childClone);
      }
    }
  }
  cloneChildren(el, root);
  return root;
}

function runIfRunnable(st) {
  const shouldRun = st instanceof HTMLScriptElement || st instanceof SVGScriptElement;
  if (shouldRun) {
    SecureScriptElement.run(st);
    return true;
  }
  return false;
}

function trustChildNodesRecursive(node, key) {
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    setKey(child, key);
    trustChildNodesRecursive(child, key);
  }
}

function trustChildNodes(from, node) {
  const key = getKey(from);
  if (key) {
    trustChildNodesRecursive(node, key);
  }
}

const KEY_TO_PROTOTYPES = typeof Map !== 'undefined' ? new Map() : undefined;

function propertyIsSupported(target, property) {
  // If the SecureElement prototype does not have the property directly on it then this
  // is an attempt to get a property that we do not support
  return Object.getPrototypeOf(target).hasOwnProperty(property);
}

function SecureElement(el, key) {
  let o = getFromCache(el, key);
  if (o) {
    return o;
  }

  // A secure element can have multiple forms, this block allows us to apply
  // some polymorphic behavior to SecureElement depending on the tagName
  let tagName = el.tagName && el.tagName.toUpperCase();
  switch (tagName) {
    case 'FRAME':
      throw new error('The deprecated FRAME element is not supported in LockerService!');
    default:
      break;
  }

  // SecureElement is it then!

  // Lazily create and cache tag name specific prototype
  switch (el.nodeType) {
    case Node.TEXT_NODE:
      tagName = '#text';
      break;

    case Node.DOCUMENT_FRAGMENT_NODE:
      tagName = '#fragment';
      break;

    case Node.ATTRIBUTE_NODE:
      tagName = 'Attr';
      break;

    case Node.COMMENT_NODE:
      tagName = '#comment';
      break;

    default:
      break;
  }

  // Segregate prototypes by their locker
  let prototypes = KEY_TO_PROTOTYPES.get(key);
  if (!prototypes) {
    prototypes = new Map();
    KEY_TO_PROTOTYPES.set(key, prototypes);
  }

  let prototypeInfo = prototypes.get(tagName);
  if (!prototypeInfo) {
    const basePrototype = Object.getPrototypeOf(el);

    const expandoCapturingHandler = {
      get: function(target, property) {
        // Relaxing a bit because custom elements have public properties defined on the element
        if (property in basePrototype || property in target) {
          return property in target ? target[property] : undefined;
        }

        // Expando - retrieve it from a private locker scoped object
        const raw = getRef(target, key);
        const data = getData(raw, key);
        return data ? data[property] : undefined;
      },

      set: function(target, property, value) {
        if (property in basePrototype) {
          if (!propertyIsSupported(target, property)) {
            warn(`SecureElement does not allow access to ${property}`);
            // setters on proxy trap must return true or throw
            return true;
          }

          target[property] = value;
          return true;
        }

        // Expando - store it from a private locker scoped object
        const raw = getRef(target, key);

        // SELECT elements allow options to be specified in array assignment style
        if (raw instanceof HTMLSelectElement && !Number.isNaN(Number(property))) {
          const rawOption = getRef(value, key);
          raw[property] = rawOption;
          return value;
        }

        let data = getData(raw, key);
        if (!data) {
          data = {};
          setData(raw, key, data);
        }

        data[property] = value;
        return true;
      },

      has: function(target, property) {
        if (property in basePrototype) {
          return true;
        }
        const raw = getRef(target, key);
        const data = getData(raw, key);
        return !!data && property in data;
      },

      deleteProperty: function(target, property) {
        const raw = getRef(target, key);
        const data = getData(raw, key);
        if (data && property in data) {
          return delete data[property];
        }
        return delete target[property];
      },

      ownKeys: function(target) {
        const raw = getRef(target, key);
        const data = getData(raw, key);
        let keys = Object.keys(raw);
        if (data) {
          keys = keys.concat(Object.keys(data));
        }
        return keys;
      },

      getOwnPropertyDescriptor: function(target, property) {
        let desc = getOwnPropertyDescriptor(target, property);
        if (!desc) {
          const raw = getRef(target, key);
          const data = getData(raw, key);
          desc = data ? getOwnPropertyDescriptor(data, property) : undefined;
        }
        return desc;
      },

      getPrototypeOf: function() {
        if (shouldFreeze && !isFrozen(basePrototype)) {
          deepFreeze(basePrototype);
        }
        return basePrototype;
      },

      setPrototypeOf: function() {
        throw new Error(`Illegal attempt to set the prototype of: ${basePrototype}`);
      }
    };

    // "class", "id", etc global attributes are special because they do not directly correspond to any property
    const caseInsensitiveAttributes = {
      class: true,
      contextmenu: true,
      dropzone: true,
      id: true,
      role: true
    };

    const prototype = (function() {
      function SecureElementPrototype() {}
      SecureElementPrototype.prototype['tagName'] = tagName;

      const sep = new SecureElementPrototype();
      sep.constructor = function() {
        throw new TypeError('Illegal constructor');
      };
      return sep;
    })();

    // Allow React to register spies on input nodes
    // See inputValueTracking.js
    // https://github.com/facebook/react/blob/master/packages/react-dom/src/client/inputValueTracking.js
    ['checked', 'value'].forEach(prop => {
      const descriptor = getOwnPropertyDescriptor(el.constructor.prototype, prop);
      if (descriptor) {
        defineProperty(prototype.constructor.prototype, prop, {
          configurable: descriptor.configurable,
          enumerable: true,
          get: function() {
            const rawEl = SecureObject.getRaw(this);
            return SecureObject.filterEverything(this, rawEl[prop]);
          },
          set: function(value) {
            const rawEl = SecureObject.getRaw(this);
            rawEl[prop] = SecureObject.filterEverything(this, value);
          }
        });
      }
    });

    SecureElement.addStandardMethodAndPropertyOverrides(prototype, caseInsensitiveAttributes, key);

    defineProperties(prototype, {
      toString: {
        value: function() {
          const e = SecureObject.getRaw(this);
          return `SecureElement: ${e}{ key: ${JSON.stringify(getKey(this))} }`;
        }
      }
    });

    const prototypicalInstance = create$1(prototype);
    setRef(prototypicalInstance, el, key);

    if (tagName === 'IFRAME') {
      SecureIFrameElement.addMethodsAndProperties(prototype);
    }

    const tagNameSpecificConfig = SecureObject.addPrototypeMethodsAndPropertiesStateless(
      metadata$2,
      prototypicalInstance,
      prototype
    );

    // Conditionally add things that not all Node types support
    if ('attributes' in el) {
      tagNameSpecificConfig['attributes'] = SecureObject.createFilteredPropertyStateless(
        'attributes',
        prototype,
        {
          writable: false,
          afterGetCallback: function(attributes) {
            if (!attributes) {
              return attributes;
            }

            return SecureObject.createProxyForNamedNodeMap(
              attributes,
              key,
              prototype,
              caseInsensitiveAttributes
            );
          }
        }
      );
    }

    if ('innerText' in el) {
      tagNameSpecificConfig['innerText'] = {
        get: function() {
          /*
           * innerText changes it's return value based on style and whether the element is live in
           * the DOM or not. This implementation does not account for that and simply returns the
           * innerText of the cloned node. This may cause subtle differences, such as missing newlines,
           * from the original implementation.
           *
           * https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent#Differences_from_innerText
           */
          const rawEl = SecureObject.getRaw(this);
          const filtered = cloneFiltered(rawEl, o);
          const ret = filtered.innerText;
          return ret;
        },
        set: function(value) {
          const raw = SecureObject.getRaw(this);
          if (SecureElement.isSharedElement(raw)) {
            throw new error(
              `SecureElement.innerText cannot be used with ${raw.tagName} elements!`
            );
          }

          raw.innerText = value;

          trustChildNodes(this, raw);
        }
      };
    }

    if ('innerHTML' in el) {
      tagNameSpecificConfig['innerHTML'] = {
        get: function() {
          return cloneFiltered(SecureObject.getRaw(this), o).innerHTML;
        },
        set: function(value) {
          const raw = SecureObject.getRaw(this);
          // Do not allow innerHTML on shared elements (body/head)
          if (SecureElement.isSharedElement(raw)) {
            throw new error(
              `SecureElement.innerHTML cannot be used with ${raw.tagName} elements!`
            );
          }
          raw.innerHTML = DOMPurify['sanitize'](value, domPurifyConfig);
          trustChildNodes(this, raw);
        }
      };
    }

    // Reason: [W-3564204] Web Components HTML imports only supported in Chrome.
    // TODO: Implement SecureLinkElement when it is more standardized across browsers.
    if (tagName === 'LINK' && 'rel' in el) {
      tagNameSpecificConfig['rel'] = {
        get: function() {
          const raw = SecureObject.getRaw(this);
          return raw.rel;
        },
        set: function(value) {
          value = String(value);
          if (REGEX_CONTAINS_IMPORT.test(value)) {
            warn(
              "SecureLinkElement does not allow setting 'rel' property to 'import' value."
            );
          } else {
            const raw = SecureObject.getRaw(this);
            raw.rel = value;
          }
        }
      };
    }

    // special handling for Text.splitText() instead of creating a new secure wrapper
    if (tagName === '#text' && 'splitText' in el) {
      tagNameSpecificConfig['splitText'] = {
        value: function(index) {
          const raw = SecureObject.getRaw(this);
          const newNode = raw.splitText(index);

          const fromKey = getKey(raw);
          if (fromKey) {
            setKey(newNode, fromKey);
          }

          return SecureElement(newNode, getKey(this));
        }
      };
    }
    if ('outerHTML' in el) {
      tagNameSpecificConfig['outerHTML'] = {
        get: function() {
          return cloneFiltered(SecureObject.getRaw(this), o).outerHTML;
        },
        set: function(value) {
          const raw = SecureObject.getRaw(this);
          // Do not allow on shared elements (body/head)
          if (SecureElement.isSharedElement(raw)) {
            throw new error(
              `SecureElement.outerHTML cannot be used with ${raw.tagName} elements!`
            );
          }

          const parent = raw.parentElement;

          // As per specifications, throw when there is no parent
          if (!parent) {
            throw new DOMException(
              `Failed to set the 'outerHTML' property on ${
                raw.tagName
              }: This element has no parent node.`
            );
          }

          // Setting outerHTML on an element removes it from the document tree.
          // It returns no handle to trust the new elements. Here we create the
          // elements in a fragment then insert them in their proper location.

          const frag = document
            .createRange()
            .createContextualFragment(DOMPurify['sanitize'](value, domPurifyConfig));
          trustChildNodes(this, frag);
          while (frag.childNodes.length > 0) {
            const node = frag.childNodes[0];
            parent.insertBefore(node, raw);
          }
          parent.removeChild(raw);
        }
      };
    }

    // special handling for Text.splitText() instead of creating a new secure wrapper
    if (tagName === '#text' && 'splitText' in el) {
      tagNameSpecificConfig['splitText'] = {
        value: function(index) {
          const raw = SecureObject.getRaw(this);
          const newNode = raw.splitText(index);

          const fromKey = getKey(raw);
          if (fromKey) {
            setKey(newNode, fromKey);
          }

          return SecureElement(newNode, getKey(this));
        }
      };
    }

    // special handle insertRow since it may automatically also insert a <tbody> element that
    // also needs to be keyed.
    if ('insertRow' in el && el instanceof HTMLTableElement) {
      tagNameSpecificConfig['insertRow'] = {
        value: function(index) {
          function getFirstTBody(table) {
            for (let i = 0; i < table.childNodes.length; i++) {
              const node = table.childNodes[i];
              if (node instanceof HTMLTableSectionElement) {
                return node;
              }
            }
            return undefined;
          }

          const raw = SecureObject.getRaw(this);
          const tbodyExists = !!getFirstTBody(raw);
          const newRow = raw.insertRow(index);
          trust$1(this, newRow);
          if (!tbodyExists) {
            // a new tbody element has also been inserted, key that too.
            const tbody = getFirstTBody(raw);
            trust$1(this, tbody);
          }
          return SecureElement(newRow, getKey(this));
        }
      };
    }

    createEventTargetMethodsStateless(tagNameSpecificConfig, prototype);

    if (tagName === 'SCRIPT') {
      SecureScriptElement.setOverrides(tagNameSpecificConfig, prototype);
    }

    // Custom Element with properties
    if (customElementHook) {
      customElementHook(el, prototype, tagNameSpecificConfig, key);
    }

    defineProperties(prototype, tagNameSpecificConfig);

    // Build case insensitive index for attribute validation
    Object.keys(prototype).forEach(k => {
      const lower = k.toLowerCase();
      if (lower !== k) {
        caseInsensitiveAttributes[lower] = true;
      }
    });

    prototypeInfo = {
      prototype: prototype,
      expandoCapturingHandler: expandoCapturingHandler
    };

    prototypes.set(tagName, prototypeInfo);
  }

  /*
   * Additional checks for <object> and <embed> tag, restrict access to browser navigation and
   * browser interaction APIs
   * https://help.adobe.com/en_US/ActionScript/3.0_ProgrammingAS3/WS1EFE2EDA-026D-4d14-864E-79DFD56F87C6.html#WS5b3ccc516d4fbf351e63e3d118a9b90204-7c5b
   */
  if (tagName === 'OBJECT' || tagName === 'EMBED') {
    el.setAttribute('allowNetworking', 'none');
  }

  o = create$1(prototypeInfo.prototype);

  if (prototypeInfo.expandoCapturingHandler) {
    setRef(o, el, key);
    o = new Proxy(o, prototypeInfo.expandoCapturingHandler);
  }

  setRef(o, el, key);
  addToCache(el, o, key);
  registerProxy(o);
  // Mark the proxy to be unwrapped by custom formatter
  assert$1.block(() => {
    addProxy(o, el);
  });
  return o;
}

SecureElement.isValidAttributeName = function(raw, name, prototype, caseInsensitiveAttributes) {
  if (typeof name !== 'string') {
    return false;
  }

  const lcName = name.toLowerCase();
  const tagName = raw.tagName && raw.tagName.toUpperCase();

  // Reason: [W-4210397] Locker does not allow setting custom HTTP headers.
  if (tagName === 'META' && lcName === 'http-equiv') {
    return false;
  }

  // Always allow names with the form a-b.* (e.g. data-foo, x-foo, ng-repeat, etc)
  if (name.indexOf('-') >= 0) {
    return true;
  }

  if (name in caseInsensitiveAttributes) {
    return true;
  }

  if (raw instanceof SVGElement) {
    // Reason: [W-4552994] Window access via svg use element
    if (tagName === 'USE' && ['href', 'xlink:href'].includes(lcName)) {
      return false;
    }
    return true;
  }

  if (name in prototype) {
    return true;
  }

  // Special case Label element's 'for' attribute. It called 'htmlFor' on prototype but
  // needs to be addressable as 'for' via accessors like .attributes/getAttribute()/setAtribute()
  if (tagName === 'LABEL' && lcName === 'for') {
    return true;
  }

  // Special case Meta element's custom 'property' attribute. It used by the Open Graph protocol.
  if (tagName === 'META' && lcName === 'property') {
    return true;
  }

  return false;
};

SecureElement.addStandardMethodAndPropertyOverrides = function(
  prototype,
  caseInsensitiveAttributes,
  key
) {
  defineProperties(prototype, {
    appendChild: {
      writable: true,
      value: function(child) {
        if (!runIfRunnable(child)) {
          const e = SecureObject.getRaw(this);
          e.appendChild(getRef(child, getKey(this), true));
        }

        return child;
      }
    },

    replaceChild: {
      writable: true,
      value: function(newChild, oldChild) {
        if (!runIfRunnable(newChild)) {
          const e = SecureObject.getRaw(this);
          const k = getKey(this);
          e.replaceChild(getRef(newChild, k, true), getRef(oldChild, k, true));
        }

        return oldChild;
      }
    },

    insertBefore: {
      writable: true,
      value: function(newNode, referenceNode) {
        if (!runIfRunnable(newNode)) {
          const e = SecureObject.getRaw(this);
          const k = getKey(this);
          e.insertBefore(
            getRef(newNode, k, true),
            referenceNode ? getRef(referenceNode, k, true) : null
          );
        }

        return newNode;
      }
    },

    querySelector: {
      writable: true,
      value: function(selector) {
        const raw = SecureObject.getRaw(this);
        return SecureElement.secureQuerySelector(raw, getKey(this), selector);
      }
    },

    insertAdjacentHTML: {
      writable: true,
      value: function(position, text) {
        const raw = SecureObject.getRaw(this);

        // Do not allow insertAdjacentHTML on shared elements (body/head)
        if (SecureElement.isSharedElement(raw)) {
          throw new error(
            `SecureElement.insertAdjacentHTML cannot be used with ${raw.tagName} elements!`
          );
        }

        let parent;
        if (position === 'afterbegin' || position === 'beforeend') {
          // We have access to el, nothing else to check.
        } else if (position === 'beforebegin' || position === 'afterend') {
          // Prevent writing outside secure node.
          parent = raw.parentNode;
          verifyAccess(this, parent, true);
        } else {
          throw new error(
            "SecureElement.insertAdjacentHTML requires position 'beforeBegin', 'afterBegin', 'beforeEnd', or 'afterEnd'."
          );
        }

        raw.insertAdjacentHTML(position, DOMPurify['sanitize'](text, domPurifyConfig));

        trustChildNodes(this, parent || raw);
      }
    },

    removeChild: SecureObject.createFilteredMethodStateless('removeChild', prototype, {
      rawArguments: true,
      beforeCallback: function(child) {
        // Verify that the passed in child is not opaque!
        verifyAccess(this, child, true);
      }
    }),

    cloneNode: {
      writable: true,
      value: function(deep) {
        function copyKeys(from, to) {
          // Copy keys from the original to the cloned tree
          const fromKey = getKey(from);
          if (fromKey) {
            setKey(to, fromKey);
          }

          const toChildren = to.childNodes;
          const length = toChildren.length;
          if (length > 0) {
            const fromChildren = from.childNodes;
            for (let i = 0; i < length; i++) {
              copyKeys(fromChildren[i], toChildren[i]);
            }
          }
        }

        const e = SecureObject.getRaw(this);
        const root = e.cloneNode(deep);

        // Maintain the same ownership in the cloned subtree
        copyKeys(e, root);

        return SecureElement(root, getKey(this));
      }
    },

    textContent: {
      get: function() {
        return cloneFiltered(SecureObject.getRaw(this), this).textContent;
      },
      set: function(value) {
        const raw = SecureObject.getRaw(this);
        if (SecureElement.isSharedElement(raw)) {
          throw new error(
            `SecureElement.textContent cannot be used with ${raw.tagName} elements!`
          );
        }

        raw.textContent = value;

        trustChildNodes(this, raw);
      }
    },

    hasChildNodes: {
      value: function() {
        const raw = SecureObject.getRaw(this);
        // If this is a shared element, delegate the call to the shared element, no need to check for access
        if (SecureElement.isSharedElement(raw)) {
          return raw.hasChildNodes();
        }
        const childNodes = raw.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
          if (hasAccess(this, childNodes[i])) {
            return true;
          }
        }
        return false;
      }
    },

    getAttribute: SecureElement.createAttributeAccessMethodConfig(
      'getAttribute',
      prototype,
      caseInsensitiveAttributes,
      null,
      undefined,
      undefined,
      key
    ),
    getAttributeNS: SecureElement.createAttributeAccessMethodConfig(
      'getAttributeNS',
      prototype,
      caseInsensitiveAttributes,
      null,
      true,
      undefined,
      key
    ),
    getAttributeNode: SecureElement.createAttributeAccessMethodConfig(
      'getAttributeNode',
      prototype,
      caseInsensitiveAttributes,
      null,
      undefined,
      undefined,
      key
    ),
    getAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig(
      'getAttributeNodeNS',
      prototype,
      caseInsensitiveAttributes,
      null,
      true,
      undefined,
      key
    ),

    setAttribute: SecureElement.createAttributeAccessMethodConfig(
      'setAttribute',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      undefined,
      undefined,
      key
    ),
    setAttributeNS: SecureElement.createAttributeAccessMethodConfig(
      'setAttributeNS',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      true,
      undefined,
      key
    ),
    setAttributeNode: SecureElement.createAttributeAccessMethodConfig(
      'setAttributeNode',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      undefined,
      'name',
      key
    ),
    setAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig(
      'setAttributeNodeNS',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      true,
      'name',
      key
    ),

    removeAttributeNode: SecureElement.createAttributeAccessMethodConfig(
      'removeAttributeNode',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      undefined,
      'name',
      key
    ),
    removeAttributeNodeNS: SecureElement.createAttributeAccessMethodConfig(
      'removeAttributeNodeNS',
      prototype,
      caseInsensitiveAttributes,
      undefined,
      true,
      'name',
      key
    )
  });
};

/* SecureElement.validateURLScheme = function(value) {
  const url = sanitizeURLForElement(value);

  if (!isValidURLScheme(url)) {
    throw new report.error(
      'An unsupported URL scheme was detected. Only http:// and https:// are supported.'
    );
  }

  return url;
}; */

SecureElement.createAttributeAccessMethodConfig = function(
  methodName,
  prototype,
  caseInsensitiveAttributes,
  invalidAttributeReturnValue,
  namespaced,
  nameProp,
  key
) {
  return {
    writable: true,
    value: function() {
      const raw = SecureObject.getRaw(this);
      let args = SecureObject.ArrayPrototypeSlice.call(arguments);

      let name = args[namespaced ? 1 : 0];
      if (nameProp) {
        name = name[nameProp];
      }
      if (!SecureElement.isValidAttributeName(raw, name, prototype, caseInsensitiveAttributes)) {
        warn(`${this} does not allow getting/setting the ${name} attribute, ignoring!`);
        return invalidAttributeReturnValue;
      }

      // args[0] is the attribute name. args[1] is the attribute value
      /* if (args[0] === 'href' || args[0] === 'src') {
        args[1] = SecureElement.validateURLScheme(args[1]);
      } */

      args = SecureObject.filterArguments(this, args, { rawArguments: true });
      const ret = raw[methodName].apply(raw, args);
      return ret instanceof Node ? SecureElement(ret, key) : ret;
    }
  };
};

SecureElement.isSharedElement = function(el) {
  return el === document.body || el === document.head || el === document.documentElement;
};

SecureElement.secureQuerySelector = function(el, key, selector) {
  const rawAll = el.querySelectorAll(selector);
  for (let n = 0; n < rawAll.length; n++) {
    const raw = rawAll[n];
    const rawKey = getKey(raw);
    if (rawKey === key || SecureElement.isSharedElement(raw)) {
      return SecureElement(raw, key);
    }
  }

  return null;
};

const sanitized = new WeakSet();

function freezeIntrinsics(realmRec) {
  const intrinsics = getIntrinsics(realmRec);
  deepFreeze(intrinsics);
}

function freezeIntrinsicsDeprecated(realmRec) {
  const { unsafeGlobal } = realmRec;
  seal(unsafeGlobal.Object.prototype);
}

// locking down the environment
function sanitize(realmRec) {
  if (sanitized.has(realmRec)) {
    return;
  }

  if (realmRec.shouldFreeze) {
    // Temporary until SecureWindow is refactored
    const { prototypes: { Window } } = metadata$$1;
    const names = [];
    for (const name in Window) {
      if (Window[name] === RAW) {
        names.push(name);
      }
    }
    setUnfrozenSet(names);

    // Temporary until SecureElement is refactored
    setElementRealm(realmRec);
  } else {
    freezeIntrinsicsDeprecated(realmRec);
  }

  sanitized.add(realmRec);
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const keyToSandbox = new Map();

function createSandbox(key, realmRec) {
  // Lazy sanitize the execution environment.
  sanitize(realmRec);

  const sandbox = { realmRec };

  /**
   * The sequencing of the following operations is curcial. We
   * need "Function" available on global when we create "eval"
   * in order for the constant to link to it.
   * 1. We create the global, minus "eval" and "Function".
   * 2. We create "Function" and expose it on the global.
   * 3. We create "eval" and expose it on the global.
   */
  sandbox.globalObject = SecureWindow(sandbox, key);

  sandbox.FunctionEvaluator = createFunctionEvaluator(sandbox);
  defineProperty(sandbox.globalObject, 'Function', {
    value: sandbox.FunctionEvaluator
  });

  // The "eval" property needs to be configurable to comply with the
  // Proxy invariants.
  sandbox.evalEvaluator = createEvalEvaluator(sandbox);
  defineProperty(sandbox.globalObject, 'eval', {
    value: sandbox.evalEvaluator,
    configurable: true
  });

  return freeze(sandbox);
}

function getSandbox(key, realmRec) {
  let sandbox = keyToSandbox.get(key);

  if (!sandbox) {
    sandbox = createSandbox(key, realmRec);
    keyToSandbox.set(key, sandbox);
  }

  return sandbox;
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

function repairAccessors(realmRec) {
  const { unsafeGlobal } = realmRec;

  // W-2961201 Prevent execution in the global context.

  // Fixing properties of Object to comply with strict mode
  // and ES2016 semantics, we do this by redefining them while in 'use strict'
  // https://tc39.github.io/ecma262/#sec-object.prototype.__defineGetter__
  defineProperties(unsafeGlobal.Object.prototype, {
    __defineGetter__: {
      value: function(prop, func) {
        return defineProperty(this, prop, {
          get: func,
          enumerable: true,
          configurable: true
        });
      }
    },
    __defineSetter__: {
      value: function(prop, func) {
        return defineProperty(this, prop, {
          set: func,
          enumerable: true,
          configurable: true
        });
      }
    },
    __lookupGetter__: {
      value: function(prop) {
        let base = this;
        let desc;
        while (base && !(desc = getOwnPropertyDescriptor(base, prop))) {
          base = getPrototypeOf(base);
        }
        return desc && desc.get;
      }
    },
    __lookupSetter__: {
      value: function(prop) {
        let base = this;
        let desc;
        while (base && !(desc = getOwnPropertyDescriptor(base, prop))) {
          base = getPrototypeOf(base);
        }
        return desc && desc.set;
      }
    }
  });
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Adapted from SES/Caja
// Copyright (C) 2011 Google Inc.
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/startSES.js
// https://github.com/google/caja/blob/master/src/com/google/caja/ses/repairES5.js

/**
 * The process to repair constructors:
 * 1. Obtain the prototype from an instance
 * 2. Create a substitute noop constructor
 * 3. Replace its prototype property with the original prototype
 * 4. Replace its prototype property's constructor with itself
 * 5. Replace its [[Prototype]] slot with the noop constructor of Function
 */
function repairFunction(realmRec, functionName, functionDecl) {
  const { unsafeGlobal, unsafeEval, unsafeFunction } = realmRec;

  const FunctionInstance = unsafeEval(`(${functionDecl}(){})`);
  const FunctionPrototype = getPrototypeOf(FunctionInstance);

  const RealmFunction = unsafeFunction('return function(){}');

  defineProperties(RealmFunction, {
    name: {
      value: functionName
    },
    prototype: {
      value: FunctionPrototype
    }
  });
  defineProperty(FunctionPrototype, 'constructor', { value: RealmFunction });

  // Prevent loop in case of Function.
  if (RealmFunction !== unsafeGlobal.Function.prototype.constructor) {
    setPrototypeOf(RealmFunction, unsafeGlobal.Function.prototype.constructor);
  }
}

/**
 * This block replaces the original Function constructor, and the original
 * %GeneratorFunction% %AsyncFunction% and %AsyncGeneratorFunction%, with
 * safe replacements that preserve SES confinement. After this block is done,
 * the originals should no longer be reachable.
 */
function repairFunctions(realmRec) {
  const { unsafeGlobal } = realmRec;
  const hasAsyncIteration = typeof unsafeGlobal.Symbol.asyncIterator !== 'undefined';

  // Here, the order of operation is important: Function needs to be
  // repaired first since the other constructors need it.
  repairFunction(realmRec, 'Function', 'function');
  repairFunction(realmRec, 'GeneratorFunction', 'function*');
  repairFunction(realmRec, 'AsyncFunction', 'async function');
  if (hasAsyncIteration) {
    repairFunction(realmRec, 'AsyncGeneratorFunction', 'async function*');
  }
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * For a special set of properties (defined below), it ensures that the
 * effect of freezing does not suppress the ability to override these
 * properties on derived objects by simple assignment.
 *
 * Because of lack of sufficient foresight at the time, ES5 unfortunately
 * specified that a simple assignment to a non-existent property must fail if
 * it would override a non-writable data property of the same name. (In
 * retrospect, this was a mistake, but it is now too late and we must live
 * with the consequences.) As a result, simply freezing an object to make it
 * tamper proof has the unfortunate side effect of breaking previously correct
 * code that is considered to have followed JS best practices, if this
 * previous code used assignment to override.
 *
 * To work around this mistake, deepFreeze(), prior to freezing, needs to replace
 * selected configurable own data properties with accessor properties which
 * simulate what we should have specified -- that assignments to derived
 * objects succeed if otherwise possible.
 */

function tamperProof(obj, prop, desc) {
  if ('value' in desc && desc.configurable) {
    const value = desc.value;

    // eslint-disable-next-line no-inner-declarations
    function getter() {
      return value;
    }

    // Re-attach the data propery value to the object tree to make
    // it discoverable by the deep-freeze traversal algorithm.
    getter.value = value;

    // eslint-disable-next-line no-inner-declarations
    function setter(newValue) {
      if (obj === this) {
        const name = obj.constructor.name;
        throw new TypeError(`Cannot assign to read only property '${prop}' of object '${name}'`);
      }
      if (objectHasOwnProperty.call(this, prop)) {
        this[prop] = newValue;
      } else {
        defineProperty(this, prop, {
          value: newValue,
          writable: true,
          enumerable: desc.enumerable,
          configurable: desc.configurable
        });
      }
    }

    defineProperty(obj, prop, {
      get: getter,
      set: setter,
      enumerable: desc.enumerable,
      configurable: desc.configurable
    });
  }
}

function tamperProofAll(obj) {
  const descs = getOwnPropertyDescriptors(obj);
  for (const prop in descs) {
    const desc = descs[prop];
    tamperProof(obj, prop, desc);
  }
}

function tamperProofProp(obj, prop) {
  const desc = getOwnPropertyDescriptor(obj, prop);
  tamperProof(obj, prop, desc);
}

/**
 * These properties are subject to the override mistake.
 */
function repairDataProperties(realmRec) {
  const { unsafeGlobal: g } = realmRec;

  ['Object', 'Array', 'Function'].forEach(name => {
    tamperProofAll(g[name].prototype);
  });

  tamperProofProp(g.Error.prototype, 'message');
  tamperProofProp(g.EvalError.prototype, 'message');
  tamperProofProp(g.RangeError.prototype, 'message');
  tamperProofProp(g.ReferenceError.prototype, 'message');
  tamperProofProp(g.SyntaxError.prototype, 'message');
  tamperProofProp(g.TypeError.prototype, 'message');
  tamperProofProp(g.URIError.prototype, 'message');
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const realmRec = {};
let isInitialized = false;

function init(options) {
  if (isInitialized) {
    return;
  }

  // The frozen/unfrozen status of the Locker is set at creation.
  // Keep options.isFrozen until playground is updated.
  realmRec.shouldFreeze = options.shouldFreeze || options.isFrozen;

  /**
   * The unsafe* variables hold precious values that must not escape
   * to untrusted code. When eval is invoked via unsafeEval, this is
   * a call to the indirect eval function, not the direct eval operator.
   */
  realmRec.unsafeGlobal = options.unsafeGlobal;
  realmRec.unsafeEval = options.unsafeGlobal.eval;
  realmRec.unsafeFunction = options.unsafeGlobal.Function;

  // None of these values can change after initialization.
  freeze(realmRec);

  repairAccessors(realmRec);
  if (realmRec.shouldFreeze) {
    repairFunctions(realmRec);
    repairDataProperties(realmRec);
    freezeIntrinsics(realmRec);
  }

  isInitialized = true;
}

function getEnv$1(key) {
  const sandbox = getSandbox(key, realmRec);
  return sandbox.globalObject;
}

/**
 * Evaluates a string using secure eval rather than eval.
 * Sanitizes the input string and attaches a sourceURL so the
 * result can be easily found in browser debugging tools.
 */
function evaluate(src, key, sourceURL) {
  const sandbox = getSandbox(key, realmRec);

  // Sanitize the URL
  if (sourceURL) {
    sourceURL = sanitizeURLForElement(sourceURL);
    src += `\n//# sourceURL=${sourceURL}`;
  }

  return sandbox.evalEvaluator(src);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureDOMEvent(event, key) {
  assert$1.invariant(event, 'Wrapping an undefined event is prohibited.');
  let o = getFromCache(event, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureDOMEvent: ${event}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  const DOMEventSecureDescriptors = {
    // Events properties that are DOM Elements were compiled from
    // https://developer.mozilla.org/en-US/docs/Web/Events
    target: SecureObject.createFilteredProperty(o, event, 'target', SKIP_OPAQUE_ASCENDING),
    currentTarget: SecureObject.createFilteredProperty(o, event, 'currentTarget'),

    initEvent: SecureObject.createFilteredMethod(o, event, 'initEvent'),
    // Touch Events are special on their own:
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch
    touches: SecureDOMEvent.filterTouchesDescriptor(o, event, 'touches'),
    targetTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, 'targetTouches'),
    changedTouches: SecureDOMEvent.filterTouchesDescriptor(o, event, 'changedTouches'),

    view: {
      get: function() {
        const key = getKey(o);
        const swin = getEnv$1(key);
        const win = getRef(swin, key);
        return win === event.view ? swin : undefined;
      }
    }
  };

  ['preventDefault', 'stopImmediatePropagation', 'stopPropagation'].forEach(method =>
    SecureObject.addMethodIfSupported(o, event, method)
  );

  // non-standard properties and aliases
  ['relatedTarget', 'srcElement', 'explicitOriginalTarget', 'originalTarget'].forEach(property =>
    SecureObject.addPropertyIfSupported(o, event, property)
  );

  // For MessageEvent, special handling if the message is from a cross origin iframe
  if (event instanceof MessageEvent) {
    let xorigin = false;
    const eventSource = event.source;
    try {
      xorigin = !!(eventSource && eventSource.nodeType);
    } catch (e) {
      xorigin = true;
    }
    // If the MessageEvent object is from a different domain,
    // and accessing the nodeType property triggers an exception, then the source is a content window,
    // wrap the source in a SecureIFrameContentWindow
    if (xorigin) {
      defineProperty(o, 'source', {
        enumerable: true,
        value: SecureIFrameElement.SecureIFrameContentWindow(eventSource, key)
      });
    }
  }

  // re-exposing externals
  // TODO: we might need to include non-enumerables
  for (const name in event) {
    if (!(name in o)) {
      // every DOM event has a different shape, we apply filters when possible,
      // and bypass when no secure filter is found.
      defineProperty(
        o,
        name,
        DOMEventSecureDescriptors[name] || SecureObject.createFilteredProperty(o, event, name)
      );
    }
  }

  setRef(o, event, key);
  addToCache(event, o, key);
  registerProxy(o);

  return o;
}

SecureDOMEvent.filterTouchesDescriptor = function(se, event, propName) {
  let valueOverride;
  // descriptor to produce a new collection of touches where the target of each
  // touch is a secure element
  return {
    get: function() {
      if (valueOverride) {
        return valueOverride;
      }
      // perf hard-wired in case there is not a touches to wrap
      const touches = event[propName];
      if (!touches) {
        return touches;
      }
      // touches, of type ToucheList does not implement "map"
      return Array.prototype.map.call(touches, touch => {
        // touches is normally a big big collection of touch objects,
        // we do not want to pre-process them all, just create the getters
        // and process the accessor on the spot. e.g.:
        // https://developer.mozilla.org/en-US/docs/Web/Events/touchstart
        let keys = [];
        let touchShape = touch;
        // Walk up the prototype chain and gather all properties
        do {
          keys = keys.concat(Object.keys(touchShape));
        } while (
          (touchShape = Object.getPrototypeOf(touchShape)) &&
          touchShape !== Object.prototype
        );

        // Create a stub object with all the properties
        return keys.reduce(
          (o, p) =>
            defineProperty(o, p, {
              // all props in a touch object are readonly by spec:
              // https://developer.mozilla.org/en-US/docs/Web/API/Touch
              get: function() {
                return SecureObject.filterEverything(se, touch[p]);
              }
            }),
          {}
        );
      });
    },
    set: function(value) {
      valueOverride = value;
    }
  };
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let filterTypeHook$1;
function registerFilterTypeHook(hook) {
  filterTypeHook$1 = hook;
}
let isUnfilteredTypeHook$1;
function registerIsUnfilteredTypeHook(hook) {
  isUnfilteredTypeHook$1 = hook;
}

function SecureObject(thing, key) {
  let o = getFromCache(thing, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureObject: ${thing}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  setRef(o, thing, key, true);
  addToCache(thing, o, key);
  registerProxy(o);

  return seal(o);
}

const defaultSecureObjectKey = {
  defaultSecureObjectKey: true
};

SecureObject.getRaw = function getRaw(so) {
  const raw = getRef(so, getKey(so));

  if (!raw) {
    throw new Error('Blocked attempt to invoke secure method with altered this!');
  }

  return raw;
};

SecureObject.isDOMElementOrNode = function(el) {
  return (
    typeof el === 'object' &&
    ((typeof HTMLElement === 'object' && el instanceof HTMLElement) ||
      (typeof Node === 'object' && el instanceof Node) ||
      (typeof el.nodeType === 'number' && typeof el.nodeName === 'string'))
  );
};

/**
 * Filter the given raw object with the accessors key and provide a filtered view.
 * Best used when the type of "raw" is not known
 * @param st Represents the accessor who is trying to access "raw"
 * @param raw The raw object that we are trying to filter
 * @param options
 * @returns {*}
 */
SecureObject.filterEverything = function(st, raw, options) {
  if (!raw) {
    // ignoring falsy, nully references.
    return raw;
  }

  const t = typeof raw;

  const key = getKey(st);
  const cached = getFromCache(raw, key);
  if (cached) {
    return cached;
  }

  // Handle already proxied things
  const rawKey = getKey(raw);
  const belongsToLocker = rawKey === key;
  const defaultKey = options && options.defaultKey ? options.defaultKey : defaultSecureObjectKey;

  if (isProxy(raw)) {
    // - If !belongsToLocker then this is a jump from one locker to another - we just need to unwrap and then reproxy based on the target locker's perspective
    // otherwise just return the proxy (do not proxy a proxy).
    // - Bypass unwrapping and refiltering for SecureFunction so arguments and 'this' are filtered against the
    // Locker where the function was originally defined.
    return belongsToLocker || isSecureFunction(raw)
      ? raw
      : SecureObject.filterEverything(st, getRef(raw, rawKey), options);
  }

  let swallowed;
  let mutated = false;
  if (t === 'function') {
    // wrapping functions to guarantee that they run in system mode but their
    // returned value complies with user-mode.
    swallowed = function SecureFunction() {
      // special unfiltering logic to unwrap Proxies passed back to origin.
      // this could potentially be folded into filterArguments with an option set if needed.
      const filteredArgs = [];
      for (let i = 0; i < arguments.length; i++) {
        let arg = arguments[i];
        if (isFilteringProxy(arg)) {
          const unfilteredProxy = getRef(arg, getKey(arg));
          const unfilteredKey = getKey(unfilteredProxy);
          arg =
            unfilteredKey === getKey(raw)
              ? unfilteredProxy
              : SecureObject.filterEverything(st, arg);
        } else {
          arg = SecureObject.filterEverything(st, arg);
        }
        filteredArgs[i] = arg;
      }

      let self = SecureObject.filterEverything(st, this);
      if (isFilteringProxy(self) && getKey(self) === getKey(st)) {
        self = getRef(self, key);
      }

      const fnReturnedValue = raw.apply(self, filteredArgs);

      return SecureObject.filterEverything(st, fnReturnedValue, options);
    };

    mutated = true;
    setRef(swallowed, raw, key);

    if (!rawKey) {
      setKey(raw, defaultKey);
    }

    registerProxy(swallowed);
    registerSecureFunction(swallowed);
  } else if (t === 'object') {
    if (raw === window) {
      return getEnv$1(key);
    } else if (raw === document) {
      return getEnv$1(key).document;
    } else if (raw === window.location) {
      return getEnv$1(key).location;
    }

    const isNodeList = raw && (raw instanceof NodeList || raw instanceof HTMLCollection);
    if (isArray(raw)) {
      if (!belongsToLocker) {
        if (!rawKey) {
          // Array that was created in this locker or system mode but not yet keyed - key it now
          setKey(raw, defaultKey);
          return SecureObject.filterEverything(st, raw, options);
        }
        swallowed = SecureObject.createProxyForArrayObjects(raw, key);
        setRef(swallowed, raw, key);
        addToCache(raw, swallowed, key);
        mutated = true;
      }
    } else if (isNodeList) {
      swallowed = SecureObject.createProxyForArrayLikeObjects(raw, key);
      setRef(swallowed, raw, key);
      mutated = true;
    } else {
      assert(key, 'A secure object should always have a key.');
      if (filterTypeHook$1) {
        swallowed = filterTypeHook$1(raw, key, belongsToLocker);
      }
      if (swallowed) {
        mutated = raw !== swallowed;
      } else if (SecureObject.isDOMElementOrNode(raw)) {
        if (belongsToLocker || SecureElement.isSharedElement(raw)) {
          swallowed = SecureElement(raw, key);
        } else if (!options) {
          swallowed = SecureObject(raw, key);
        } else if (raw instanceof Attr && !rawKey) {
          setKey(raw, defaultKey);
          return SecureObject.filterEverything(st, raw, options);
        } else {
          swallowed = options.defaultValue;
          addToCache(raw, swallowed, key);
        }
        mutated = true;
      } else if (raw instanceof Event) {
        swallowed = SecureDOMEvent(raw, key);
        mutated = true;
      } else if (typeof raw['Window'] === 'function' && raw instanceof raw['Window']) {
        // Cross realm window instances (window.open() and iframe.contentWindow)
        swallowed = SecureIFrameElement.SecureIFrameContentWindow(raw, key);
        // TODO: Move these properties into SecureIFrameContentWindow class
        // so every instance gets the properties
        SecureObject.addMethodIfSupported(swallowed, raw, 'close');
        SecureObject.addMethodIfSupported(swallowed, raw, 'focus');
        SecureObject.addPropertyIfSupported(swallowed, raw, 'opener');
        SecureObject.addPropertyIfSupported(swallowed, raw, 'closed', { writable: false });

        mutated = true;
      } else if (raw instanceof CanvasRenderingContext2D) {
        swallowed = SecureCanvasRenderingContext2D(raw, key);
        mutated = true;
      } else if (SecureObject.isUnfilteredType(raw, key)) {
        // return raw for unfiltered types
        mutated = false;
      } else {
        if (!belongsToLocker) {
          if (!rawKey) {
            // Object that was created in this locker or in system mode and not yet keyed - key it now
            setKey(raw, defaultKey);
            return SecureObject.filterEverything(st, raw, options);
          }
          swallowed = SecureObject.createFilteringProxy(raw, key);
          addToCache(raw, swallowed, key);
          mutated = true;
        }
      }
    }
  }

  return mutated ? swallowed : raw;
};

SecureObject.filterArguments = function(st, args, options) {
  function getRaw(v) {
    if (isProxy(v)) {
      const key = getKey(v);
      const ref = getRef(v, key);
      v = ref;
    }

    return v;
  }

  function getRawArray(v) {
    const result = [];
    for (let i = 0; i < v.length; i++) {
      result.push(getRaw(v[i]));
    }
    return result;
  }

  args = SecureObject.ArrayPrototypeSlice.call(args);

  if (options && options.beforeCallback) {
    options.beforeCallback.apply(st, args);
  }
  if (options && options.unfilterEverything) {
    return options.unfilterEverything.call(st, args);
  }

  const rawArguments = options && options.rawArguments;
  for (let n = 0; n < args.length; n++) {
    const value = args[n];
    if (value) {
      if (rawArguments && typeof value === 'object') {
        args[n] = isArray(value) ? getRawArray(value) : getRaw(value);
      } else {
        args[n] = SecureObject.filterEverything(st, value, options);
      }
    }
  }

  return args;
};

function convertSymbol(property) {
  // Symbols have to be handled in some browsers
  if (typeof property === 'symbol') {
    if (property === Symbol['toStringTag']) {
      property = 'toString';
    } else {
      property = property.toString();
    }
  }

  return property;
}

const unfilteredConstructors = [Object, Array];

const filteringProxyHandler = (function() {
  function FilteringProxyHandler() {}

  FilteringProxyHandler.prototype['get'] = function(target, property) {
    const raw = getRef(target, getKey(target));
    const value = raw[property];

    if (!value) {
      return value;
    }

    if (property === 'constructor' && unfilteredConstructors.includes(value)) {
      return value;
    }

    return SecureObject.filterEverything(target, value);
  };

  FilteringProxyHandler.prototype['set'] = function(target, property, value) {
    const raw = getRef(target, getKey(target));

    const filteredValue = value ? SecureObject.filterEverything(target, value) : value;

    raw[property] = filteredValue;

    return true;
  };

  // These are all direct pass through methods to preserve the shape etc of the delegate

  FilteringProxyHandler.prototype['getPrototypeOf'] = function(target) {
    const raw = getRef(target, getKey(target));
    return Object.getPrototypeOf(raw);
  };

  FilteringProxyHandler.prototype['setPrototypeOf'] = function(target, prototype) {
    const raw = getRef(target, getKey(target));
    return Object.setPrototypeOf(raw, prototype);
  };

  FilteringProxyHandler.prototype['has'] = function(target, property) {
    const raw = getRef(target, getKey(target));
    return property in raw;
  };

  FilteringProxyHandler.prototype['defineProperty'] = function(target, property, descriptor) {
    const raw = getRef(target, getKey(target));
    defineProperty(raw, property, descriptor);
    return true;
  };

  FilteringProxyHandler.prototype['deleteProperty'] = function(target, property) {
    const raw = getRef(target, getKey(target));
    delete target[property];
    delete raw[property];
    return true;
  };

  FilteringProxyHandler.prototype['ownKeys'] = function(target) {
    const raw = getRef(target, getKey(target));
    return Object.keys(raw);
  };

  FilteringProxyHandler.prototype['getOwnPropertyDescriptor'] = function(target, property) {
    // If the property is non-writable and non-configurable, there is nothing to do.
    const targetDescriptor = getOwnPropertyDescriptor(target, property);
    if (targetDescriptor && !targetDescriptor.configurable && !targetDescriptor.writable) {
      return targetDescriptor;
    }

    // Always get the descriptor of the raw object.
    const raw = getRef(target, getKey(target));
    const rawDescriptor = getOwnPropertyDescriptor(raw, property);
    if (rawDescriptor) {
      // Always filter the descriptor value.
      if (rawDescriptor.hasOwnProperty('value')) {
        rawDescriptor.value = SecureObject.filterEverything(target, rawDescriptor.value);
      }

      // Always remove from the surrogate (and redefine if necessary).
      if (targetDescriptor) {
        deleteProperty(target, property);
      }

      // Use the surrogate to preserve invariants.
      // Only non-configurable properties are verified against the target.
      if (!rawDescriptor.configurable) {
        defineProperty(target, property, rawDescriptor);
      }
    } else if (targetDescriptor) {
      // Update the surrogate when the property is no longer on raw.
      deleteProperty(target, property);
    }

    return rawDescriptor;
  };

  FilteringProxyHandler.prototype['isExtensible'] = function(target) {
    const raw = getRef(target, getKey(target));
    return Object.isExtensible(raw);
  };

  FilteringProxyHandler.prototype['preventExtensions'] = function(target) {
    const raw = getRef(target, getKey(target));
    return Object.preventExtensions(raw);
  };

  return freeze(new FilteringProxyHandler());
})();

SecureObject.createFilteringProxy = function(raw, key) {
  // Use a direct proxy on raw to a proxy on {} to avoid the Proxy invariants for non-writable, non-configurable properties
  const surrogate = create$1(Object.getPrototypeOf(raw));
  setRef(surrogate, raw, key);

  const rawKey = getKey(raw);
  if (!rawKey) {
    // This is a newly created plain old js object - stamp it with the key
    setKey(raw, key);
  }

  const swallowed = new Proxy(surrogate, filteringProxyHandler);
  registerProxy(swallowed);

  // DCHASMAN TODO We should be able to remove this (replaced with ls.setKey()) in the next phase of proxy work where we remove unfilterEverything() as something that is done all the time
  setRef(swallowed, raw, key);

  addToCache(raw, swallowed, key);

  registerFilteringProxy(swallowed);

  return swallowed;
};

// We cache 1 array like thing proxy per key
const KEY_TO_ARRAY_LIKE_THING_HANDLER = typeof Map !== 'undefined' ? new Map() : undefined;

function getFilteredArrayLikeThings(raw, key) {
  const filtered = [];

  for (let n = 0; n < raw.length; n++) {
    const value = raw[n];
    if (getKey(value) === key || SecureElement.isSharedElement(value)) {
      filtered.push(value);
    }
  }
  return filtered;
}

function getArrayLikeThingProxyHandler(key) {
  function getFromFiltered(so, filtered, index) {
    // Numeric indexing into array
    const value = filtered[index];
    return value ? SecureObject.filterEverything(so, value) : value;
  }

  let handler = KEY_TO_ARRAY_LIKE_THING_HANDLER.get(key);
  if (!handler) {
    handler = {
      get: function(target, property) {
        const raw = getRef(target, key);

        const filtered = getFilteredArrayLikeThings(raw, key);
        let ret;

        property = convertSymbol(property);
        if (Number.isNaN(Number(property))) {
          switch (property) {
            case 'length':
              ret = filtered.length;
              break;

            case 'item':
              ret = function(index) {
                return getFromFiltered(handler, filtered, index);
              };
              break;

            case 'namedItem':
              ret = function(name) {
                const value = raw.namedItem(name);
                return value ? SecureObject.filterEverything(handler, value) : value;
              };
              break;

            case 'toString':
              ret = function() {
                return raw.toString();
              };
              break;

            case 'toJSON':
              ret = function() {
                return JSON.stringify(filtered);
              };
              break;
            case 'Symbol(Symbol.iterator)':
              ret = function() {
                let nextIndex = 0;
                return {
                  next: function() {
                    if (nextIndex < filtered.length) {
                      const value = filtered[nextIndex];
                      nextIndex++;
                      return {
                        value: value ? SecureObject.filterEverything(handler, value) : value,
                        done: false
                      };
                    }
                    return { done: true };
                  }
                };
              };
              break;
            default:
              warn(`Unsupported ${raw} method: ${property}. Returning undefined`);
              return undefined;
          }
        } else {
          ret = getFromFiltered(handler, filtered, property);
        }

        return ret;
      },
      has: function(target, property) {
        const raw = getRef(target, key);
        const filtered = getFilteredArrayLikeThings(raw, key);
        return property in filtered;
      }
    };

    setKey(handler, key);

    KEY_TO_ARRAY_LIKE_THING_HANDLER.set(key, handler);

    freeze(handler);
  }

  return handler;
}

SecureObject.createProxyForArrayLikeObjects = function(raw, key) {
  const surrogate = create$1(Object.getPrototypeOf(raw));
  setRef(surrogate, raw, key);

  const proxy = new Proxy(surrogate, getArrayLikeThingProxyHandler(key));
  setKey(proxy, key);
  registerProxy(proxy);

  return proxy;
};

// We cache 1 array proxy per key
const KEY_TO_ARRAY_HANLDER = typeof Map !== 'undefined' ? new Map() : undefined;

function getFilteredArray(st, raw, key) {
  const filtered = [];
  // TODO: RJ, we are missing named(non-integer) properties, changing this for loop to for..in should fix it
  for (let n = 0; n < raw.length; n++) {
    const value = raw[n];
    let validEntry = false;
    if (
      !value || // Array can contain undefined/null/false/0 such falsy values
      getKey(value) === key // Value has been keyed and belongs to this locker
    ) {
      validEntry = true;
    } else {
      const filteredValue = SecureObject.filterEverything(st, value, { defaultKey: key });
      if (filteredValue && !isOpaque(filteredValue)) {
        validEntry = true;
      }
    }
    if (validEntry) {
      // Store the raw index and value in an object
      filtered.push({ rawIndex: n, rawValue: value });
    }
  }

  return filtered;
}

function getArrayProxyHandler(key) {
  function getFromFiltered(so, filtered, index) {
    // Numeric indexing into array
    const value = filtered[index] ? filtered[index]['rawValue'] : filtered[index];
    return value ? SecureObject.filterEverything(so, value) : value;
  }
  function getFilteredValues(so, filtered) {
    // Gather values from the filtered array
    const ret = [];
    filtered.forEach(item => {
      const value = item['rawValue'];
      ret.push(value ? SecureObject.filterEverything(so, value) : value);
    });
    return ret;
  }
  let handler = KEY_TO_ARRAY_HANLDER.get(key);
  if (!handler) {
    handler = {
      getPrototypeOf: function(target) {
        return Object.getPrototypeOf(target);
      },
      setPrototypeOf: function(target, newProto) {
        return Object.setPrototypeOf(target, newProto);
      },
      isExtensible: function(target) {
        return Object.isExtensible(target);
      },
      preventExtensions: function(target) {
        Object.preventExtensions(target);
        return getFromCache(target, key);
      },
      getOwnPropertyDescriptor: function(target, property) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        if (property === 'length') {
          return getOwnPropertyDescriptor(filtered, property);
        }
        if (property in filtered) {
          return getOwnPropertyDescriptor(raw, filtered[property]['rawIndex']);
        }
        return undefined;
      },
      defineProperty: function(target, property, descriptor) {
        const raw = target;
        defineProperty(raw, property, descriptor);
        return true;
      },
      get: function(target, property) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        let ret;

        if (property === 'constructor' && unfilteredConstructors.includes(raw[property])) {
          return raw[property];
        }

        property = convertSymbol(property);
        const coercedProperty = Number(property);
        // If the property is 0 or a positive integer
        if (
          !Number.isNaN(coercedProperty) &&
          Number.isInteger(coercedProperty) &&
          coercedProperty >= 0
        ) {
          ret = getFromFiltered(handler, filtered, property);
        } else {
          switch (property) {
            case 'length':
              ret = filtered.length;
              break;
            case 'pop':
              ret = function() {
                if (filtered.length > 0) {
                  // Get the filtered value by index to return
                  const itemValue = getFromFiltered(handler, filtered, filtered.length - 1);
                  // Get raw index and update the raw array
                  const itemToRemove = filtered.pop();
                  raw.splice(itemToRemove['rawIndex'], 1);
                  return itemValue;
                }
                return undefined;
              };
              break;
            case 'push':
              ret = function() {
                if (arguments.length === 0) {
                  return filtered.length;
                }
                for (let i = 0; i < arguments.length; i++) {
                  raw.push(SecureObject.filterEverything(handler, arguments[i]));
                }
                return filtered.length + arguments.length;
              };
              break;
            case 'reverse':
              ret = function() {
                raw.reverse();
                return getFromCache(raw, key);
              };
              break;
            case 'shift':
              ret = function() {
                if (filtered.length > 0) {
                  // Get the filtered value by index to return
                  const itemValue = getFromFiltered(handler, filtered, 0);
                  // Get raw index and update the raw array
                  const itemToRemove = filtered.shift();
                  raw.splice(itemToRemove['rawIndex'], 1);
                  return itemValue;
                }
                return undefined;
              };
              break;
            case 'sort':
              ret = function(compareFunction) {
                if (arguments.length > 0) {
                  raw.sort(SecureObject.filterEverything(handler, compareFunction));
                } else {
                  raw.sort();
                }
                return getFromCache(raw, key);
              };
              break;
            case 'splice':
              ret = function(start, deleteCount) {
                let positionToInsert = raw.length; // By default insert at the end of raw
                const itemsToRemove = filtered.splice(start, deleteCount);
                // If there are items to remove
                if (itemsToRemove.length > 0) {
                  // Get position to insert the new items if there are any
                  positionToInsert = itemsToRemove[0]['rawIndex'];
                  // Remove from raw
                  for (let i = 0; i < itemsToRemove.length; i++) {
                    const itemToRemove = itemsToRemove[i];
                    // Remove from raw
                    raw.splice(itemToRemove['rawIndex'] - i, 1); // Since we are removing elements from raw, account for index adjustment
                  }
                } else {
                  // Not deleting anything but inserting
                  if (start >= 0 && start < filtered.length) {
                    positionToInsert = filtered[start]['rawIndex'];
                  } else if (start >= filtered.length) {
                    // If position is bigger than filtered's last index, insert at end of raw
                    positionToInsert = raw.length;
                  } else {
                    // If start is a negative
                    // If trying to insert at the beginning of filtered array
                    if (filtered.length + start <= 0) {
                      positionToInsert = filtered.length > 0 ? filtered[0]['rawIndex'] : raw.length;
                    } else {
                      // Else inserting in the middle of filtered array, get index of element in raw array
                      positionToInsert = filtered[filtered.length + start]['rawIndex'];
                    }
                  }
                }
                // If there are items to be inserted
                const newItems = [];
                if (arguments.length > 2) {
                  for (let j = 2; j < arguments.length; j++) {
                    newItems.push(SecureObject.filterEverything(handler, arguments[j]));
                  }
                }
                if (newItems.length > 0) {
                  raw.splice.apply(raw, [positionToInsert, 0].concat(newItems));
                }
                return getFilteredValues(handler, itemsToRemove);
              };
              break;
            case 'unshift':
              ret = function() {
                if (arguments.length === 0) {
                  return filtered.length;
                }
                const newItems = [];
                for (let i = 0; i < arguments.length; i++) {
                  newItems.push(SecureObject.filterEverything(handler, arguments[i]));
                }
                raw.splice.apply(raw, [0, 0].concat(newItems));
                return filtered.length + newItems.length;
              };
              break;
            case 'concat':
            case 'indexOf':
            case 'join':
            case 'lastIndexOf':
            case 'slice':
              ret = function() {
                const filteredValues = getFilteredValues(handler, filtered);
                return filteredValues[property].apply(filteredValues, arguments);
              };
              break;
            // For the iteration handlers, secure the callback function and invoke the method on filtered array
            case 'every':
            case 'filter':
            case 'forEach':
            case 'map':
            case 'reduce':
            case 'reduceRight':
            case 'some':
              ret = function() {
                if (arguments.length > 0) {
                  const secureCallback = SecureObject.filterEverything(handler, arguments[0]);
                  arguments[0] = secureCallback;
                }
                const filteredValues = getFilteredValues(handler, filtered);
                return filteredValues[property].apply(filteredValues, arguments);
              };
              break;
            case 'toString':
              ret = function() {
                const filteredValues = getFilteredValues(handler, filtered);
                return filteredValues.toString();
              };
              break;
            case 'Symbol(Symbol.iterator)':
              ret = function() {
                let nextIndex = 0;
                return {
                  next: function() {
                    if (nextIndex < filtered.length) {
                      const value = filtered[nextIndex]['rawValue'];
                      nextIndex++;
                      return {
                        value: value ? SecureObject.filterEverything(handler, value) : value,
                        done: false
                      };
                    }
                    return { done: true };
                  }
                };
              };
              break;
            case 'Symbol(Symbol.isConcatSpreadable)':
              ret = raw[Symbol.isConcatSpreadable];
              break;
            default:
              if (raw[property]) {
                // If trying to use array like an associative array
                ret = SecureObject.filterEverything(handler, raw[property]);
              } else {
                warn(`Unsupported ${raw} method: ${property}. Returning undefined`);
                return undefined;
              }
          }
        }
        return ret;
      },
      set: function(target, property, value) {
        const raw = target;
        // Setting numerical indexes, number has to be positive integer, else its treated as an associative array key
        const coercedProperty = Number(property);
        if (
          !Number.isNaN(coercedProperty) &&
          Number.isInteger(coercedProperty) &&
          coercedProperty >= 0
        ) {
          // Refilter raw to recreate the index mapping between raw and filtered value
          const filtered = getFilteredArray(handler, raw, key);
          // If we are replacing existing index
          if (filtered[property]) {
            raw[filtered[property]['rawIndex']] = SecureObject.filterEverything(handler, value);
            return true;
          }
          // Adding values at a random numerical index greater than length
          const filteredLength = filtered.length;
          const newItems = [];
          for (let i = 0; i < property - filtered.length; i++) {
            newItems.push(undefined);
          }
          newItems.push(value);
          // Find the position in raw where we have to insert the new items
          // If filtered is empty, insert at beginning of raw
          // else, find the rawIndex of last filtered element and insert one after
          const positionToInsert = filteredLength
            ? filtered[filteredLength - 1]['rawIndex'] + 1
            : 0;
          raw.splice.apply(raw, [positionToInsert, 0].concat(newItems));
          return true;
        }
        // Trying to use it like an associative array
        raw[property] = SecureObject.filterEverything(handler, value);
        return true;
      },
      has: function(target, property) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        return property in filtered;
      },
      ownKeys: function(target) {
        const raw = target;
        const filtered = getFilteredArray(handler, raw, key);
        return getOwnPropertyNames(filtered);
      },
      deleteProperty: function(target, property) {
        const raw = target;
        const coercedProperty = Number(property);
        // If property is a numerical index(0 or positive integer)
        if (
          !Number.isNaN(coercedProperty) &&
          Number.isInteger(coercedProperty) &&
          coercedProperty >= 0
        ) {
          const filtered = getFilteredArray(handler, raw, key);
          if (filtered[property]) {
            delete raw[filtered[property]['rawIndex']];
          }
        } else {
          const value = raw[property];
          // If value was set by using the array like an associative array
          if (value) {
            // Check if we have access
            const rawValue = getRef(value, key);
            if (rawValue) {
              delete raw[property];
            }
          }
        }
        return true;
      }
      // Not handling "apply" and "construct" trap and letting the underlying raw handle apply and throw the error
    };

    setKey(handler, key);

    KEY_TO_ARRAY_HANLDER.set(key, handler);

    freeze(handler);
  }

  return handler;
}

SecureObject.createProxyForArrayObjects = function(raw, key) {
  if (!isArray(raw)) {
    warn('Illegal usage of SecureObject.createProxyForArrayObjects');
    return SecureObject.createFilteringProxy(raw, key);
  }
  // Not using a surrogate for array Proxy because we want to support for..in style of looping on arrays
  // Having a fake surrogate does not allow for correct looping. Mitigating this risk by handling all traps for Proxy.
  const proxy = new Proxy(raw, getArrayProxyHandler(key));
  setKey(proxy, key);
  registerProxy(proxy);

  return proxy;
};

const KEY_TO_NAMED_NODE_MAP_HANLDER = typeof Map !== 'undefined' ? new Map() : undefined;

function getFilteredNamedNodeMap(raw, key, prototype, caseInsensitiveAttributes) {
  const filtered = {};

  for (let n = 0, i = 0; n < raw.length; n++) {
    const value = raw[n];
    if (SecureElement.isValidAttributeName(raw, value.name, prototype, caseInsensitiveAttributes)) {
      filtered[i++] = value;
    }
  }

  return filtered;
}

function getNamedNodeMapProxyHandler(key, prototype, caseInsensitiveAttributes) {
  function getFromFiltered(so, filtered, index) {
    const value = filtered[index];
    return value ? SecureObject.filterEverything(so, value, { defaultKey: key }) : value;
  }

  let handler = KEY_TO_NAMED_NODE_MAP_HANLDER.get(key);
  if (!handler) {
    handler = {
      get: function(target, property) {
        const raw = getRef(target, key);

        const filtered = getFilteredNamedNodeMap(raw, key, prototype, caseInsensitiveAttributes);
        let ret;

        property = convertSymbol(property);
        if (Number.isNaN(Number(property))) {
          switch (property) {
            case 'length':
              ret = Object.keys(filtered).length;
              break;
            case 'item':
              ret = function(index) {
                return getFromFiltered(handler, filtered, index);
              };
              break;
            case 'getNamedItem':
              ret = function(name) {
                for (const val in filtered) {
                  if (name === filtered[val].name) {
                    return SecureObject.filterEverything(handler, filtered[val], {
                      defaultKey: key
                    });
                  }
                }
                return null;
              };
              break;
            case 'setNamedItem':
              ret = function(attribute) {
                if (
                  !SecureElement.isValidAttributeName(
                    raw,
                    attribute.name,
                    prototype,
                    caseInsensitiveAttributes
                  )
                ) {
                  warn(
                    `${this} does not allow getting/setting the ${attribute.name.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                // it may not be possible to get here from another Locker so the access check may be unnecessary
                // keep to error on the safe side
                verifyAccess(attribute, target);
                if (isProxy(attribute)) {
                  attribute = getRef(attribute, key);
                }
                return SecureObject.filterEverything(handler, raw['setNamedItem'](attribute), {
                  defaultKey: key
                });
              };
              break;
            case 'removeNamedItem':
              ret = function(name) {
                if (
                  !SecureElement.isValidAttributeName(
                    raw,
                    name,
                    prototype,
                    caseInsensitiveAttributes
                  )
                ) {
                  warn(
                    `${this} does not allow removing the ${name.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                return SecureObject.filterEverything(handler, raw['removeNamedItem'](name), {
                  defaultKey: key
                });
              };
              break;
            case 'getNamedItemNS':
              ret = function(namespace, localName) {
                for (const val in filtered) {
                  if (
                    namespace === filtered[val].namespaceURI &&
                    localName === filtered[val].localName
                  ) {
                    return SecureObject.filterEverything(handler, filtered[val], {
                      defaultKey: key
                    });
                  }
                }
                return null;
              };
              break;
            case 'setNamedItemNS':
              ret = function(attribute) {
                if (
                  !SecureElement.isValidAttributeName(
                    raw,
                    attribute.name,
                    prototype,
                    caseInsensitiveAttributes
                  )
                ) {
                  warn(
                    `${this} does not allow getting/setting the ${attribute.name.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                verifyAccess(attribute, target);
                if (isProxy(attribute)) {
                  attribute = getRef(attribute, key);
                }
                return SecureObject.filterEverything(handler, raw['setNamedItemNS'](attribute), {
                  defaultKey: key
                });
              };
              break;
            case 'removeNamedItemNS':
              ret = function(namespace, localName) {
                if (
                  !SecureElement.isValidAttributeName(
                    raw,
                    localName,
                    prototype,
                    caseInsensitiveAttributes
                  )
                ) {
                  warn(
                    `${this} does not allow removing the ${localName.toLowerCase()} attribute, ignoring!`
                  );
                  return undefined;
                }
                return SecureObject.filterEverything(
                  handler,
                  raw['removeNamedItemNS'](namespace, localName),
                  { defaultKey: key }
                );
              };
              break;
            case 'toString':
              ret = function() {
                return raw.toString();
              };
              break;

            case 'toJSON':
              ret = function() {
                return JSON.stringify(filtered);
              };
              break;
            case 'Symbol(Symbol.iterator)':
              ret = function() {
                let nextIndex = 0;
                return {
                  next: function() {
                    if (nextIndex < filtered.length) {
                      const value = filtered[nextIndex];
                      nextIndex++;
                      return {
                        value: value ? SecureObject.filterEverything(handler, value) : value,
                        done: false
                      };
                    }
                    return { done: true };
                  }
                };
              };
              break;
            default:
              warn(`Unsupported ${raw} method: ${property}. Returning undefined`);
              return undefined;
          }
        } else {
          ret = getFromFiltered(handler, filtered, property);
        }

        return ret;
      },
      has: function(target, property) {
        const raw = getRef(target, key);
        const filtered = getFilteredNamedNodeMap(
          handler,
          raw,
          key,
          prototype,
          caseInsensitiveAttributes
        );
        return property in filtered;
      }
    };

    setKey(handler, key);

    KEY_TO_NAMED_NODE_MAP_HANLDER.set(key, handler);

    freeze(handler);
  }

  return handler;
}

SecureObject.createProxyForNamedNodeMap = function(raw, key, prototype, caseInsensitiveAttributes) {
  const surrogate = create$1(Object.getPrototypeOf(raw));
  setRef(surrogate, raw, key);

  const proxy = new Proxy(
    surrogate,
    getNamedNodeMapProxyHandler(key, prototype, caseInsensitiveAttributes)
  );
  setKey(proxy, key);
  registerProxy(proxy);

  return proxy;
};

SecureObject.createFilteredMethod = function(st, raw, methodName, options) {
  // Do not expose properties that the raw object does not actually support
  if (!(methodName in raw)) {
    if (options && options.ignoreNonexisting) {
      return undefined;
    }
    throw new error(`Underlying raw object ${raw} does not support method: ${methodName}`);
  }

  return {
    enumerable: true,
    writable: true,
    value: function() {
      const filteredArgs = SecureObject.filterArguments(st, arguments, options);
      let fnReturnedValue = raw[methodName].apply(raw, filteredArgs);

      if (options && options.afterCallback) {
        fnReturnedValue = options.afterCallback(fnReturnedValue);
      }

      return SecureObject.filterEverything(st, fnReturnedValue, options);
    }
  };
};

SecureObject.createFilteredMethodStateless = function(methodName, prototype, options) {
  if (!prototype) {
    throw new Error('SecureObject.createFilteredMethodStateless() called without prototype');
  }

  return {
    enumerable: true,
    writable: true,
    value: function() {
      const st = this;
      const raw = SecureObject.getRaw(st);

      const filteredArgs = SecureObject.filterArguments(st, arguments, options);
      let fnReturnedValue = raw[methodName].apply(raw, filteredArgs);

      if (options) {
        if (options.afterCallback) {
          fnReturnedValue = options.afterCallback.call(st, fnReturnedValue);
        }

        if (options.trustReturnValue) {
          trust$1(st, fnReturnedValue);
        }
      }

      return SecureObject.filterEverything(st, fnReturnedValue, options);
    }
  };
};

SecureObject.createFilteredProperty = function(st, raw, propertyName, options) {
  // Do not expose properties that the raw object does not actually support.
  if (!(propertyName in raw)) {
    if (options && options.ignoreNonexisting) {
      return undefined;
    }
    throw new error(
      `Underlying raw object ${raw} does not support property: ${propertyName}`
    );
  }

  const descriptor = {
    enumerable: true
  };

  descriptor.get = function() {
    let value = raw[propertyName];

    // Continue from the current object until we find an accessible object.
    if (options && options.skipOpaque === true) {
      // skipping opaque elements and traversing up the dom tree, eg: event.target
      const accesorProperty = options.propertyName || propertyName;
      while (value) {
        const hasAccess$$1 = hasAccess(st, value);
        if (hasAccess$$1 || SecureElement.isSharedElement(value)) {
          break;
        }
        value = value[accesorProperty];
      }
    }

    if (options && options.afterGetCallback) {
      // The caller wants to handle the property value
      return options.afterGetCallback(value);
    }
    return SecureObject.filterEverything(st, value, options);
  };

  if (!options || options.writable !== false) {
    descriptor.set = function(value) {
      if (options && options.beforeSetCallback) {
        value = options.beforeSetCallback(value);
      }

      raw[propertyName] = SecureObject.filterEverything(st, value);

      if (options && options.afterSetCallback) {
        options.afterSetCallback();
      }
    };
  }

  return descriptor;
};

SecureObject.createFilteredPropertyStateless = function(propertyName, prototype, options) {
  if (!prototype) {
    throw new Error('SecureObject.createFilteredPropertyStateless() called without prototype');
  }

  const descriptor = {
    enumerable: true
  };

  descriptor.get = function() {
    const st = this;
    const raw = SecureObject.getRaw(st);

    let value = raw[propertyName];

    // Continue from the current object until we find an acessible object.
    if (options && options.skipOpaque === true) {
      while (value) {
        const hasAccess$$1 = hasAccess(st, value);
        if (
          hasAccess$$1 ||
          value === document.body ||
          value === document.head ||
          value === document.documentElement ||
          value === document
        ) {
          break;
        }
        value = value[propertyName];
      }
    }

    if (options && options.afterGetCallback) {
      // The caller wants to handle the property value
      return options.afterGetCallback.call(st, value);
    }
    return SecureObject.filterEverything(st, value, options);
  };

  if (!options || options.writable !== false) {
    descriptor.set = function(value) {
      const st = this;
      const key = getKey(st);
      const raw = getRef(st, key);

      if (options && options.beforeSetCallback) {
        value = options.beforeSetCallback.call(st, value);
      }

      raw[propertyName] = SecureObject.filterEverything(st, value);

      if (options && options.afterSetCallback) {
        options.afterSetCallback.call(st);
      }
    };
  }

  return descriptor;
};

SecureObject.addIfSupported = function(behavior, st, element, name, options) {
  options = options || {};
  options.ignoreNonexisting = true;

  const prop = behavior(st, element, name, options);
  if (prop) {
    defineProperty(st, name, prop);
  }
};

SecureObject.addPropertyIfSupported = function(st, raw, name, options) {
  SecureObject.addIfSupported(SecureObject.createFilteredProperty, st, raw, name, options);
};

SecureObject.addMethodIfSupported = function(st, raw, name, options) {
  SecureObject.addIfSupported(SecureObject.createFilteredMethod, st, raw, name, options);
};

// Return the set of interfaces supported by the object in order of most specific to least specific
function getSupportedInterfaces(o) {
  const interfaces = [];
  if (o instanceof Window) {
    interfaces.push('Window', 'EventTarget');
  } else if (o instanceof Document) {
    if (o instanceof HTMLDocument) {
      interfaces.push('HTMLDocument');
    }
    interfaces.push('Document', 'Node', 'EventTarget');
  } else if (o instanceof DocumentFragment) {
    interfaces.push('Node', 'EventTarget', 'DocumentFragment');
  } else if (o instanceof Element) {
    if (o instanceof HTMLElement) {
      // Look for all HTMLElement subtypes
      if (o instanceof HTMLAnchorElement) {
        interfaces.push('HTMLAnchorElement');
      } else if (o instanceof HTMLAreaElement) {
        interfaces.push('HTMLAreaElement');
      } else if (o instanceof HTMLMediaElement) {
        if (o instanceof HTMLAudioElement) {
          interfaces.push('HTMLAudioElement');
        } else if (o instanceof HTMLVideoElement) {
          interfaces.push('HTMLVideoElement');
        }
        interfaces.push('HTMLMediaElement');
      } else if (o instanceof HTMLBaseElement) {
        interfaces.push('HTMLBaseElement');
      } else if (o instanceof HTMLButtonElement) {
        interfaces.push('HTMLButtonElement');
      } else if (o instanceof HTMLCanvasElement) {
        interfaces.push('HTMLCanvasElement');
      } else if (o instanceof HTMLTableColElement) {
        interfaces.push('HTMLTableColElement');
      } else if (o instanceof HTMLTableRowElement) {
        interfaces.push('HTMLTableRowElement');
      } else if (o instanceof HTMLModElement) {
        interfaces.push('HTMLModElement');
      } else if (typeof HTMLDetailsElement !== 'undefined' && o instanceof HTMLDetailsElement) {
        interfaces.push('HTMLDetailsElement');
      } else if (o instanceof HTMLEmbedElement) {
        interfaces.push('HTMLEmbedElement');
      } else if (o instanceof HTMLFieldSetElement) {
        interfaces.push('HTMLFieldSetElement');
      } else if (o instanceof HTMLFormElement) {
        interfaces.push('HTMLFormElement');
      } else if (o instanceof HTMLIFrameElement) {
        interfaces.push('HTMLIFrameElement');
      } else if (o instanceof HTMLImageElement) {
        interfaces.push('HTMLImageElement');
      } else if (o instanceof HTMLInputElement) {
        interfaces.push('HTMLInputElement');
      } else if (o instanceof HTMLLabelElement) {
        interfaces.push('HTMLLabelElement');
      } else if (o instanceof HTMLLIElement) {
        interfaces.push('HTMLLIElement');
      } else if (o instanceof HTMLLinkElement) {
        interfaces.push('HTMLLinkElement');
      } else if (o instanceof HTMLMapElement) {
        interfaces.push('HTMLMapElement');
      } else if (o instanceof HTMLMetaElement) {
        interfaces.push('HTMLMetaElement');
      } else if (typeof HTMLMeterElement !== 'undefined' && o instanceof HTMLMeterElement) {
        interfaces.push('HTMLMeterElement');
      } else if (o instanceof HTMLObjectElement) {
        interfaces.push('HTMLObjectElement');
      } else if (o instanceof HTMLOListElement) {
        interfaces.push('HTMLOListElement');
      } else if (o instanceof HTMLOptGroupElement) {
        interfaces.push('HTMLOptGroupElement');
      } else if (o instanceof HTMLOptionElement) {
        interfaces.push('HTMLOptionElement');
      } else if (typeof HTMLOutputElement !== 'undefined' && o instanceof HTMLOutputElement) {
        interfaces.push('HTMLOutputElement');
      } else if (o instanceof HTMLParamElement) {
        interfaces.push('HTMLParamElement');
      } else if (o instanceof HTMLProgressElement) {
        interfaces.push('HTMLProgressElement');
      } else if (o instanceof HTMLQuoteElement) {
        interfaces.push('HTMLQuoteElement');
      } else if (o instanceof HTMLScriptElement) {
        interfaces.push('HTMLScriptElement');
      } else if (o instanceof HTMLSelectElement) {
        interfaces.push('HTMLSelectElement');
      } else if (o instanceof HTMLSourceElement) {
        interfaces.push('HTMLSourceElement');
      } else if (o instanceof HTMLTableCellElement) {
        interfaces.push('HTMLTableCellElement');
      } else if (o instanceof HTMLTableElement) {
        interfaces.push('HTMLTableElement');
      } else if (typeof HTMLTemplateElement !== 'undefined' && o instanceof HTMLTemplateElement) {
        interfaces.push('HTMLTemplateElement');
      } else if (o instanceof HTMLTextAreaElement) {
        interfaces.push('HTMLTextAreaElement');
      } else if (o instanceof HTMLTrackElement) {
        interfaces.push('HTMLTrackElement');
      }

      if (o instanceof HTMLTableSectionElement) {
        interfaces.push('HTMLTableSectionElement');
      }

      interfaces.push('HTMLElement');
    } else if (o instanceof SVGElement) {
      if (o instanceof SVGSVGElement) {
        interfaces.push('SVGSVGElement');
      } else if (o instanceof SVGAngle) {
        interfaces.push('SVGAngle');
      } else if (o instanceof SVGCircleElement) {
        interfaces.push('SVGCircleElement');
      } else if (o instanceof SVGClipPathElement) {
        interfaces.push('SVGClipPathElement');
      } else if (o instanceof SVGDefsElement) {
        interfaces.push('SVGGraphicsElement');
      } else if (o instanceof SVGEllipseElement) {
        interfaces.push('SVGEllipseElement');
      } else if (o instanceof SVGFilterElement) {
        interfaces.push('SVGFilterElement');
      } else if (o instanceof SVGForeignObjectElement) {
        interfaces.push('SVGForeignObjectElement');
      } else if (o instanceof SVGImageElement) {
        interfaces.push('SVGImageElement');
      } else if (o instanceof SVGLength) {
        interfaces.push('SVGLength');
      } else if (o instanceof SVGLengthList) {
        interfaces.push('SVGLengthList');
      } else if (o instanceof SVGLineElement) {
        interfaces.push('SVGLineElement');
      } else if (o instanceof SVGLinearGradientElement) {
        interfaces.push('SVGLinearGradientElement');
      } else if (o instanceof SVGMaskElement) {
        interfaces.push('SVGMaskElement');
      } else if (o instanceof SVGNumber) {
        interfaces.push('SVGNumber');
      } else if (o instanceof SVGNumberList) {
        interfaces.push('SVGNumberList');
      } else if (o instanceof SVGPatternElement) {
        interfaces.push('SVGPatternElement');
      } else if (o instanceof SVGPreserveAspectRatio) {
        interfaces.push('SVGPreserveAspectRatio');
      } else if (o instanceof SVGRadialGradientElement) {
        interfaces.push('SVGRadialGradientElement');
      } else if (o instanceof SVGRect) {
        interfaces.push('SVGRect');
      } else if (o instanceof SVGRectElement) {
        interfaces.push('SVGRectElement');
      } else if (o instanceof SVGScriptElement) {
        interfaces.push('SVGScriptElement');
      } else if (o instanceof SVGStopElement) {
        interfaces.push('SVGStopElement');
      } else if (o instanceof SVGStringList) {
        interfaces.push('SVGStringList');
      } else if (o instanceof SVGStyleElement) {
        interfaces.push('SVGStyleElement');
      } else if (o instanceof SVGTransform) {
        interfaces.push('SVGTransform');
      } else if (o instanceof SVGTransformList) {
        interfaces.push('SVGTransformList');
      } else if (o instanceof SVGUseElement) {
        interfaces.push('SVGUseElement');
      } else if (o instanceof SVGViewElement) {
        interfaces.push('SVGViewElement');
      } else if (o instanceof SVGAnimatedAngle) {
        interfaces.push('SVGAnimatedAngle');
      } else if (o instanceof SVGAnimatedBoolean) {
        interfaces.push('SVGAnimatedBoolean');
      } else if (o instanceof SVGAnimatedEnumeration) {
        interfaces.push('SVGAnimatedEnumeration');
      } else if (o instanceof SVGAnimatedInteger) {
        interfaces.push('SVGAnimatedInteger');
      } else if (o instanceof SVGAnimatedLength) {
        interfaces.push('SVGAnimatedLength');
      } else if (o instanceof SVGAnimatedLengthList) {
        interfaces.push('SVGAnimatedLengthList');
      } else if (o instanceof SVGAnimatedNumber) {
        interfaces.push('SVGAnimatedNumber');
      } else if (o instanceof SVGAnimatedNumberList) {
        interfaces.push('SVGAnimatedNumberList');
      } else if (o instanceof SVGAnimatedPreserveAspectRatio) {
        interfaces.push('SVGAnimatedPreserveAspectRatio');
      } else if (o instanceof SVGAnimatedRect) {
        interfaces.push('SVGAnimatedRect');
      } else if (o instanceof SVGAnimatedString) {
        interfaces.push('SVGAnimatedString');
      } else if (o instanceof SVGAnimatedTransformList) {
        interfaces.push('SVGAnimatedTransformList');
      }

      // below may be implemented by multiple types
      if (o instanceof SVGTextContentElement) {
        interfaces.push('SVGTextContentElement');
      }
      if (typeof SVGAnimationElement !== 'undefined' && o instanceof SVGAnimationElement) {
        interfaces.push('SVGAnimationElement');
      }
      if (o instanceof SVGGradientElement) {
        interfaces.push('SVGGradientElement');
      }
      if (typeof SVGGraphicsElement !== 'undefined' && o instanceof SVGGraphicsElement) {
        interfaces.push('SVGGraphicsElement');
      }
      if (typeof SVGGeometryElement !== 'undefined' && o instanceof SVGGeometryElement) {
        interfaces.push('SVGGeometryElement');
      }
      if (o instanceof SVGTextPositioningElement) {
        interfaces.push('SVGTextPositioningElement');
      }

      interfaces.push('SVGElement');
    }

    interfaces.push('Element', 'Node', 'EventTarget');
  } else if (o instanceof Text) {
    interfaces.push('Text', 'CharacterData', 'Node');
  } else if (o instanceof Comment) {
    interfaces.push('CharacterData', 'Node');
  } else if (o instanceof Attr) {
    interfaces.push('Attr', 'Node', 'EventTarget');
  } else if (o instanceof CanvasRenderingContext2D) {
    interfaces.push('CanvasRenderingContext2D');
  } else if (typeof RTCPeerConnection !== 'undefined' && o instanceof RTCPeerConnection) {
    interfaces.push('RTCPeerConnection');
  }

  return interfaces;
}

SecureObject.addPrototypeMethodsAndProperties = function(metadata$$1, so, raw, key) {
  let prototype;

  function worker(name) {
    const item = prototype[name];
    let valueOverride;
    if (!(name in so) && name in raw) {
      const options = {
        skipOpaque: item.skipOpaque || false,
        defaultValue: item.defaultValue || null,
        trustReturnValue: item.trustReturnValue || false,
        rawArguments: item.rawArguments || false
      };

      if (item.type === 'function') {
        SecureObject.addMethodIfSupported(so, raw, name, options);
      } else if (item.type === '@raw') {
        defineProperty(so, name, {
          // Does not currently secure proxy the actual class
          get: function() {
            return valueOverride || raw[name];
          },
          set: function(value) {
            valueOverride = value;
          }
        });
      } else if (item.type === '@ctor') {
        defineProperty(so, name, {
          get: function() {
            return (
              valueOverride ||
              function() {
                const cls = raw[name];
                const args = Array.prototype.slice.call(arguments);
                let result;

                if (typeof cls === 'function') {
                  //  Function.prototype.bind.apply is being used to invoke the constructor and to pass all the arguments provided by the caller
                  // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
                  const ctor = Function.prototype.bind.apply(cls, [null].concat(args));
                  result = new ctor();
                } else {
                  // For browsers that use a constructor that's not a function, invoke the constructor directly.
                  // For example, on Mobile Safari window["Audio"] returns an object called AudioConstructor
                  // Passing the args as an array is the closest we got to passing the arguments.
                  result = new cls(args);
                }
                trust$1(so, result);

                return SecureObject.filterEverything(so, result);
              }
            );
          },
          set: function(value) {
            valueOverride = value;
          }
        });
      } else if (item.type === '@event') {
        defineProperty(so, name, {
          get: function() {
            return SecureObject.filterEverything(so, raw[name]);
          },

          set: function(callback) {
            raw[name] = function(e) {
              if (callback) {
                callback.call(so, e && SecureDOMEvent(e, key));
              }
            };
          }
        });
      } else {
        // Properties
        const descriptor = SecureObject.createFilteredProperty(so, raw, name, options);
        if (descriptor) {
          defineProperty(so, name, descriptor);
        }
      }
    }
  }

  const supportedInterfaces = getSupportedInterfaces(raw);

  const prototypes = metadata$$1['prototypes'];
  supportedInterfaces.forEach(name => {
    prototype = prototypes[name];
    Object.keys(prototype).forEach(worker);
  });
};

// Closure factory
function addPrototypeMethodsAndPropertiesStatelessHelper(
  name,
  prototype,
  prototypicalInstance,
  prototypeForValidation,
  rawPrototypicalInstance,
  config
) {
  let descriptor;
  const item = prototype[name];
  let valueOverride;

  if (!prototypeForValidation.hasOwnProperty(name) && name in rawPrototypicalInstance) {
    const options = {
      skipOpaque: item.skipOpaque || false,
      defaultValue: item.defaultValue || null,
      trustReturnValue: item.trustReturnValue || false,
      rawArguments: item.rawArguments || false
    };

    if (item.type === 'function') {
      descriptor = SecureObject.createFilteredMethodStateless(
        name,
        prototypeForValidation,
        options
      );
    } else if (item.type === '@raw') {
      descriptor = {
        // Does not currently secure proxy the actual class
        get: function() {
          if (valueOverride) {
            return valueOverride;
          }
          const raw = SecureObject.getRaw(this);
          return raw[name];
        },
        set: function(value) {
          valueOverride = value;
        }
      };
    } else if (item.type === '@ctor') {
      descriptor = {
        get:
          valueOverride ||
          function() {
            return function() {
              const so = this;
              const raw = SecureObject.getRaw(so);
              const cls = raw[name];

              // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
              const ctor = Function.prototype.bind.apply(
                cls,
                [null].concat(Array.prototype.slice.call(arguments))
              );
              const result = new ctor();
              trust$1(so, result);

              return SecureObject.filterEverything(so, result);
            };
          },
        set: function(value) {
          valueOverride = value;
        }
      };
    } else if (item.type === '@event') {
      descriptor = {
        get: function() {
          return SecureObject.filterEverything(this, SecureObject.getRaw(this)[name]);
        },

        set: function(callback) {
          const raw = SecureObject.getRaw(this);

          // Insure that we pick up the current proxy for the raw object
          let key = getKey(raw);
          // Shared elements like <body> and <head> are not tied to specific namespaces.
          // Every namespace has a secure wrapper for these elements
          if (!key && SecureElement.isSharedElement(raw)) {
            // Obtain the key of the secure wrapper
            key = getKey(this);
          }
          const o = getFromCache(raw, key);

          raw[name] = function(e) {
            if (callback) {
              callback.call(o, e && SecureDOMEvent(e, key));
            }
          };
        }
      };
    } else {
      // Properties
      descriptor = SecureObject.createFilteredPropertyStateless(
        name,
        prototypeForValidation,
        options
      );
    }
  }

  if (descriptor) {
    config[name] = descriptor;
  }
}

SecureObject.addPrototypeMethodsAndPropertiesStateless = function(
  metadata$$1,
  prototypicalInstance,
  prototypeForValidation
) {
  const rawPrototypicalInstance = SecureObject.getRaw(prototypicalInstance);
  let prototype;
  const config = {};

  const supportedInterfaces = getSupportedInterfaces(rawPrototypicalInstance);

  const prototypes = metadata$$1['prototypes'];
  supportedInterfaces.forEach(name => {
    prototype = prototypes[name];
    for (const property in prototype) {
      addPrototypeMethodsAndPropertiesStatelessHelper(
        property,
        prototype,
        prototypicalInstance,
        prototypeForValidation,
        rawPrototypicalInstance,
        config
      );
    }
  });

  return config;
};

function getUnfilteredTypes() {
  const ret = [];
  const unfilteredTypesMeta = [
    'File',
    'FileList',
    'CSSStyleDeclaration',
    'TimeRanges',
    'Date',
    'Promise',
    'MessagePort',
    'MessageChannel',
    'MessageEvent',
    'FormData',
    'ValidityState',
    'Crypto',
    'DOMTokenList',
    'ArrayBuffer',
    'Blob'
  ];
  unfilteredTypesMeta.forEach(unfilteredType => {
    if (typeof window[unfilteredType] !== 'undefined') {
      ret.push(window[unfilteredType]);
    }
  });
  return ret;
}
const unfilteredTypes = getUnfilteredTypes();

SecureObject.isUnfilteredType = function(raw, key) {
  for (let n = 0; n < unfilteredTypes.length; n++) {
    if (raw instanceof unfilteredTypes[n]) {
      return true;
    }
  }

  // Do not filter ArrayBufferView types. https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
  if (raw && raw.buffer instanceof ArrayBuffer && raw.byteLength !== undefined) {
    return true;
  }

  if (isUnfilteredTypeHook$1 && isUnfilteredTypeHook$1(raw, key)) {
    return true;
  }

  return false;
};

SecureObject.addUnfilteredPropertyIfSupported = function(st, raw, name) {
  if (raw[name]) {
    const config = {
      enumerable: true,
      value: raw[name],
      writable: true
    };
    defineProperty(st, name, config);
  }
};

SecureObject.FunctionPrototypeBind = Function.prototype.bind;
SecureObject.ArrayPrototypeSlice = Array.prototype.slice;

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const metadata$5 = {
  prototypes: {
    HTMLDocument: {
      // Defined on Instance
      location: DEFAULT,
      // Defined on Proto
      fgColor: DEFAULT,
      linkColor: DEFAULT,
      vlinkColor: DEFAULT,
      alinkColor: DEFAULT,
      bgColor: DEFAULT,
      clear: FUNCTION,
      captureEvents: FUNCTION,
      releaseEvents: FUNCTION
    },
    Document: {
      URL: DEFAULT,
      activeElement: DEFAULT,
      adoptNode: FUNCTION,
      anchors: DEFAULT,
      applets: DEFAULT,
      body: DEFAULT,
      caretRangeFromPoint: FUNCTION,
      characterSet: DEFAULT,
      charset: DEFAULT,
      childElementCount: DEFAULT,
      children: DEFAULT,
      close: FUNCTION,
      compatMode: DEFAULT,
      contentType: DEFAULT,
      cookie: DEFAULT,
      createAttribute: FUNCTION,
      createAttributeNS: FUNCTION,
      createCDATASection: FUNCTION,
      createComment: FUNCTION,
      createDocumentFragment: FUNCTION,
      createElement: FUNCTION,
      createElementNS: FUNCTION,
      createEvent: FUNCTION,
      createExpression: FUNCTION,
      createNSResolver: FUNCTION,
      createNodeIterator: FUNCTION,
      createProcessingInstruction: FUNCTION,
      createRange: FUNCTION,
      createTextNode: FUNCTION,
      createTreeWalker: FUNCTION,
      defaultView: DEFAULT,
      designMode: DEFAULT,
      dir: DEFAULT,
      doctype: DEFAULT,
      documentElement: DEFAULT,
      documentURI: DEFAULT,
      // SecureDocument does not allow setting domain property.
      // "domain":                           DEFAULT,
      elementFromPoint: FUNCTION,
      elementsFromPoint: FUNCTION,
      embeds: DEFAULT,
      evaluate: FUNCTION,
      execCommand: FUNCTION,
      exitPointerLock: FUNCTION,
      firstElementChild: DEFAULT,
      fonts: DEFAULT,
      forms: DEFAULT,
      getElementById: FUNCTION,
      getElementsByClassName: FUNCTION,
      getElementsByName: FUNCTION,
      getElementsByTagName: FUNCTION,
      getElementsByTagNameNS: FUNCTION,
      getSelection: FUNCTION,
      hasFocus: FUNCTION,
      head: DEFAULT,
      hidden: DEFAULT,
      images: DEFAULT,
      implementation: DEFAULT,
      importNode: FUNCTION,
      inputEncoding: DEFAULT,
      lastElementChild: DEFAULT,
      lastModified: DEFAULT,
      links: DEFAULT,
      onabort: EVENT,
      onautocomplete: EVENT,
      onautocompleteerror: EVENT,
      onbeforecopy: EVENT,
      onbeforecut: EVENT,
      onbeforepaste: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncopy: EVENT,
      oncuechange: EVENT,
      oncut: EVENT,
      ondblclick: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onpaste: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onpointerlockchange: EVENT,
      onpointerlockerror: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onreadystatechange: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onsearch: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onselectionchange: EVENT,
      onselectstart: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      onwebkitfullscreenchange: EVENT,
      onwebkitfullscreenerror: EVENT,
      onwheel: EVENT,
      open: FUNCTION,
      origin: DEFAULT,
      plugins: DEFAULT,
      pointerLockElement: DEFAULT,
      preferredStylesheetSet: DEFAULT,
      queryCommandEnabled: FUNCTION,
      queryCommandIndeterm: FUNCTION,
      queryCommandState: FUNCTION,
      queryCommandSupported: FUNCTION,
      queryCommandValue: FUNCTION,
      querySelector: FUNCTION,
      querySelectorAll: FUNCTION,
      readyState: DEFAULT,
      referrer: DEFAULT,
      registerElement: FUNCTION,
      rootElement: DEFAULT,
      scripts: DEFAULT,
      scrollingElement: DEFAULT,
      selectedStylesheetSet: DEFAULT,
      styleSheets: DEFAULT,
      title: DEFAULT,
      visibilityState: DEFAULT,
      webkitCancelFullScreen: FUNCTION,
      webkitCurrentFullScreenElement: DEFAULT,
      webkitExitFullscreen: FUNCTION,
      webkitFullscreenElement: DEFAULT,
      webkitFullscreenEnabled: DEFAULT,
      webkitHidden: DEFAULT,
      webkitIsFullScreen: DEFAULT,
      webkitVisibilityState: DEFAULT,
      // Blocked on purpose because of security risk
      // "write":                            FUNCTION,
      // "writeln":                          FUNCTION,
      xmlEncoding: DEFAULT,
      xmlStandalone: DEFAULT,
      xmlVersion: DEFAULT
    },
    Node: metadata$3,
    EventTarget: metadata$4
  }
};

function isStyleTag(el) {
  return (
    (typeof HTMLStyleElement !== 'undefined' && el instanceof HTMLStyleElement) ||
    (typeof SVGStyleElement !== 'undefined' && el instanceof SVGStyleElement)
  );
}

function SecureDocument(doc, key) {
  let o = getFromCache(doc, key);
  if (o) {
    return o;
  }

  // create prototype to allow instanceof checks against document
  const prototype = function() {};
  freeze(prototype);

  o = create$1(prototype, {
    toString: {
      value: function() {
        return `SecureDocument: ${doc}{ key: ${JSON.stringify(key)} }`;
      }
    },
    createAttribute: {
      value: function(name) {
        const att = doc.createAttribute(name);
        setKey(att, key);
        return SecureElement(att, key);
      }
    },
    createElement: {
      value: function(tag) {
        let el = doc.createElement(tag);
        if (isStyleTag(el)) {
          el = doc.createElement('style-disabled');
          warn('Creation of style tags is not allowed! Created style-disabled tag instead.');
        }
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createElementNS: {
      value: function(namespace, tag) {
        let el = doc.createElementNS(namespace, tag);
        if (isStyleTag(el)) {
          el = doc.createElementNS(namespace, 'style-disabled');
          warn('Creation of style tags is not allowed! Created style-disabled tag instead.');
        }
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createDocumentFragment: {
      value: function() {
        const el = doc.createDocumentFragment();
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createTextNode: {
      value: function(text) {
        const el = doc.createTextNode(text);
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    createComment: {
      value: function(data) {
        const el = doc.createComment(data);
        setKey(el, key);
        return SecureElement(el, key);
      }
    },
    domain: {
      get: function() {
        return doc.domain;
      },
      set: function() {
        throw new Error('SecureDocument does not allow setting domain property.');
      }
    },
    querySelector: {
      value: function(selector) {
        return SecureElement.secureQuerySelector(doc, key, selector);
      }
    }
  });

  addEventTargetMethods(o, doc, key);

  function getCookieKey() {
    return `LSKey[${key['namespace']}]`;
  }

  defineProperty(o, 'cookie', {
    get: function() {
      const fullCookie = doc.cookie;
      const entries = fullCookie.split(';');
      const cookieKey = getCookieKey();
      // filter out cookies that do not match current namespace
      const nsFiltered = entries.filter(val => {
        const left = val.split('=')[0].trim();
        return left.indexOf(cookieKey) === 0;
      });
      // strip LockerService key before returning to user land
      const keyFiltered = nsFiltered.map(val => val.trim().substring(cookieKey.length));
      return keyFiltered.join('; ');
    },
    set: function(cookie) {
      const chunks = cookie.split(';');
      const entry = chunks[0].split('=');
      const newKey = getCookieKey() + entry[0];
      chunks[0] = `${newKey}=${entry[1]}`;
      const newCookie = chunks.join(';');
      doc.cookie = newCookie;
    }
  });

  ['implementation'].forEach(
    // These are direct passthrough's and should never be wrapped in a SecureObject
    name =>
      Object.defineProperty(o, name, {
        enumerable: true,
        value: doc[name]
      })
  );

  SecureObject.addPrototypeMethodsAndProperties(metadata$5, o, doc, key);

  setRef(o, doc, key);
  addToCache(doc, o, key);
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureLocation(loc, key) {
  let o = getFromCache(loc, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return loc.href;
      }
    }
  });

  [
    'href',
    'protocol',
    'host',
    'hostname',
    'port',
    'pathname',
    'search',
    'hash',
    'username',
    'password',
    'origin'
  ].forEach(property => SecureObject.addPropertyIfSupported(o, loc, property));

  ['reload', 'replace'].forEach(method => SecureObject.addMethodIfSupported(o, loc, method));

  /**
   * When a location.assign() call is found the href provided is evaluated
   * to ensure it is a legal scheme. 'http' and 'https' are considered
   * legal, while other schemes will throw an error because they present a possibility for
   * un-intended script execution.
   */
  SecureObject.addMethodIfSupported(o, loc, 'assign', {
    beforeCallback: function(href) {
      if (href && typeof href === 'string' && href.length > 1) {
        const dummy = document.createElement('a');
        dummy.href = href;

        if (dummy.protocol === 'http:' || dummy.protocol === 'https:') {
          if (!isSameLocation(window.location, dummy)) {
            if (!confirmNavigationAwayFromCurrentDomain()) {
              throw new error('User opted not to exit the current domain');
            }
          }
          return href;
        }

        throw new error('SecureLocation.assign only supports http://, https:// schemes.');
      }
      return undefined;
    }
  });

  setRef(o, loc, key);
  addToCache(loc, o, key);
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let addPropertiesHook$1;
function registerAddPropertiesHook$1(hook) {
  addPropertiesHook$1 = hook;
}

function SecureNavigator(navigator, key) {
  let o = getFromCache(navigator, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureNavigator: ${navigator}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  [
    'appCodeName',
    'appName',
    'appVersion',
    'cookieEnabled',
    'geolocation',
    'language',
    'onLine',
    'platform',
    'product',
    'userAgent'
  ].forEach(name => SecureObject.addPropertyIfSupported(o, navigator, name));

  if (addPropertiesHook$1) {
    addPropertiesHook$1(o, navigator, key);
  }

  setRef(o, navigator, key);
  addToCache(navigator, o, key);
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureXMLHttpRequest(key) {
  // Create a new closure constructor for new XHMLHttpRequest() syntax support that captures the key
  return function() {
    const xhr = new XMLHttpRequest();

    const o = create$1(null, {
      toString: {
        value: function() {
          return `SecureXMLHttpRequest: ${xhr} { key: ${JSON.stringify(key)} }`;
        }
      }
    });

    // Properties
    [
      'readyState',
      'status',
      'statusText',
      'response',
      'responseType',
      'responseText',
      'responseURL',
      'timeout',
      'withCredentials',
      'upload',
      'UNSENT',
      'OPENED',
      'HEADERS_RECEIVED',
      'LOADING',
      'DONE'
    ].forEach(name => SecureObject.addPropertyIfSupported(o, xhr, name));

    SecureObject.addPropertyIfSupported(o, xhr, 'responseXML', {
      afterGetCallback: function(value) {
        return value;
      }
    });

    // Event handlers
    [
      'onloadstart',
      'onprogress',
      'onabort',
      'onerror',
      'onload',
      'ontimeout',
      'onloadend',
      'onreadystatechange'
    ].forEach(name =>
      defineProperty(o, name, {
        set: function(callback) {
          xhr[name] = function(e) {
            callback.call(o, e && SecureDOMEvent(e, key));
          };
        }
      })
    );

    defineProperties(o, {
      abort: SecureObject.createFilteredMethod(o, xhr, 'abort'),

      addEventListener: createAddEventListenerDescriptor(o, xhr, key),

      open: {
        enumerable: true,
        writable: true,
        value: function() {
          const normalizer = document.createElement('a');
          normalizer.setAttribute('href', arguments[1]);

          // Order of operations are important!
          let pathname = normalizer.pathname;
          pathname = decodeURIComponent(pathname);
          pathname = pathname.toLowerCase();

          if (pathname.includes('/aura')) {
            throw new error(
              `SecureXMLHttpRequest.open cannot be used with Aura framework internal API endpoints ${
                arguments[1]
              }!`
            );
          }

          arguments[1] = normalizer.getAttribute('href');

          return xhr.open.apply(xhr, arguments);
        }
      },

      send: SecureObject.createFilteredMethod(o, xhr, 'send'),

      getAllResponseHeaders: SecureObject.createFilteredMethod(o, xhr, 'getAllResponseHeaders'),
      getResponseHeader: SecureObject.createFilteredMethod(o, xhr, 'getResponseHeader'),

      setRequestHeader: SecureObject.createFilteredMethod(o, xhr, 'setRequestHeader'),

      overrideMimeType: SecureObject.createFilteredMethod(o, xhr, 'overrideMimeType')
    });

    setRef(o, xhr, key);

    return freeze(o);
  };
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureMutationObserver(key) {
  function filterRecords(st, records) {
    const filtered = [];

    records.forEach(record => {
      if (hasAccess(st, record.target)) {
        filtered.push(SecureObject.filterEverything(st, record));
      }
    });

    return filtered;
  }

  // Create a new closure constructor for new MutationObserver() syntax support that captures the key
  return function(callback) {
    const o = create$1(null);

    const observer = new MutationObserver(records => {
      const filtered = filterRecords(o, records);
      if (filtered.length > 0) {
        callback(filtered);
      }
    });

    defineProperties(o, {
      toString: {
        value: function() {
          return `SecureMutationObserver: ${observer} { key: ${JSON.stringify(key)} }`;
        }
      },

      observe: SecureObject.createFilteredMethod(o, observer, 'observe', { rawArguments: true }),
      disconnect: SecureObject.createFilteredMethod(o, observer, 'disconnect'),

      takeRecords: {
        writable: true,
        value: function() {
          return filterRecords(o, observer['takeRecords']());
        }
      }
    });

    setRef(o, observer, key);

    return freeze(o);
  };
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureNotification(key) {
  // Create a new closure constructor for new Notification() syntax support that captures the key
  return function(title, options) {
    const notification = new Notification(title, options);

    const o = create$1(null, {
      toString: {
        value: function() {
          return `SecureNotification: ${notification} { key: ${JSON.stringify(key)} }`;
        }
      }
    });

    // Properties
    [
      'actions',
      'badge',
      'body',
      'data',
      'dir',
      'lang',
      'tag',
      'icon',
      'image',
      'requireInteraction',
      'silent',
      'timestamp',
      'title',
      'vibrate',
      'noscreen',
      'renotify',
      'sound',
      'sticky'
    ].forEach(name => SecureObject.addPropertyIfSupported(o, notification, name));

    // Event handlers
    ['onclick', 'onerror'].forEach(name =>
      defineProperty(o, name, {
        set: function(callback) {
          notification[name] = function(e) {
            callback.call(o, e && SecureDOMEvent(e, key));
          };
        }
      })
    );

    defineProperties(o, {
      close: SecureObject.createFilteredMethod(o, notification, 'close')
    });

    addEventTargetMethods(o, notification, key);

    setRef(o, notification, key);

    return freeze(o);
  };
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureStorage(storage, type, key) {
  let o = getFromCache(storage, key);
  if (o) {
    return o;
  }

  // Read existing key to synthetic key index from storage
  const stringizedKey = JSON.stringify(key);
  const nextSyntheticKey = `LSSNextSynthtic:${type}`;
  const storedIndexKey = `LSSIndex:${type}${stringizedKey}`;
  let nameToSyntheticRaw;
  try {
    nameToSyntheticRaw = storage.getItem(storedIndexKey);
  } catch (e) {
    // There is a bug in google chrome where localStorage becomes inaccessible.
    // Don't fast fail and break all applications. Defer the exception throwing to when the app actually uses localStorage
  }
  let nameToSynthetic = nameToSyntheticRaw ? JSON.parse(nameToSyntheticRaw) : {};

  function persistSyntheticNameIndex() {
    // Persist the nameToSynthetic index
    const stringizedIndex = JSON.stringify(nameToSynthetic);
    storage.setItem(storedIndexKey, stringizedIndex);
  }

  function getSynthetic(name) {
    let synthetic = nameToSynthetic[name];
    if (!synthetic) {
      const nextSynthticRaw = storage.getItem(nextSyntheticKey);
      let nextSynthetic = nextSynthticRaw ? Number(nextSynthticRaw) : 1;

      synthetic = nextSynthetic++;

      // Persist the next synthetic counter
      storage.setItem(nextSyntheticKey, nextSynthetic);

      nameToSynthetic[name] = synthetic;

      persistSyntheticNameIndex();
    }

    return synthetic;
  }

  function forgetSynthetic(name) {
    const synthetic = getSynthetic(name);
    if (synthetic) {
      delete nameToSynthetic[name];
      persistSyntheticNameIndex();
    }
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureStorage: ${type} { key: ${JSON.stringify(key)} }`;
      }
    },

    length: {
      get: function() {
        return Object.keys(nameToSynthetic).length;
      }
    },

    getItem: {
      value: function(name) {
        const synthetic = getSynthetic(name);
        return synthetic ? storage.getItem(synthetic) : null;
      }
    },

    setItem: {
      value: function(name, value) {
        const synthetic = getSynthetic(name);
        storage.setItem(synthetic, value);
      }
    },

    removeItem: {
      value: function(name) {
        const syntheticKey = getSynthetic(name);
        if (syntheticKey) {
          storage.removeItem(syntheticKey);
          forgetSynthetic(name);
        }
      }
    },

    key: {
      value: function(index) {
        return Object.keys(nameToSynthetic)[index];
      }
    },

    clear: {
      value: function() {
        Object.keys(nameToSynthetic).forEach(name => {
          const syntheticKey = getSynthetic(name);
          storage.removeItem(syntheticKey);
        });

        // Forget all synthetic
        nameToSynthetic = {};
        storage.removeItem(storedIndexKey);
      }
    }
  });

  setRef(o, storage, key);
  addToCache(storage, o, key);
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// For URL, we only need to tame one static method. That method is on the
// window.URL primordial and disappears from instances of URL. We only create
// the secure object and we will let the deep freeze operation make it tamper
// proof.

// Taming of URL createObjectURL will not be necessary on webkit
// "CSP rules ignored when a page navigates to a blob URL" is declassified,
// https://bugs.webkit.org/show_bug.cgi?id=174883

// and once the correct behavior on Edge is confirmed (curently in development)
// https://developer.microsoft.com/en-us/microsoft-edge/platform/status/urlapi/

// Only FireFox implements the correct behavior.

function SecureURL(raw) {
  const SecureURLMethods = create$1(null, {
    createObjectURL: {
      value: function(object) {
        if (Object.prototype.toString.call(object) === '[object Blob]') {
          // do not use any Blob instance that Locker hasn't looked at prior to this
          if (!isSecureBlob(object)) {
            throw new error('Unrecognized object');
          }
        }
        // IMPORTANT: thisArg is the target of the proxy.
        return raw.createObjectURL(object);
      }
    },
    toString: {
      value: function() {
        return `SecureURL: ${Object.prototype.toString.call(raw)}`;
      }
    }
  });

  return new Proxy(raw, {
    get: function(target, name) {
      // Give priority to the overritten methods.
      let desc = getOwnPropertyDescriptor(SecureURLMethods, name);
      if (desc === undefined) {
        desc = getOwnPropertyDescriptor(target, name);
      }
      if (desc === undefined || desc.value === undefined) {
        return undefined;
      }
      // Properties not found the object are not static.
      if (Object.keys(target).indexOf(name) < 0) {
        return desc.value;
      }
      // Prevent static methods from executing in the context of the proxy.
      return function() {
        return desc.value.apply(undefined, arguments);
      };
    },
    set: function() {
      return true;
    }
  });
}

const HTML_MAX_BUF_SIZE = 32768;

const WHITELISTED_MIME_TYPES = [
  'application/octet-stream',
  'application/json',
  'video/',
  'audio/',
  'image/',
  'font/',
  'text/plain',
  'text/markdown'
];

const HTML_MIME_TYPES = ['text/html', 'image/svg+xml', 'text/xml'];

const REGEX_VALID_MIME_TYPE = /^[a-z]+\/[a-z+-]+$/;

function sanitizeHTMLParts(arr) {
  const out = [];
  let i = 0;
  do {
    let entry = arr[i];
    if (typeof entry !== 'string') {
      entry = ab2str(entry);
    }
    entry = DOMPurify.sanitize(entry, domPurifyConfig);
    out.push(entry);
    i += 1;
  } while (i < arr.length);
  return out;
}

function isWhitelistedMIMEType(type = '') {
  // avoid MIME types which try to escape using special characters
  // Reason: W-4896359
  if (!REGEX_VALID_MIME_TYPE.test(type)) {
    return false;
  }

  for (let i = 0; i < WHITELISTED_MIME_TYPES.length; i++) {
    if (type.startsWith(WHITELISTED_MIME_TYPES[i], 0)) {
      return true;
    }
  }
  return false;
}

function isSafeArrayBuffer(buf) {
  if (buf.byteLength > HTML_MAX_BUF_SIZE) {
    warn(`Content validation failed. Max size is ${HTML_MAX_BUF_SIZE}`);
    return false;
  }
  return true;
}

/**
 * There are no relible ways to convert syncronously
 * a blob back to a string. Disallow until
 * <rdar://problem/33575448> is declassified
 * @returns {Boolean}
 */
function isSafeBlob() {
  return false;
}

/**
 * Validates if all blobParts contain safe content.
 * @param {Array} blobParts
 * @return {Boolean}
 */
function canCreateFromHTML(blobParts) {
  if (blobParts && blobParts.length) {
    for (let i = 0; i < blobParts.length; i++) {
      const entry = blobParts[i];
      if (entry instanceof ArrayBuffer && !isSafeArrayBuffer(entry)) {
        return false;
      } else if (entry instanceof Blob && !isSafeBlob(entry)) {
        return false;
      }
    }
  }
  return true;
}

function SecureBlob(blobParts = [], opts) {
  // prevent array index accessor hijacking
  blobParts = [].concat(blobParts);

  // prevent property getters hijacking
  opts = assign({}, opts);

  // prevent shapeshifting attacks on type property
  opts.type = String(opts.type).toLowerCase();

  if (opts.type === 'undefined') {
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
    opts.type = 'application/octet-stream';
  }

  if (HTML_MIME_TYPES.includes(opts.type)) {
    if (canCreateFromHTML(blobParts)) {
      const instance = new Blob(sanitizeHTMLParts(blobParts), opts);

      // fix instanceof checks
      instance.constructor = SecureBlob;

      registerSecureBlob(instance, opts.type);
      return instance;
    }
    throw new error('Validation failed, cannot create Blob.');
  }

  if (isWhitelistedMIMEType(opts.type)) {
    // whitelisted MIME types do not need sanitization
    const instance = new Blob(blobParts, opts);

    // fix instanceof checks
    instance.constructor = SecureBlob;

    registerSecureBlob(instance, opts.type);
    return instance;
  }

  throw new error('Unsupported MIME type.');
}

SecureBlob.prototype = Blob.prototype;

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let addPropertiesHook;
function registerAddPropertiesHook$$1(hook) {
  addPropertiesHook = hook;
}

const metadata$$1 = {
  prototypes: {
    Window: {
      AnalyserNode: FUNCTION,
      AnimationEvent: FUNCTION,
      AppBannerPromptResult: FUNCTION,
      ApplicationCache: FUNCTION,
      ApplicationCacheErrorEvent: FUNCTION,
      Attr: RAW,
      Audio: CTOR,
      AudioBuffer: FUNCTION,
      AudioBufferSourceNode: FUNCTION,
      AudioContext: CTOR,
      AudioDestinationNode: FUNCTION,
      AudioListener: FUNCTION,
      AudioNode: FUNCTION,
      AudioParam: FUNCTION,
      AudioProcessingEvent: FUNCTION,
      AutocompleteErrorEvent: FUNCTION,
      BarProp: FUNCTION,
      BatteryManager: FUNCTION,
      BeforeInstallPromptEvent: FUNCTION,
      BeforeUnloadEvent: FUNCTION,
      BiquadFilterNode: FUNCTION,
      BlobEvent: FUNCTION,
      CDATASection: FUNCTION,
      CSS: FUNCTION,
      CSSFontFaceRule: FUNCTION,
      CSSGroupingRule: FUNCTION,
      CSSImportRule: FUNCTION,
      CSSKeyframeRule: FUNCTION,
      CSSKeyframesRule: FUNCTION,
      CSSMediaRule: FUNCTION,
      CSSNamespaceRule: FUNCTION,
      CSSPageRule: FUNCTION,
      CSSRule: FUNCTION,
      CSSRuleList: FUNCTION,
      CSSStyleDeclaration: FUNCTION,
      CSSStyleRule: FUNCTION,
      CSSStyleSheet: FUNCTION,
      CSSSupportsRule: FUNCTION,
      CSSViewportRule: FUNCTION,
      CanvasCaptureMediaStreamTrack: FUNCTION,
      CanvasGradient: FUNCTION,
      CanvasPattern: FUNCTION,
      CanvasRenderingContext2D: RAW,
      ChannelMergerNode: FUNCTION,
      ChannelSplitterNode: FUNCTION,
      CharacterData: FUNCTION,
      ClientRect: FUNCTION,
      ClientRectList: FUNCTION,
      ClipboardEvent: FUNCTION,
      CloseEvent: FUNCTION,
      Comment: CTOR,
      CompositionEvent: FUNCTION,
      ConvolverNode: FUNCTION,
      Credential: FUNCTION,
      CredentialsContainer: FUNCTION,
      Crypto: FUNCTION,
      CryptoKey: FUNCTION,
      CustomEvent: CTOR,
      DOMError: FUNCTION,
      DOMException: FUNCTION,
      DOMImplementation: FUNCTION,
      DOMParser: RAW, // W-4954203
      DOMStringList: FUNCTION,
      DOMStringMap: FUNCTION,
      DOMTokenList: FUNCTION,
      DataTransfer: FUNCTION,
      DataTransferItem: FUNCTION,
      DataTransferItemList: FUNCTION,
      DelayNode: FUNCTION,
      DeviceMotionEvent: FUNCTION,
      DeviceOrientationEvent: FUNCTION,
      Document: FUNCTION,
      DocumentFragment: FUNCTION,
      DocumentType: FUNCTION,
      DragEvent: FUNCTION,
      DynamicsCompressorNode: FUNCTION,
      ES6Promise: DEFAULT,
      Element: RAW,
      ErrorEvent: FUNCTION,
      Event: CTOR,
      EventSource: FUNCTION,
      EventTarget: RAW,
      FederatedCredential: FUNCTION,
      FileError: FUNCTION,
      FileList: RAW,
      FileReader: RAW,
      FocusEvent: FUNCTION,
      FontFace: FUNCTION,
      GainNode: FUNCTION,
      HTMLAllCollection: FUNCTION,
      HTMLAnchorElement: RAW,
      HTMLAreaElement: RAW,
      HTMLAudioElement: RAW,
      HTMLBRElement: RAW,
      HTMLBaseElement: RAW,
      HTMLBodyElement: RAW,
      HTMLButtonElement: RAW,
      HTMLCanvasElement: RAW,
      HTMLCollection: RAW,
      HTMLContentElement: RAW,
      HTMLDListElement: RAW,
      HTMLDataListElement: RAW,
      HTMLDetailsElement: RAW,
      HTMLDialogElement: RAW,
      HTMLDirectoryElement: RAW,
      HTMLDivElement: RAW,
      HTMLDocument: RAW,
      HTMLElement: RAW,
      HTMLEmbedElement: RAW,
      HTMLFieldSetElement: RAW,
      HTMLFontElement: RAW,
      HTMLFormControlsCollection: FUNCTION,
      HTMLFormElement: RAW,
      HTMLFrameElement: RAW,
      HTMLFrameSetElement: RAW,
      HTMLHRElement: RAW,
      HTMLHeadElement: RAW,
      HTMLHeadingElement: RAW,
      HTMLHtmlElement: RAW,
      HTMLIFrameElement: RAW,
      HTMLImageElement: RAW,
      HTMLInputElement: RAW,
      HTMLKeygenElement: RAW,
      HTMLLIElement: RAW,
      HTMLLabelElement: RAW,
      HTMLLegendElement: RAW,
      HTMLLinkElement: RAW,
      HTMLMapElement: RAW,
      HTMLMarqueeElement: RAW,
      HTMLMediaElement: RAW,
      HTMLMenuElement: RAW,
      HTMLMetaElement: RAW,
      HTMLMeterElement: RAW,
      HTMLModElement: RAW,
      HTMLOListElement: RAW,
      HTMLObjectElement: RAW,
      HTMLOptGroupElement: RAW,
      HTMLOptionElement: RAW,
      HTMLOptionsCollection: RAW,
      HTMLOutputElement: RAW,
      HTMLParagraphElement: RAW,
      HTMLParamElement: RAW,
      HTMLPictureElement: RAW,
      HTMLPreElement: RAW,
      HTMLProgressElement: RAW,
      HTMLQuoteElement: RAW,
      HTMLScriptElement: RAW,
      HTMLSelectElement: RAW,
      HTMLShadowElement: RAW,
      HTMLSourceElement: RAW,
      HTMLSpanElement: RAW,
      HTMLStyleElement: RAW,
      HTMLTableCaptionElement: RAW,
      HTMLTableCellElement: RAW,
      HTMLTableColElement: RAW,
      HTMLTableElement: RAW,
      HTMLTableRowElement: RAW,
      HTMLTableSectionElement: RAW,
      HTMLTemplateElement: RAW,
      HTMLTextAreaElement: RAW,
      HTMLTitleElement: RAW,
      HTMLTrackElement: RAW,
      HTMLUListElement: RAW,
      HTMLUnknownElement: RAW,
      HTMLVideoElement: RAW,
      HashChangeEvent: FUNCTION,
      IdleDeadline: FUNCTION,
      Image: CTOR,
      ImageBitmap: FUNCTION,
      ImageData: FUNCTION,
      Infinity: DEFAULT,
      InputDeviceCapabilities: FUNCTION,
      KeyboardEvent: FUNCTION,
      Location: FUNCTION,
      MIDIAccess: FUNCTION,
      MIDIConnectionEvent: FUNCTION,
      MIDIInput: FUNCTION,
      MIDIInputMap: FUNCTION,
      MIDIMessageEvent: FUNCTION,
      MIDIOutput: FUNCTION,
      MIDIOutputMap: FUNCTION,
      MIDIPort: FUNCTION,
      MediaDevices: DEFAULT,
      MediaElementAudioSourceNode: FUNCTION,
      MediaEncryptedEvent: FUNCTION,
      MediaError: FUNCTION,
      MediaKeyMessageEvent: FUNCTION,
      MediaKeySession: FUNCTION,
      MediaKeyStatusMap: FUNCTION,
      MediaKeySystemAccess: FUNCTION,
      MediaKeys: FUNCTION,
      MediaList: FUNCTION,
      MediaQueryList: FUNCTION,
      MediaQueryListEvent: FUNCTION,
      MediaRecorder: CTOR,
      MediaSource: FUNCTION,
      MediaStreamAudioDestinationNode: CTOR,
      MediaStreamAudioSourceNode: CTOR,
      MediaStreamEvent: CTOR,
      MediaStreamTrack: FUNCTION,
      MessageChannel: RAW,
      MessageEvent: RAW,
      MessagePort: RAW,
      MimeType: FUNCTION,
      MimeTypeArray: FUNCTION,
      MutationObserver: CTOR,
      MutationRecord: FUNCTION,
      MouseEvent: CTOR,
      NaN: DEFAULT,
      NamedNodeMap: FUNCTION,
      Navigator: FUNCTION,
      Node: RAW,
      NodeFilter: FUNCTION,
      NodeIterator: FUNCTION,
      NodeList: FUNCTION,
      OfflineAudioCompletionEvent: FUNCTION,
      OfflineAudioContext: FUNCTION,
      Option: CTOR,
      OscillatorNode: FUNCTION,
      PERSISTENT: DEFAULT,
      PageTransitionEvent: FUNCTION,
      PasswordCredential: FUNCTION,
      Path2D: FUNCTION,
      Performance: RAW,
      PerformanceEntry: FUNCTION,
      PerformanceMark: FUNCTION,
      PerformanceMeasure: FUNCTION,
      PerformanceNavigation: FUNCTION,
      PerformanceResourceTiming: FUNCTION,
      PerformanceTiming: FUNCTION,
      PeriodicWave: FUNCTION,
      PopStateEvent: FUNCTION,
      Presentation: FUNCTION,
      PresentationAvailability: FUNCTION,
      PresentationConnection: FUNCTION,
      PresentationConnectionAvailableEvent: FUNCTION,
      PresentationConnectionCloseEvent: FUNCTION,
      PresentationRequest: FUNCTION,
      ProcessingInstruction: FUNCTION,
      ProgressEvent: FUNCTION,
      PromiseRejectionEvent: FUNCTION,
      RTCCertificate: FUNCTION,
      RTCIceCandidate: CTOR,
      RTCSessionDescription: CTOR,
      RadioNodeList: FUNCTION,
      Range: FUNCTION,
      ReadableByteStream: FUNCTION,
      ReadableStream: FUNCTION,
      Request: FUNCTION,
      Response: FUNCTION,
      SVGAElement: FUNCTION,
      SVGAngle: FUNCTION,
      SVGAnimateElement: FUNCTION,
      SVGAnimateMotionElement: FUNCTION,
      SVGAnimateTransformElement: FUNCTION,
      SVGAnimatedAngle: FUNCTION,
      SVGAnimatedBoolean: FUNCTION,
      SVGAnimatedEnumeration: FUNCTION,
      SVGAnimatedInteger: FUNCTION,
      SVGAnimatedLength: FUNCTION,
      SVGAnimatedLengthList: FUNCTION,
      SVGAnimatedNumber: FUNCTION,
      SVGAnimatedNumberList: FUNCTION,
      SVGAnimatedPreserveAspectRatio: FUNCTION,
      SVGAnimatedRect: FUNCTION,
      SVGAnimatedString: FUNCTION,
      SVGAnimatedTransformList: FUNCTION,
      SVGAnimationElement: RAW,
      SVGCircleElement: RAW,
      SVGClipPathElement: RAW,
      SVGComponentTransferFunctionElement: RAW,
      SVGCursorElement: RAW,
      SVGDefsElement: RAW,
      SVGDescElement: RAW,
      SVGDiscardElement: RAW,
      SVGElement: RAW,
      SVGEllipseElement: RAW,
      SVGFEBlendElement: RAW,
      SVGFEColorMatrixElement: RAW,
      SVGFEComponentTransferElement: RAW,
      SVGFECompositeElement: RAW,
      SVGFEConvolveMatrixElement: RAW,
      SVGFEDiffuseLightingElement: RAW,
      SVGFEDisplacementMapElement: RAW,
      SVGFEDistantLightElement: RAW,
      SVGFEDropShadowElement: RAW,
      SVGFEFloodElement: RAW,
      SVGFEFuncAElement: RAW,
      SVGFEFuncBElement: RAW,
      SVGFEFuncGElement: RAW,
      SVGFEFuncRElement: RAW,
      SVGFEGaussianBlurElement: RAW,
      SVGFEImageElement: RAW,
      SVGFEMergeElement: RAW,
      SVGFEMergeNodeElement: RAW,
      SVGFEMorphologyElement: RAW,
      SVGFEOffsetElement: RAW,
      SVGFEPointLightElement: RAW,
      SVGFESpecularLightingElement: RAW,
      SVGFESpotLightElement: RAW,
      SVGFETileElement: RAW,
      SVGFETurbulenceElement: RAW,
      SVGFilterElement: RAW,
      SVGForeignObjectElement: RAW,
      SVGGElement: RAW,
      SVGGeometryElement: RAW,
      SVGGradientElement: RAW,
      SVGGraphicsElement: RAW,
      SVGImageElement: RAW,
      SVGLength: FUNCTION,
      SVGLengthList: FUNCTION,
      SVGLineElement: RAW,
      SVGLinearGradientElement: RAW,
      SVGMPathElement: RAW,
      SVGMarkerElement: RAW,
      SVGMaskElement: RAW,
      SVGMatrix: RAW,
      SVGMetadataElement: RAW,
      SVGNumber: FUNCTION,
      SVGNumberList: FUNCTION,
      SVGPathElement: RAW,
      SVGPatternElement: RAW,
      SVGPoint: FUNCTION,
      SVGPointList: FUNCTION,
      SVGPolygonElement: RAW,
      SVGPolylineElement: RAW,
      SVGPreserveAspectRatio: FUNCTION,
      SVGRadialGradientElement: RAW,
      SVGRect: FUNCTION,
      SVGRectElement: RAW,
      SVGSVGElement: RAW,
      SVGScriptElement: RAW,
      SVGSetElement: RAW,
      SVGStopElement: RAW,
      SVGStringList: FUNCTION,
      SVGStyleElement: RAW,
      SVGSwitchElement: RAW,
      SVGSymbolElement: RAW,
      SVGTSpanElement: RAW,
      SVGTextContentElement: RAW,
      SVGTextElement: RAW,
      SVGTextPathElement: RAW,
      SVGTextPositioningElement: RAW,
      SVGTitleElement: RAW,
      SVGTransform: FUNCTION,
      SVGTransformList: FUNCTION,
      SVGUnitTypes: FUNCTION,
      SVGUseElement: RAW,
      SVGViewElement: RAW,
      SVGViewSpec: FUNCTION,
      SVGZoomEvent: FUNCTION,
      Screen: FUNCTION,
      ScreenOrientation: FUNCTION,
      SecurityPolicyViolationEvent: FUNCTION,
      Selection: FUNCTION,
      SourceBuffer: FUNCTION,
      SourceBufferList: FUNCTION,
      SpeechSynthesisEvent: FUNCTION,
      SpeechSynthesisUtterance: FUNCTION,
      StyleSheet: FUNCTION,
      StyleSheetList: FUNCTION,
      SubtleCrypto: FUNCTION,
      TEMPORARY: DEFAULT,
      Text: CTOR,
      TextDecoder: FUNCTION,
      TextEncoder: RAW,
      TextEvent: FUNCTION,
      TextMetrics: FUNCTION,
      TextTrack: FUNCTION,
      TextTrackCue: FUNCTION,
      TextTrackCueList: FUNCTION,
      TextTrackList: FUNCTION,
      TimeRanges: RAW,
      Touch: FUNCTION,
      TouchEvent: FUNCTION,
      TouchList: FUNCTION,
      TrackEvent: FUNCTION,
      TransitionEvent: FUNCTION,
      TreeWalker: FUNCTION,
      UIEvent: FUNCTION,
      // Replaced by SecureURL
      // "URL":                                  RAW,
      URLSearchParams: FUNCTION,
      VTTCue: FUNCTION,
      ValidityState: FUNCTION,
      WaveShaperNode: FUNCTION,
      WebGLActiveInfo: FUNCTION,
      WebGLBuffer: FUNCTION,
      WebGLContextEvent: FUNCTION,
      WebGLFramebuffer: FUNCTION,
      WebGLProgram: FUNCTION,
      WebGLRenderbuffer: FUNCTION,
      WebGLRenderingContext: FUNCTION,
      WebGLShader: FUNCTION,
      WebGLShaderPrecisionFormat: FUNCTION,
      WebGLTexture: FUNCTION,
      WebGLUniformLocation: FUNCTION,
      WebKitAnimationEvent: FUNCTION,
      WebKitCSSMatrix: CTOR,
      WebKitTransitionEvent: FUNCTION,
      WebSocket: RAW,
      WheelEvent: FUNCTION,
      Window: FUNCTION,
      XMLDocument: FUNCTION,
      XMLHttpRequest: CTOR,
      XMLHttpRequestEventTarget: FUNCTION,
      XMLHttpRequestUpload: FUNCTION,
      XMLSerializer: CTOR,
      XPathEvaluator: FUNCTION,
      XPathExpression: FUNCTION,
      XPathResult: FUNCTION,
      XSLTProcessor: FUNCTION,
      alert: FUNCTION,
      atob: FUNCTION,
      blur: FUNCTION,
      btoa: FUNCTION,
      cancelAnimationFrame: FUNCTION,
      cancelIdleCallback: FUNCTION,
      captureEvents: FUNCTION,
      chrome: DEFAULT,
      clearInterval: FUNCTION,
      clearTimeout: FUNCTION,
      close: FUNCTION,
      closed: DEFAULT,
      confirm: FUNCTION,
      console: RAW,
      createImageBitmap: FUNCTION,
      crypto: DEFAULT,
      defaultStatus: DEFAULT,
      defaultstatus: DEFAULT,
      devicePixelRatio: DEFAULT,
      document: DEFAULT,
      fetch: FUNCTION,
      find: FUNCTION,
      focus: FUNCTION,
      frameElement: DEFAULT,
      frames: DEFAULT,
      getComputedStyle: FUNCTION,
      getMatchedCSSRules: FUNCTION,
      getSelection: FUNCTION,
      history: RAW,
      innerHeight: DEFAULT,
      innerWidth: DEFAULT,
      isSecureContext: DEFAULT,
      length: DEFAULT,
      localStorage: DEFAULT,
      locationbar: DEFAULT,
      matchMedia: FUNCTION,
      menubar: DEFAULT,
      moveBy: FUNCTION,
      moveTo: FUNCTION,
      name: DEFAULT,
      navigator: DEFAULT,
      offscreenBuffering: DEFAULT,
      onabort: EVENT,
      onanimationend: EVENT,
      onanimationiteration: EVENT,
      onanimationstart: EVENT,
      onautocomplete: EVENT,
      onautocompleteerror: EVENT,
      onbeforeunload: EVENT,
      onblur: EVENT,
      oncancel: EVENT,
      oncanplay: EVENT,
      oncanplaythrough: EVENT,
      onchange: EVENT,
      onclick: EVENT,
      onclose: EVENT,
      oncontextmenu: EVENT,
      oncuechange: EVENT,
      ondblclick: EVENT,
      ondevicemotion: EVENT,
      ondeviceorientation: EVENT,
      ondeviceorientationabsolute: EVENT,
      ondrag: EVENT,
      ondragend: EVENT,
      ondragenter: EVENT,
      ondragleave: EVENT,
      ondragover: EVENT,
      ondragstart: EVENT,
      ondrop: EVENT,
      ondurationchange: EVENT,
      onemptied: EVENT,
      onended: EVENT,
      onerror: EVENT,
      onfocus: EVENT,
      onhashchange: EVENT,
      oninput: EVENT,
      oninvalid: EVENT,
      onkeydown: EVENT,
      onkeypress: EVENT,
      onkeyup: EVENT,
      onlanguagechange: EVENT,
      onload: EVENT,
      onloadeddata: EVENT,
      onloadedmetadata: EVENT,
      onloadstart: EVENT,
      onmessage: EVENT,
      onmousedown: EVENT,
      onmouseenter: EVENT,
      onmouseleave: EVENT,
      onmousemove: EVENT,
      onmouseout: EVENT,
      onmouseover: EVENT,
      onmouseup: EVENT,
      onmousewheel: EVENT,
      onoffline: EVENT,
      ononline: EVENT,
      onpagehide: EVENT,
      onpageshow: EVENT,
      onpause: EVENT,
      onplay: EVENT,
      onplaying: EVENT,
      onpopstate: EVENT,
      onprogress: EVENT,
      onratechange: EVENT,
      onrejectionhandled: EVENT,
      onreset: EVENT,
      onresize: EVENT,
      onscroll: EVENT,
      onsearch: EVENT,
      onseeked: EVENT,
      onseeking: EVENT,
      onselect: EVENT,
      onshow: EVENT,
      onstalled: EVENT,
      onstorage: EVENT,
      onsubmit: EVENT,
      onsuspend: EVENT,
      ontimeupdate: EVENT,
      ontoggle: EVENT,
      ontransitionend: EVENT,
      ontouchcancel: EVENT,
      ontouchend: EVENT,
      ontouchmove: EVENT,
      ontouchstart: EVENT,
      onunhandledrejection: EVENT,
      onunload: EVENT,
      onvolumechange: EVENT,
      onwaiting: EVENT,
      onwheel: EVENT,
      open: FUNCTION,
      outerHeight: DEFAULT,
      outerWidth: DEFAULT,
      pageStartTime: DEFAULT,
      pageXOffset: DEFAULT,
      pageYOffset: DEFAULT,
      parent: DEFAULT,
      performance: RAW,
      personalbar: DEFAULT,
      postMessage: FUNCTION,
      print: FUNCTION,
      prompt: FUNCTION,
      releaseEvents: FUNCTION,
      requestAnimationFrame: FUNCTION,
      requestIdleCallback: FUNCTION,
      resizeBy: FUNCTION,
      resizeTo: FUNCTION,
      screen: RAW,
      screenLeft: DEFAULT,
      screenTop: DEFAULT,
      screenX: DEFAULT,
      screenY: DEFAULT,
      scroll: FUNCTION,
      scrollBy: FUNCTION,
      scrollTo: FUNCTION,
      scrollX: DEFAULT,
      scrollY: DEFAULT,
      scrollbars: DEFAULT,
      sessionStorage: DEFAULT,
      self: DEFAULT,
      setInterval: FUNCTION,
      setTimeout: FUNCTION,
      status: DEFAULT,
      statusbar: DEFAULT,
      stop: FUNCTION,
      styleMedia: DEFAULT,
      toolbar: DEFAULT,
      top: DEFAULT,
      window: DEFAULT
    },
    EventTarget: metadata$4
  }
};

function SecureWindow(sandbox, key) {
  const { realmRec: { unsafeGlobal: win } } = sandbox;

  let o = getFromCache(win, key);
  if (o) {
    return o;
  }

  // Create prototype to allow basic object operations like hasOwnProperty etc
  const props = getOwnPropertyDescriptors(Object.prototype);
  // Do not treat window like a plain object, $A.util.isPlainObject() returns true if we leave the constructor intact.
  delete props.constructor;
  const emptyProto = create$1(null, props);

  freeze(emptyProto);

  o = create$1(emptyProto, {
    document: {
      enumerable: true,
      value: SecureDocument(win.document, key)
    },
    window: {
      enumerable: true,
      get: function() {
        return o;
      }
    },
    MutationObserver: {
      enumerable: true,
      value: SecureMutationObserver(key)
    },
    navigator: {
      enumerable: true,
      writable: true,
      value: SecureNavigator(win.navigator, key)
    },
    XMLHttpRequest: {
      enumerable: true,
      value: SecureXMLHttpRequest(key)
    },
    setTimeout: {
      enumerable: true,
      value: function(callback) {
        return setTimeout.apply(
          win,
          [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(
            SecureObject.ArrayPrototypeSlice.call(arguments, 1)
          )
        );
      }
    },
    setInterval: {
      enumerable: true,
      value: function(callback) {
        return setInterval.apply(
          win,
          [SecureObject.FunctionPrototypeBind.call(callback, o)].concat(
            SecureObject.ArrayPrototypeSlice.call(arguments, 1)
          )
        );
      }
    },
    location: {
      enumerable: true,
      get: function() {
        return SecureLocation(win.location, key);
      },
      set: function(value) {
        const ret = (win.location.href = value);
        return ret;
      }
    },
    URL: {
      enumerable: true,
      value: SecureURL(win.URL)
    },
    toString: {
      value: function() {
        return `SecureWindow: ${win}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  SecureObject.addMethodIfSupported(o, win, 'getComputedStyle', {
    rawArguments: true
  });

  ['outerHeight', 'outerWidth'].forEach(name => SecureObject.addPropertyIfSupported(o, win, name));

  ['scroll', 'scrollBy', 'scrollTo'].forEach(name =>
    SecureObject.addMethodIfSupported(o, win, name)
  );

  ['open'].forEach(name =>
    SecureObject.addMethodIfSupported(o, win, name, {
      beforeCallback: function(url) {
        // If an url was provided to window.open()
        if (url) {
          // coerce argument to string and sanitize.
          const urlString = sanitizeURLForElement(url);
          // try to open only if we have a non-empty string
          if (urlString.length > 1) {
            if (!isValidURLScheme(urlString)) {
              throw new error(
                'SecureWindow.open supports http://, https:// schemes and relative urls.'
              );
            }
          }
        }
      }
    })
  );

  if ('localStorage' in win) {
    defineProperty(o, 'localStorage', {
      enumerable: true,
      value: SecureStorage(win.localStorage, 'LOCAL', key)
    });
  }
  if ('sessionStorage' in win) {
    defineProperty(o, 'sessionStorage', {
      enumerable: true,
      value: SecureStorage(win.sessionStorage, 'SESSION', key)
    });
  }

  if ('FormData' in win) {
    let formDataValueOverride;
    defineProperty(o, 'FormData', {
      get: function() {
        return (
          formDataValueOverride ||
          function() {
            const args = SecureObject.ArrayPrototypeSlice.call(arguments);
            // make sure we have access to any <form> passed in to constructor
            let form;
            if (args.length > 0) {
              form = args[0];
              verifyAccess(o, form);
            }

            const rawArgs = form ? [getRef(form, getKey(form))] : [];
            const cls = win['FormData'];
            if (typeof cls === 'function') {
              return new (Function.prototype.bind.apply(
                window['FormData'],
                [null].concat(rawArgs)
              ))();
            }
            return new cls(rawArgs);
          }
        );
      },
      set: function(value) {
        formDataValueOverride = value;
      }
    });
  }

  if ('Notification' in win) {
    let notificationValueOverride;
    defineProperty(o, 'Notification', {
      get: function() {
        if (notificationValueOverride) {
          return notificationValueOverride;
        }
        const notification = SecureNotification(key);
        if ('requestPermission' in win['Notification']) {
          defineProperty(notification, 'requestPermission', {
            enumerable: true,
            value: function(callback) {
              return Notification['requestPermission'](callback);
            }
          });
        }
        if ('permission' in win['Notification']) {
          defineProperty(notification, 'permission', {
            enumerable: true,
            value: Notification['permission']
          });
        }
        return notification;
      },
      set: function(value) {
        notificationValueOverride = value;
      }
    });
  }

  if ('Blob' in win) {
    defineProperty(o, 'Blob', {
      enumerable: true,
      value: SecureBlob
    });
  }

  if ('File' in win) {
    let valueOverride;
    defineProperty(o, 'File', {
      get: function() {
        return (
          valueOverride ||
          function() {
            const cls = win['File'];
            const args = Array.prototype.slice.call(arguments);
            let result;

            const scriptTagsRegex = /<script[\s\S]*?>[\s\S]*?<\/script[\s]*?>/gi;
            if (scriptTagsRegex.test(args[0])) {
              throw new error('File creation failed: <script> tags are blocked');
            }
            if (typeof cls === 'function') {
              //  Function.prototype.bind.apply is being used to invoke the constructor and to pass all the arguments provided by the caller
              // TODO Switch to ES6 when available https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator
              result = new (Function.prototype.bind.apply(cls, [null].concat(args)))();
            } else {
              // For browsers that use a constructor that's not a function, invoke the constructor directly.
              // For example, on Mobile Safari window["Blob"] returns an object called BlobConstructor
              // Invoke constructor with specific arguments, handle up to 3 arguments(Blob accepts 2 param, File accepts 3 param)
              switch (args.length) {
                case 0:
                  result = new cls();
                  break;
                case 1:
                  result = new cls(args[0]);
                  break;
                case 2:
                  result = new cls(args[0], args[1]);
                  break;
                case 3:
                  result = new cls(args[0], args[1], args[2]);
                  break;
                default:
                  break;
              }
            }
            return result;
          }
        );
      },
      set: function(value) {
        valueOverride = value;
      }
    });
  }

  addEventTargetMethods(o, win, key);

  // Has to happen last because it depends on the secure getters defined above that require the object to be keyed
  stdlib.forEach(
    // These are direct passthrough's and should never be wrapped in a SecureObject
    // They are non-writable to make them compatible with the evaluator.
    name =>
      defineProperty(o, name, {
        enumerable: true,
        value: win[name]
      })
  );

  if (addPropertiesHook) {
    addPropertiesHook(o, win, key);
  }

  SecureObject.addPrototypeMethodsAndProperties(metadata$$1, o, win, key);

  setRef(o, win, key);
  addToCache(win, o, key);
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureRTCPeerConnection(raw, key) {
  const SecureConstructor = function(configuration) {
    const rtc = new raw(configuration);
    const o = create$1(null, {
      toString: {
        value: function() {
          return `SecureRTCPeerConnection: ${rtc}{ key: ${JSON.stringify(key)} }`;
        }
      }
    });
    setRef(o, rtc, key);
    // Reference to the original event target functions
    const originalAddEventListener = rtc['addEventListener'];
    const originalDispatchEvent = rtc['dispatchEvent'];
    const originalRemoveEventListener = rtc['removeEventListener'];
    const options = { rawArguments: true };
    // Override the event target functions to handled wrapped arguments
    defineProperties(rtc, {
      addEventListener: {
        writable: true,
        value: function(event, callback, useCapture) {
          if (!callback) {
            return;
          }
          let sCallback = getFromCache(callback, key);
          if (!sCallback) {
            sCallback = function(e) {
              verifyAccess(o, callback, true);
              const se = e && SecureDOMEvent(e, key);
              callback.call(o, se);
            };
            addToCache(callback, sCallback, key);
            setKey(callback, key);
          }
          originalAddEventListener.call(rtc, event, sCallback, useCapture);
        }
      },
      dispatchEvent: {
        enumerable: true,
        writable: true,
        value: function() {
          const filteredArgs = SecureObject.filterArguments(o, arguments, options);
          let fnReturnedValue = originalDispatchEvent.apply(rtc, filteredArgs);
          if (options && options.afterCallback) {
            fnReturnedValue = options.afterCallback(fnReturnedValue);
          }
          return SecureObject.filterEverything(o, fnReturnedValue, options);
        }
      },
      removeEventListener: {
        writable: true,
        value: function(type, listener, removeOption) {
          const sCallback = getFromCache(listener, key);
          originalRemoveEventListener.call(rtc, type, sCallback, removeOption);
        }
      }
    });
    return rtc;
  };
  SecureConstructor.prototype = raw.prototype;
  return SecureConstructor;
}

// TODO: unused

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// import PiercingService from './PiercingService';
let isNodeOwnedByComponent = () => true;
let unwrap$2 = value => value;
let getCustomElementComponent = () => undefined;
let isCustomElement = () => false;

/* const service = {
  piercing: PiercingService
};
 */
function registerEngineAPI(api) {
  if (api) {
    /* if (api.registerEngineServices) {
      api.registerEngineServices(service);
    } */
    if (api.isNodeOwnedByComponent) {
      isNodeOwnedByComponent = api.isNodeOwnedByComponent;
    }
    if (api.unwrap) {
      unwrap$2 = api.unwrap;
    }
    if (api.getCustomElementComponent) {
      getCustomElementComponent = api.getCustomElementComponent;
    }

    if (api.isCustomElement) {
      isCustomElement = api.isCustomElement;
    }
  }
}

function customElementHook$1(el, prototype, tagNameSpecificConfig, key) {
  /**
   * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
   * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
   * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
   */
  function deepUnfilterMethodArguments(st, baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (isArray(value)) {
        value = deepUnfilterMethodArguments(st, [], value);
      } else if (isPlainObject(value)) {
        value = deepUnfilterMethodArguments(st, {}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            value = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          value = deepUnfilterMethodArguments(st, {}, value);
        }
      } else {
        value = SecureObject.filterEverything(st, value, { defaultKey: key });
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  if (isCustomElement(el)) {
    let component = getCustomElementComponent(el);
    if (component) {
      let methodOptions = {};
      // If callee is a lockerized component, then extract the raw component
      if (isProxy(component)) {
        component = SecureObject.getRaw(component);
        methodOptions = { defaultKey: key };
      } else {
        // If callee is a non-lockerized component, then extract the raw arguments
        methodOptions = {
          defaultKey: key,
          unfilterEverything: function(args) {
            const st = this;
            return deepUnfilterMethodArguments(st, [], args);
          }
        };
      }
      if (component) {
        const publicMethods = component.constructor.publicMethods;
        for (let i = 0; publicMethods && i < publicMethods.length; i++) {
          tagNameSpecificConfig[publicMethods[i]] = SecureObject.createFilteredMethodStateless(
            publicMethods[i],
            prototype,
            methodOptions
          );
        }
        const publicProps =
          component.constructor.publicProps && Object.keys(component.constructor.publicProps);
        for (let i = 0; publicProps && i < publicProps.length; i++) {
          tagNameSpecificConfig[publicProps[i]] = SecureObject.createFilteredPropertyStateless(
            publicProps[i],
            prototype,
            methodOptions
          );
        }
      }
    }
  }
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function SecureTemplate(root, key) {
  let o = getFromCache(root, key);
  if (o) {
    return o;
  }

  o = new Proxy(root, SecureTemplate.getProxyHandler(key));

  setRef(o, root, key);
  addToCache(root, o, key);
  registerProxy(o);

  return o;
}

const KEY_TO_HANLDER$1 = new Map();
SecureTemplate.getProxyHandler = function(key) {
  let handler = KEY_TO_HANLDER$1.get(key);
  if (!handler) {
    handler = {
      get: function(target, property) {
        let ret;
        switch (property) {
          case 'toString':
            ret = function() {
              return `SecureTemplate: ${target}{ key: ${JSON.stringify(key)} }`;
            };
            break;
          case 'querySelector':
            ret = function(selector) {
              const engineResult = target.querySelector(selector);
              const rawResult = unwrap$2(engineResult);
              // Trust the result given by lwc.
              trust$1(handler, rawResult);
              return SecureObject.filterEverything(handler, rawResult);
            };
            break;
          case 'querySelectorAll':
            ret = function(selector) {
              const engineResult = target.querySelectorAll(selector);
              const rawResult = unwrap$2(engineResult);
              // Trust the result given by lwc.
              trust$1(rawResult, handler);
              rawResult.forEach(node => trust$1(handler, node));
              return SecureObject.filterEverything(handler, rawResult);
            };
            break;
          case 'addEventListener':
            ret = createAddEventListenerDescriptor(handler, target, key).value;
            break;
          case 'removeEventListener':
            ret = function(event, listener) {
              target['removeEventListner'](event, SecureObject.filterEverything(handler, listener));
            };
            break;
          case 'host':
            ret = SecureObject.filterEverything(handler, target['host']);
            break;
          default:
            ret = target[property];
        }
        return ret;
      }
    };
  }
  setKey(handler, key);
  Object.freeze(handler);
  KEY_TO_HANLDER$1.set(key, handler);
  return handler;
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function SecureLWCElementGenerator(LWCElement, key) {
  let o = getFromCache(LWCElement, key);
  if (o) {
    return o;
  }
  o = SecureLWCElementGenerator.getWrappedLWCElement(key, LWCElement);
  setKey(o, key);
  registerProxy(o);

  setRef(o, LWCElement, key);
  addToCache(LWCElement, o, key);
  return o;
}

const KEY_TO_SECURELWCELEMENT = new Map();
const KEY_TO_HANLDER = new Map();

function createSpecialFilteredMethod(key, target, methodName) {
  return function() {
    const st = getFromCache(target, key);
    const filteredArgs = SecureObject.filterArguments(st, arguments);
    const fnReturnedValue = target[methodName].apply(st, filteredArgs);
    return SecureObject.filterEverything(st, fnReturnedValue);
  };
}

SecureLWCElementGenerator.proxyHandler = function(key) {
  let handler = KEY_TO_HANLDER.get(key);
  if (!handler) {
    handler = {
      get: function(target, property) {
        let ret;
        switch (property) {
          case 'toString':
            ret = function() {
              return `SecureLWCElement: ${target}{ key: ${JSON.stringify(key)} }`;
            };
            break;
          case 'dispatchEvent':
            ret = SecureObject.createFilteredMethod(handler, target, 'dispatchEvent', {
              rawArguments: true
            }).value;
            break;
          case 'addEventListener':
            ret = createAddEventListenerDescriptor(handler, target, key).value;
            break;
          case 'removeEventListener':
            ret = function(event, listener) {
              target['removeEventListner'](event, SecureObject.filterEverything(handler, listener));
            };
            break;
          case 'querySelector':
            ret = function(selector) {
              const engineResult = target.querySelector(selector);
              const rawResult = unwrap$2(engineResult);
              // Trust the result given by lwc.
              trust$1(handler, rawResult);
              return SecureObject.filterEverything(handler, rawResult);
            };
            break;
          case 'root':
          case 'template':
            ret = SecureTemplate(target[property], key);
            break;
          default:
            if (
              target.constructor.publicMethods &&
              target.constructor.publicMethods.indexOf(property) !== -1
            ) {
              ret = createSpecialFilteredMethod(key, target, property);
            } else if (
              target.constructor.publicProps &&
              Object.keys(target.constructor.publicProps).indexOf(property) !== -1
            ) {
                // temp bypass
              ret = target[property];
            } else if (
              target.constructor.track &&
              Object.keys(target.constructor.track).indexOf(property) !== -1
            ) {
                // temp bypass
              ret = target[property];
            } else {
              ret = target[property];
            }
          // TODO: setAttributeNS, setAttribute, getAttributeNS, getAttribute, getBoundingClientRect, classList
        }
        return ret;
      },
      set: function(target, property, value) {
        if (
          target.constructor.publicProps &&
          Object.keys(target.constructor.publicProps).indexOf(property) !== -1
        ) {
            // temp bypass 
          target[property] = value;
        } else if (
          target.constructor.track &&
          Object.keys(target.constructor.track).indexOf(property) !== -1
        ) {
            // temp bypass
          target[property] = value;
        } else {
          target[property] = value;
        }
        return true;
      }
    };
  }
  setKey(handler, key);
  return handler;
};

SecureLWCElementGenerator.getWrappedLWCElement = function(key, LWCElement) {
  let secureClass = KEY_TO_SECURELWCELEMENT.get(key);
  if (!secureClass) {
    secureClass = class SecureLWCElement extends LWCElement {
      constructor(...args) {
        super(...args);
        const proxiedInstance = new Proxy(this, SecureLWCElementGenerator.proxyHandler(key));
        // Cache the wrapped instance for future lookups
        setRef(proxiedInstance, this, key);
        addToCache(this, proxiedInstance, key);
        registerProxy(proxiedInstance);

        return proxiedInstance;
      }
    };
  }
  setKey(secureClass, key);
  return secureClass;
};

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureEngine(engine, key) {
  const o = create$1(null, {
    Element: {
      enumerable: true,
      value: SecureLWCElementGenerator(engine.Element, key)
    },
    toString: {
      value: function() {
        return 'SecureEngine';
      }
    }
  });
  freeze(o);
  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureAura(AuraInstance, key) {
  let o = getFromCache(AuraInstance, key);
  if (o) {
    return o;
  }

  /*
     * Deep traverse an object and unfilter any Locker proxies. Isolate this logic here for the component
     * creation APIs rather than a more general solution to avoid overly aggressive unfiltering that may open
     * new security holes.
     */
  function deepUnfilterArgs(baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (value !== undefined && value !== null) {
        if (isArray(value) || isPlainObject(value)) {
          const branchValue = baseObject[property];
          baseObject[property] = deepUnfilterArgs(branchValue, value);
          continue;
        }
      }
      if (isProxy(value)) {
        value = getRef(value, key);
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  const su = create$1(null);
  const sls = create$1(null);
  o = create$1(null, {
    util: {
      writable: true,
      enumerable: true,
      value: su
    },
    localizationService: {
      writable: true,
      enumerable: true,
      value: sls
    },
    getCallback: {
      value: function(f) {
        // If the results of $A.getCallback() is wired up to an event handler, passed as an attribute or aura event attribute etc it will get
        // filtered and wrapped with the caller's perspective at that time.
        return AuraInstance.getCallback(f);
      }
    },
    toString: {
      value: function() {
        return `SecureAura: ${AuraInstance}{ key: ${JSON.stringify(key)} }`;
      }
    },

    createComponent: {
      enumerable: true,
      writable: true,
      value: function(type, attributes, callback) {
        // copy attributes before modifying so caller does not see unfiltered results
        const attributesCopy = AuraInstance.util.apply({}, attributes, true, true);
        const filteredArgs =
          attributes && AuraInstance.util.isObject(attributes)
            ? deepUnfilterArgs(attributesCopy, attributes)
            : attributes;
        const fnReturnedValue = AuraInstance.createComponent(
          type,
          filteredArgs,
          SecureObject.filterEverything(o, callback)
        );
        return SecureObject.filterEverything(o, fnReturnedValue);
      }
    },

    createComponents: {
      enumerable: true,
      writable: true,
      value: function(components, callback) {
        let filteredComponents = [];
        if (isArray(components)) {
          for (let i = 0; i < components.length; i++) {
            const filteredComponent = [];
            filteredComponent[0] = components[i][0];
            // copy attributes before modifying so caller does not see unfiltered results
            const attributesCopy = AuraInstance.util.apply({}, components[i][1], true, true);
            filteredComponent[1] = deepUnfilterArgs(attributesCopy, components[i][1]);
            filteredComponents.push(filteredComponent);
          }
        } else {
          filteredComponents = components;
        }
        const fnReturnedValue = AuraInstance.createComponents(
          filteredComponents,
          SecureObject.filterEverything(o, callback)
        );
        return SecureObject.filterEverything(o, fnReturnedValue);
      }
    }
  });

  // SecureAura methods and properties
  ['enqueueAction'].forEach(name =>
    defineProperty(
      o,
      name,
      SecureObject.createFilteredMethod(o, AuraInstance, name, { rawArguments: true })
    )
  );

  ['get', 'getComponent', 'getReference', 'getRoot', 'log', 'reportError', 'warning'].forEach(
    name => defineProperty(o, name, SecureObject.createFilteredMethod(o, AuraInstance, name))
  );

  setRef(o, AuraInstance, key);
  seal(o);

  // SecureUtil: creating a proxy for $A.util
  ['getBooleanValue', 'isArray', 'isObject', 'isUndefined', 'isUndefinedOrNull'].forEach(name =>
    defineProperty(su, name, SecureObject.createFilteredMethod(su, AuraInstance['util'], name))
  );
  // These methods in Util deal with raw objects like components, so mark them as such
  ['addClass', 'hasClass', 'removeClass', 'toggleClass', 'isEmpty'].forEach(name =>
    defineProperty(
      su,
      name,
      SecureObject.createFilteredMethod(su, AuraInstance['util'], name, { rawArguments: true })
    )
  );

  setRef(su, AuraInstance['util'], key);
  seal(su);

  // SecureLocalizationService: creating a proxy for $A.localizationService
  [
    'displayDuration',
    'displayDurationInDays',
    'displayDurationInHours',
    'displayDurationInMilliseconds',
    'displayDurationInMinutes',
    'displayDurationInMonths',
    'displayDurationInSeconds',
    'duration',
    'endOf',
    'formatCurrency',
    'formatDate',
    'formatDateTime',
    'formatDateTimeUTC',
    'formatDateUTC',
    'formatNumber',
    'formatPercent',
    'formatTime',
    'formatTimeUTC',
    'getDateStringBasedOnTimezone',
    'getDaysInDuration',
    'getDefaultCurrencyFormat',
    'getDefaultNumberFormat',
    'getDefaultPercentFormat',
    'getHoursInDuration',
    'getLocalizedDateTimeLabels',
    'getMillisecondsInDuration',
    'getMinutesInDuration',
    'getMonthsInDuration',
    'getNumberFormat',
    'getSecondsInDuration',
    'getToday',
    'getYearsInDuration',
    'isAfter',
    'isBefore',
    'isBetween',
    'isPeriodTimeView',
    'isSame',
    'parseDateTime',
    'parseDateTimeISO8601',
    'parseDateTimeUTC',
    'startOf',
    'toISOString',
    'translateFromLocalizedDigits',
    'translateFromOtherCalendar',
    'translateToLocalizedDigits',
    'translateToOtherCalendar',
    'UTCToWallTime',
    'WallTimeToUTC'
  ].forEach(name =>
    defineProperty(
      sls,
      name,
      SecureObject.createFilteredMethod(sls, AuraInstance['localizationService'], name)
    )
  );

  setRef(sls, AuraInstance['localizationService'], key);
  seal(sls);

  addToCache(AuraInstance, o, key);
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureAuraAction(action, key) {
  let o = getFromCache(action, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureAction: ${action}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  defineProperties(o, {
    getName: SecureObject.createFilteredMethod(o, action, 'getName'),
    setCallback: SecureObject.createFilteredMethod(o, action, 'setCallback', { defaultKey: key }),
    setParams: SecureObject.createFilteredMethod(o, action, 'setParams', { defaultKey: key }),
    setParam: SecureObject.createFilteredMethod(o, action, 'setParam', { defaultKey: key }),
    getParams: SecureObject.createFilteredMethod(o, action, 'getParams'),
    getParam: SecureObject.createFilteredMethod(o, action, 'getParam'),
    getCallback: SecureObject.createFilteredMethod(o, action, 'getCallback'),
    getState: SecureObject.createFilteredMethod(o, action, 'getState'),
    getReturnValue: SecureObject.createFilteredMethod(o, action, 'getReturnValue', {
      defaultKey: key
    }),
    getError: SecureObject.createFilteredMethod(o, action, 'getError'),
    isBackground: SecureObject.createFilteredMethod(o, action, 'isBackground'),
    setBackground: SecureObject.createFilteredMethod(o, action, 'setBackground'),
    setAbortable: SecureObject.createFilteredMethod(o, action, 'setAbortable'),
    setStorable: SecureObject.createFilteredMethod(o, action, 'setStorable')
  });

  setRef(o, action, key);
  addToCache(action, o, key);
  registerProxy(o);

  return seal(o);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureAuraEvent(event, key) {
  let o = getFromCache(event, key);
  if (o) {
    return o;
  }

  /**
   * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
   * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
   * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
   */
  function deepUnfilterMethodArguments(baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (isArray(value)) {
        value = deepUnfilterMethodArguments([], value);
      } else if (isPlainObject(value)) {
        value = deepUnfilterMethodArguments({}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            value = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          value = deepUnfilterMethodArguments({}, value);
        }
      } else {
        value = SecureObject.filterEverything(o, value, { defaultKey: key });
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureAuraEvent: ${event}{ key: ${JSON.stringify(key)} }`;
      }
    },
    setParams: {
      writable: true,
      enumerable: true,
      value: function(config) {
        const unfiltered = deepUnfilterMethodArguments({}, config);
        event['setParams'](unfiltered);
        return o;
      }
    },
    setParam: {
      writable: true,
      enumerable: true,
      value: function(property, value) {
        const unfiltered = deepUnfilterMethodArguments({}, { value: value }).value;
        event['setParam'](property, unfiltered);
      }
    }
  });

  [
    'fire',
    'getName',
    'getParam',
    'getParams',
    'getPhase',
    'getSource',
    'getSourceEvent',
    'pause',
    'preventDefault',
    'resume',
    'stopPropagation',
    'getType',
    'getEventType'
  ].forEach(name => defineProperty(o, name, SecureObject.createFilteredMethod(o, event, name)));

  setRef(o, event, key);
  addToCache(event, o, key);
  registerProxy(o);

  return seal(o);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let getPublicMethodNames;
let requireLocker;

function registerAuraAPI(api) {
  if (api) {
    getPublicMethodNames = api.getPublicMethodNames;
    requireLocker = api.requireLocker;
  }
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureAuraComponent(component, key) {
  let o = getFromCache(component, key);
  if (o) {
    return o;
  }

  // special methods that require some extra work
  o = create$1(null, {
    get: {
      writable: true,
      enumerable: true,
      value: function(name) {
        const path = name.split('.');
        // protection against `cmp.get('c')`
        if (typeof path[1] !== 'string' || path[1] === '') {
          throw new SyntaxError(`Invalid key ${name}`);
        }

        const value = component['get'](name);
        if (!value) {
          return value;
        }

        if (path[0] === 'c') {
          return SecureAuraAction(value, key);
        }
        return SecureObject.filterEverything(o, value);
      }
    },
    getEvent: {
      writable: true,
      enumerable: true,
      value: function(name) {
        const event = component['getEvent'](name);
        if (!event) {
          return event;
        }
        return SecureAuraEvent(event, key);
      }
    },
    toString: {
      value: function() {
        return `SecureComponent: ${component}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  defineProperties(o, {
    // these four super* methods are exposed as a temporary solution until we figure how to re-arrange the render flow
    superRender: SecureObject.createFilteredMethod(o, component, 'superRender'),
    superAfterRender: SecureObject.createFilteredMethod(o, component, 'superAfterRender'),
    superRerender: SecureObject.createFilteredMethod(o, component, 'superRerender'),
    superUnrender: SecureObject.createFilteredMethod(o, component, 'superUnrender'),

    // component @platform methods
    isValid: SecureObject.createFilteredMethod(o, component, 'isValid'),
    isInstanceOf: SecureObject.createFilteredMethod(o, component, 'isInstanceOf'),
    addEventHandler: SecureObject.createFilteredMethod(o, component, 'addEventHandler', {
      rawArguments: true
    }),
    addHandler: SecureObject.createFilteredMethod(o, component, 'addHandler'),
    addValueHandler: SecureObject.createFilteredMethod(o, component, 'addValueHandler'),
    addValueProvider: SecureObject.createFilteredMethod(o, component, 'addValueProvider'),
    destroy: SecureObject.createFilteredMethod(o, component, 'destroy'),
    isRendered: SecureObject.createFilteredMethod(o, component, 'isRendered'),
    getGlobalId: SecureObject.createFilteredMethod(o, component, 'getGlobalId'),
    getLocalId: SecureObject.createFilteredMethod(o, component, 'getLocalId'),
    getSuper: SecureObject.createFilteredMethod(o, component, 'getSuper'),
    getReference: SecureObject.createFilteredMethod(o, component, 'getReference'),
    getVersion: SecureObject.createFilteredMethod(o, component, 'getVersion'),
    clearReference: SecureObject.createFilteredMethod(o, component, 'clearReference'),
    autoDestroy: SecureObject.createFilteredMethod(o, component, 'autoDestroy'),
    isConcrete: SecureObject.createFilteredMethod(o, component, 'isConcrete'),
    getConcreteComponent: SecureObject.createFilteredMethod(o, component, 'getConcreteComponent'),
    find: SecureObject.createFilteredMethod(o, component, 'find'),
    set: SecureObject.createFilteredMethod(o, component, 'set', {
      defaultKey: key,
      rawArguments: true
    }),
    getElement: SecureObject.createFilteredMethod(o, component, 'getElement'),
    getElements: SecureObject.createFilteredMethod(o, component, 'getElements'),
    getName: SecureObject.createFilteredMethod(o, component, 'getName'),
    getType: SecureObject.createFilteredMethod(o, component, 'getType'),
    removeEventHandler: SecureObject.createFilteredMethod(o, component, 'removeEventHandler')
  });

  // The shape of the component depends on the methods exposed in the definitions:
  const methodsNames = getPublicMethodNames(component);
  if (methodsNames && methodsNames.length) {
    methodsNames.forEach(methodName =>
      SecureObject.addMethodIfSupported(o, component, methodName, { defaultKey: key })
    );
  }

  setRef(o, component, key);
  addToCache(component, o, key); // backpointer
  registerProxy(o);

  return o;
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureAuraComponentRef(component, key) {
  let o = getFromCache(component, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureComponentRef: ${component}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });
  defineProperties(o, {
    addValueHandler: SecureObject.createFilteredMethod(o, component, 'addValueHandler'),
    addValueProvider: SecureObject.createFilteredMethod(o, component, 'addValueProvider'),
    destroy: SecureObject.createFilteredMethod(o, component, 'destroy'),
    getGlobalId: SecureObject.createFilteredMethod(o, component, 'getGlobalId'),
    getLocalId: SecureObject.createFilteredMethod(o, component, 'getLocalId'),
    getEvent: SecureObject.createFilteredMethod(o, component, 'getEvent'),
    isInstanceOf: SecureObject.createFilteredMethod(o, component, 'isInstanceOf'),
    isRendered: SecureObject.createFilteredMethod(o, component, 'isRendered'),
    isValid: SecureObject.createFilteredMethod(o, component, 'isValid'),
    set: SecureObject.createFilteredMethod(o, component, 'set', {
      defaultKey: key,
      rawArguments: true
    }),
    get: {
      writable: true,
      enumerable: true,
      value: function(name) {
        // protection against anything other then `cmp.get('v.something')`
        if (
          typeof name !== 'string' ||
          name.length < 3 ||
          (name.indexOf('v.') !== 0 && name.indexOf('e.') !== 0)
        ) {
          throw new SyntaxError(`Invalid key ${name}`);
        }

        return SecureObject.filterEverything(o, component['get'](name));
      }
    }
  });

  /**
   * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
   * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
   * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
   */
  function deepUnfilterMethodArguments(baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (isArray(value)) {
        value = deepUnfilterMethodArguments([], value);
      } else if (isPlainObject(value)) {
        value = deepUnfilterMethodArguments({}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            value = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          value = deepUnfilterMethodArguments({}, value);
        }
      } else {
        value = SecureObject.filterEverything(o, value, { defaultKey: key });
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  const methodsNames = getPublicMethodNames(component);
  if (methodsNames && methodsNames.length) {
    // If SecureAuraComponentRef is an unlockerized component, then let it
    // have access to raw arguments
    const methodOptions = {
      defaultKey: key,
      unfilterEverything: !requireLocker(component)
        ? function(args) {
            return deepUnfilterMethodArguments([], args);
          }
        : undefined
    };

    methodsNames.forEach(methodName =>
      SecureObject.addMethodIfSupported(o, component, methodName, methodOptions)
    );
  }

  // DCHASMAN TODO Workaround for ui:button redefining addHandler using aura:method!!!
  if (!('addHandler' in o)) {
    SecureObject.addMethodIfSupported(o, component, 'addHandler', { rawArguments: true });
  }

  setRef(o, component, key);
  addToCache(component, o, key);
  registerProxy(o);

  return seal(o);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureAuraPropertyReferenceValue(prv, key) {
  let o = getFromCache(prv, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecurePropertyReferenceValue: ${prv} { key: ${JSON.stringify(key)} }`;
      }
    }
  });

  setRef(o, prv, key);
  addToCache(prv, o, key);
  registerProxy(o);

  return seal(o);
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let AuraAction;
let AuraComponent;
let AuraEvent;
let AuraPropertyReferenceValue;

function registerAuraTypes(types) {
  if (types) {
    AuraAction = types.Action;
    AuraComponent = types.Component;
    AuraEvent = types.Event;
    AuraPropertyReferenceValue = types.PropertyReferenceValue;
  }
}

/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function SecureLib(lib, key, requireLocker) {
  let o = getFromCache(lib, key);
  if (o) {
    return o;
  }

  o = create$1(null, {
    toString: {
      value: function() {
        return `SecureLib: ${lib}{ key: ${JSON.stringify(key)} }`;
      }
    }
  });

  /**
   * Traverse all entries in the baseObject to unwrap any secure wrappers and wrap any functions as
   * SecureFunction. This ensures any non-Lockerized handlers of the event do not choke on the secure
   * wrappers, but any callbacks back into the original Locker have their arguments properly filtered.
   */
  function deepUnfilterMethodArguments(baseObject, members) {
    let value;
    for (const property in members) {
      value = members[property];
      if (isArray(value)) {
        value = deepUnfilterMethodArguments([], value);
      } else if (isPlainObject(value)) {
        value = deepUnfilterMethodArguments({}, value);
      } else if (typeof value !== 'function') {
        if (value) {
          const key = getKey(value);
          if (key) {
            value = getRef(value, key) || value;
          }
        }
        // If value is a plain object, we need to deep unfilter
        if (isPlainObject(value)) {
          value = deepUnfilterMethodArguments({}, value);
        }
      } else {
        value = SecureObject.filterEverything(o, value, { defaultKey: key });
      }
      baseObject[property] = value;
    }
    return baseObject;
  }

  const libExports = Object.keys(lib);
  if (libExports && libExports.length) {
    // If SecureAuraComponentRef is an unlockerized component, then let it
    // have access to raw arguments
    const methodOptions = {
      defaultKey: key,
      unfilterEverything: !requireLocker
        ? function(args) {
            return deepUnfilterMethodArguments([], args);
          }
        : undefined
    };

    libExports.forEach(property => {
      if (lib[property] instanceof Function) {
        SecureObject.addMethodIfSupported(o, lib, property, methodOptions);
      } else {
        SecureObject.addPropertyIfSupported(o, lib, property);
      }
    });
  }

  setRef(o, lib, key);
  addToCache(lib, o, key);
  registerProxy(o);

  return seal(o);
}

/*
 * Copyright (C) 2017 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// AuraLocker is a facade for Locker. Its role is to:
// - implement methods not present on Locker (extends API).
// - decouple the Locker API from the Aura API.
let isLockerInitialized = false;

const namespaceToKey = new Map();
const engineToSecureEngine = new Map();

function filterTypeHook(raw, key, belongsToLocker) {
  if (raw instanceof AuraAction) {
    return belongsToLocker ? SecureAuraAction(raw, key) : SecureObject(raw, key);
  } else if (raw instanceof AuraComponent) {
    return belongsToLocker ? SecureAuraComponent(raw, key) : SecureAuraComponentRef(raw, key);
  } else if (raw instanceof AuraEvent) {
    return SecureAuraEvent(raw, key);
  } else if (raw instanceof AuraPropertyReferenceValue) {
    return SecureAuraPropertyReferenceValue(raw, key);
  }
  return null;
}

function isUnfilteredTypeHook(raw, key) {
  const namespace = key['namespace'];
  if (namespace === 'runtime_rtc_spark' || namespace === 'runtime_rtc') {
    return window['MediaStream'] && raw instanceof window['MediaStream'];
  }
  return false;
}

function windowAddPropertiesHook(st, raw, key) {
  defineProperty(st, '$A', {
    enumerable: true,
    value: SecureAura(raw['$A'], key)
  });

  // Salesforce API entry points (first phase) - W-3046191 is tracking adding a publish() API
  // enhancement where we will move these to their respective javascript/container architectures
  ['Sfdc', 'sforce'].forEach(name => SecureObject.addPropertyIfSupported(st, raw, name));

  // Add RTC related api only to specific namespaces
  const namespace = key['namespace'];
  if (namespace === 'runtime_rtc_spark' || namespace === 'runtime_rtc') {
    ['RTCPeerConnection', 'webkitRTCPeerConnection'].forEach(name => {
      if (name in raw) {
        defineProperty(st, name, {
          enumerable: true,
          value: SecureRTCPeerConnection(raw[name], key)
        });
      }
    });
    SecureObject.addUnfilteredPropertyIfSupported(st, raw, 'MediaStream');
    // DOMParser and document.implementation is not currently supported in Locker due to W-4437359
    // enable only for RTC namespace until a better solution arises.
    SecureObject.addUnfilteredPropertyIfSupported(st, raw, 'DOMParser');
  }
}

function navigatorAddPropertiesHook(st, raw, key) {
  const namespace = key['namespace'];
  if (namespace === 'runtime_rtc_spark' || namespace === 'runtime_rtc') {
    ['mediaDevices', 'mozGetUserMedia', 'webkitGetUserMedia'].forEach(name => {
      SecureObject.addUnfilteredPropertyIfSupported(st, raw, name);
    });
  }
}

function create$$1(src, key, sourceURL) {
  return {
    globals: getEnv$1(key),
    returnValue: evaluate(`(function () {${src}}())`, key, sourceURL)
  };
}

function getKeyForNamespace(namespace) {
  let key = namespaceToKey.get(namespace);

  if (!key) {
    key = freeze({
      namespace: namespace
    });

    namespaceToKey.set(namespace, key);
  }

  return key;
}

function createForClass(src, defDescriptor) {
  const namespace = defDescriptor.getNamespace();
  const name = defDescriptor.getName();
  const sourceURL = `components/${namespace}/${name}.js`;
  const key = getKeyForNamespace(namespace);

  const returnValue = evaluate(src, key, sourceURL);
  // Key this def so we can transfer the key to component instances
  setKey(returnValue, key);
  return returnValue;
}

// @deprecated
function createForDef(src, def) {
  const defDescriptor = def.getDescriptor();
  const namespace = defDescriptor.getNamespace();
  const name = defDescriptor.getName();
  const sourceURL = `components/${namespace}/${name}.js`;
  const key = getKeyForNamespace(namespace);

  // Key this def so we can transfer the key to component instances
  setKey(def, key);

  // Accelerate the reference to $A
  src = `(function() {
  const {$A} = window;

  ${src}

}())`;

  return evaluate(src, key, sourceURL);
}

function createForModule(src, defDescriptor) {
  const namespace = defDescriptor.getNamespace();
  const name = defDescriptor.getName();
  const sourceURL = `modules/${namespace}/${name}.js`;
  const key = getKeyForNamespace(namespace);

  // Mute several globals for modules
  src = `(function() {
  const {$A, aura, Sfdc, sforce} = {};

  return ${src}

}())`;

  const returnValue = evaluate(src, key, sourceURL);
  // Key the sanitized definition so we can transfer the key to interop component instances
  setKey(returnValue, key);
  return returnValue;
}

function getEnv$$1(key) {
  return getEnv$1(key);
}

function getEnvForSecureObject(st) {
  const key = getKey(st);
  if (!key) {
    return undefined;
  }

  return getEnv$1(key);
}

function getRaw(value) {
  if (value) {
    const key = getKey(value);
    if (key) {
      value = getRef(value, key) || value;
    }
  }
  return value;
}

function initialize(types, api) {
  if (isLockerInitialized) {
    return;
  }

  init({
    shouldFreeze: api.isFrozenRealm,
    unsafeGlobal: window,
    unsafeEval: window.eval,
    unsafeFunction: window.Function
  });

  registerAuraTypes(types);
  registerAuraAPI(api);
  registerReportAPI(api);
  registerEngineAPI(api);
  registerFilterTypeHook(filterTypeHook);
  registerIsUnfilteredTypeHook(isUnfilteredTypeHook);
  registerAddPropertiesHook$$1(windowAddPropertiesHook);
  registerAddPropertiesHook$1(navigatorAddPropertiesHook);
  registerCustomElementHook(customElementHook$1);
  isLockerInitialized = true;
}

function isEnabled() {
  return true;
}

// @deprecated
function instanceOf(value, type) {
  return value instanceof type;
}

function runScript(src, namespace) {
  const key = getKeyForNamespace(namespace);
  return evaluate(src, key);
}

function trust$$1(from, thing) {
  return trust$1(from, thing);
}

function unwrap$$1(from, st) {
  return unwrap$1(from, st);
}

function wrapComponent(component) {
  const key = getKey(component);
  if (!key) {
    return component;
  }

  if (typeof component !== 'object') {
    return component;
  }

  return requireLocker(component) ? SecureAuraComponent(component, key) : component;
}

function wrapComponentEvent(component, event) {
  // if the component is not secure, return the event.
  const key = getKey(component);
  if (!key) {
    return event;
  }

  if (typeof component !== 'object' || typeof event !== 'object') {
    return event;
  }

  return event instanceof AuraEvent ? SecureAuraEvent(event, key) : SecureDOMEvent(event, key);
}

function wrapEngine(engine, key) {
  let secureEngine = engineToSecureEngine.get(key);
  if (!secureEngine) {
    secureEngine = SecureEngine(engine, key);
    engineToSecureEngine.set(key, secureEngine);
  }
  return secureEngine;
}

function wrapLib(lib, key, requireLocker$$1) {
  return SecureLib(lib, key, requireLocker$$1);
}

export { create$$1 as create, getKeyForNamespace, createForClass, createForDef, createForModule, getEnv$$1 as getEnv, getEnvForSecureObject, getRaw, initialize, isEnabled, instanceOf, runScript, trust$$1 as trust, unwrap$$1 as unwrap, wrapComponent, wrapComponentEvent, wrapEngine, wrapLib };
