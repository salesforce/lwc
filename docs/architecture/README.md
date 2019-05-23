# Architecture Diagrams

The following are a series of flow diagrams describing the internal behavior of Lightning Web Components Engine:

## Component Creation

```
              Λ                                              Λ
  .─.        ╱ ╲             ┌────────┐                     ╱ ╲             ┌───────────────────┐     ┌────────┐
 (   )─────▶▕ 1 ▏─────────┬─▶│ create ├─────┬─────────────▶▕ 2 ▏──────────▶ │ connectedCallback │────▶│ render │
  `─'        ╲ ╱          │  └────────┘     │               ╲ ╱             └───────────────────┘     └────────┘
              │           │                 │                V                                             │
              │           │                 │                │                                             │
              │           │                 │                │                                     ┌────────────────┐
              │           │                 │                │                                     │ patch children │
              │           │                 │                │                                     └────────────────┘
              |           |                 |                |                                             |
              │ yes       │                 │                │ yes                                         ▼
              │           │                 │                │                                  ┌────────────────────┐
              ▼           │                 │                ▼                                  │ patch HOST element │
     ┌─────────────────┐  │                 │      ┌───────────────────┐                        └────────────────────┘
     │ getComponentDef │──┘                 │      │ update prop value │                                   │
     └─────────────────┘                    │      └───────────────────┘                                   ▼
                                            │                │                              ┌─────────────────────────────┐
                                            │                │                              │      renderedCallback()     │
                                            │                ▼                              └─────────────────────────────┘
                                            │                Λ                                             │
                                            │               ╱ ╲                                            ▼
                                            ├──────────────▕ 3 ▏                                          .─.
                                            │               ╲ ╱                                          (   )
                                            │                V                                            `─'
                                            │                │ yes
                                            │                │
                                            │                ▼
                                            │  ┌──────────────────────────┐
                                            └──│ attributeChangedCallback │
                                               └──────────────────────────┘
```

*Conditions*:

 * 1 - Is component used for the first time?
 * 2 - Is there any public prop pending to be updated?
 * 3 - Is there an observable attribute corresponding to the updated public prop?
 
 ## Component Destroy

```
   Λ                                                         
  ╱ ╲  yes         ┌──────────────────────┐             ┌───────────────────────┐        
 ▕ 1 ▏-──────────▶ │ disconnectedCallback │-──────────▶ │ remove child elements │
  ╲ ╱              └──────────────────────┘             └───────────────────────┘
   V    
   │
   │
   │
  .─.
 (   )
  `─'
```
*Conditions*:

 * 1 - Was component removed from the DOM?


## Schedule Rehydration

```
              Λ
  .─.        ╱ ╲ yes    ┌─────────────────┐     ┌────────┐     ┌────────────────┐     ┌────────────────────┐
 (   )─────▶▕ 1 ▏──────▶│ patch component │────▶│ render │────▶│ patch children │────▶│ patch HOST element │
  `─'        ╲ ╱        └─────────────────┘     └────────┘     └────────────────┘     └────────────────────┘
              V                                                                                  │
              │                                                                                  │
              │                                                                                  ▼
              │                                                                   ┌─────────────────────────────┐
              │                                                                   │ schedule renderedCallback() │
              │                                                                   └─────────────────────────────┘
              │                                                                                  │
              │                                                                                  ▼
              │                                                                                 .─.
              └───────────────────────────────────────────────────────────────────────────────▶(   )
                                                                                                `─'
```

*Conditions*:

 * 1 - Is component marked as dirty?


## State Object

```
                     Λ
  .─.               ╱ ╲                     .─.
 (   )────────────▶▕ 1 ▏──────────────────▶(   )
  `─'               ╲ ╱                     `─'
                     V                       ▲
                     │yes                    │
                     │                       │
                     ▼                       │
                     Λ                       │
                    ╱ ╲                      │
 ┌────────────────▶▕ 2 ▏─────────────────────┘
 │                  ╲ ╱
 │                   V
 │                   │ yes
 │                   ▼
 │     ┌───────────────────────────┐
 │     │ find dependency component │
 │     └───────────────────────────┘
 │                   │
 │                   ▼
 │                   Λ
 │             yes  ╱ ╲
 ├─────────────────▕ 3 ▏
 │                  ╲ ╱
 │                   V
 │                   │
 │                   ▼
 │     ┌──────────────────────────┐
 │     │ mark dependency as dirty │
 │     └──────────────────────────┘
 │                   │
 │                   ▼
 │  ┌─────────────────────────────────┐
 └──│ schedule dependency dehydration │
    └─────────────────────────────────┘
```

*Conditions*:

 * 1 - Is mutated key marked as reactive?
 * 2 - Is there any component watching for changes in the mutated key?
 * 3 - Is selected dependency component marked as dirty?

## Reactivity Model

```
                          Λ
  .─.                    ╱ ╲
 (   )─────────────────▶▕ 1 ▏◀────────────────|
  `─'                    ╲ ╱                  |
                          V                   |
                          │yes                |
                          │                   |
                          ▼                   |
            ┌───────────────────────────┐     |
            │   Create reactive proxy   │     |
            └───────────────────────────┘     |
                     |        │               |
                     ▼        ▼               |
                     Λ        Λ               |
                    ╱ ╲      ╱ ╲              |
 ┌────────────────▶▕ 3 ▏    ▕ 2 ▏─────────────|
 │                  ╲ ╱      ╲ ╱
 │                   V        V
 │                   │ yes
 │                   ▼
 │                   Λ
 │             yes  ╱ ╲
 ├─────────────────▕ 4 ▏
 │                  ╲ ╱
 │                   V
 │                   │
 │                   ▼
 │      ┌──────────────────────────┐
 │      │ mark dependency as dirty │
 │      └──────────────────────────┘
 │                   │
 │                   ▼
 │    ┌─────────────────────────────────┐
 └────│ schedule dependency hydration   │
      └─────────────────────────────────┘
```

*Conditions*:

 * 1 - Is value an Array or an object whose prototype is Object.prototype?
 * 2 - Was a property accessed?
 * 3 - Was a property mutated?
 * 4 - Is selected dependency component marked as dirty?

## VNodes

Interaction between `VM`, `VNodes`, and `Nodes`:

```
    ┌──────────────────────────┐
    │                          │
    │     UninitializedVM      │
    │                          │
    └──────────────────────────┘
                  △
                  │
                  │
       ┌─────────────────────┐                          ┌─────────────────────────┐
       │                     │                          │                         │
       │         VM          │◀─────────Owner───────────│    UninitializedVNode   │◁─────┐
       │                     │                          │                         │      │
       └───┬──────────────┬──┘                          └─────────────────────────┘      │
           │      ▲       │                                          △                   │
           │      │       │                                          │                   │
           │      │       └────┐                                     │                   │
           │      │            │                                     │                   │
           │      │            │                        ┌────────────┴────────────┐      │
           │      │            ▼                        │                         │      │
           │      │   ┌────────────────┐                │   UninitializedVElement │◁─────┼────────┐
           │      │   │                │                │                         │      │        │
           │      │   │   ShadowRoot   │                └─────────────────────────┘      │        │
           │      │   │                │                             △                   │        │
           │      │   └────────────────┘                             │                   │        │
           │      │                                                  │                   │        │
           │      │                                                  │                   │        │
           │      │                                                  │                   │        │
           │      │                                                  │                   │        │
           │      │                                ┌──────────────────────────────────┐  │        │
      velements   │                                │                                  │  │        │
           │      │                                │ UninitializedVCustomElement      │◁─┼────────┼────────────┐
           │  Internal                             │                                  │  │        │            │
           │    Slot                               └──────────────────────────────────┘  │        │            │
           │      │                                                                      │        │            │
           │      │                                                                      │        │            │
           │      │                                                                      │        │            │
           │      │                                                                      │        │            │
           │      │                                ┌───────────────────────┐     ┌──────────────┐ │            │
           │      │                                │                       │     │              │ │            │
           │      │                                │   TextNode or Comment │◀────│    VNode     │ │            │
           │      │                                │                       │     │              │ │            │
           │      │                                └───────────────────────┘     └──────────────┘ │            │
           │      │                                                                               │            │
           │      │                                                                               │            │
           │      │          ┌────────────┐                                              ┌────────────────┐    │
           │      │          │            │                                              │                │    │
           │      │          │   Element  │◀─────────────────────────elm─────────────────│    VElement    │    │
           │      │          │            │                                              │                │    │
           │      │          └────────────┘                                              └────────────────┘    │
           │      │                                                                                            │
           │      │                                                                                            │
           │      │      ┌───────────────────────┐                                                    ┌─────────────────┐
           │      │      │                       │                                                    │                 │
           │      └─────▶│     Custom Element    │◀──────────────────────elm──────────────────────────│  VCustomElement │
           │             │                       │                                                    │                 │
           ▼             └───────────────────────┘                                                    └─────────────────┘
┌────────────────────┐                                                                                         ▲
│                    │                                                                                         │
│  VCustomElements   │                                                                                         │
│                    │──────────────────────────────────────collection─────────────────────────────────────────┘
│                    │
└────────────────────┘
```

Notes:

* look at the bookkeeping between `VM` and `VCustomElement` via `velements`.
