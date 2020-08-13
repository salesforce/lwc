// @babel/plugin-proposal-async-generator-functions
export async function* agf() {
  await 1;
  yield 2;
}

// @babel/plugin-transform-class-properties
export class Bar {
  bar = "foo";
}

// @babel/plugin-proposal-nullish-coalescing-operator
export const foo = object.foo ?? "default";

// @babel/plugin-proposal-numeric-separator
export const budget = 1_000_000_000_000;


// @babel/plugin-transform-object-rest-spread
z = { x, ...y };
z = { x, w: { ...y } };

// @babel/plugin-proposal-optional-catch-binding
try {
  throw 0;
} catch {
  doSomethingWhichDoesNotCareAboutTheValueThrown();
}

// @babel/plugin-proposal-optional-chaining
export const baz = obj?.foo?.bar?.baz;