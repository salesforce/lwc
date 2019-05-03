# MutationObserver polyfill

This polyfill contains functionality to make MutationObserver be aware of the synthetic shadow dom.

**Garbage Collection:**

This polyfill adopts the same garbage collection principle as the spec https://dom.spec.whatwg.org/#garbage-collection
"Nodes have a strong reference to registered observers in their registered observer list.
Registered observers in a node’s registered observer list have a weak reference to the node."

The patched observer instances do not hold a reference to their observed target. Instead, the observed target holds a strong reference to its observers. When the target node is garbage collected, the observer becomes eligible for garbage collection too.
