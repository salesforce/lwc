# Data Service

## Status

_Finalized_

## Goals

* Data-dependent Lightning Web Components (LWC) are fast at runtime.
* LWC development and lifecycle are simple. Much simpler than Aura's.
* Aura and LWC data services are compatible.
* Cache and view coherency is enforced.

## Invariants

### Fundamentals

* It's all data from LWC's perspective.
  * Salesforce metadata and data are data.
  * Non-Salesforce metadata and data are data.
  * Only LWC metadata (eg module defs) is metadata.
* All data mutates over time yet a given snapshot of data is immutable.
  * A component receiving data does not own that data. It is comparable to a component receiving props does not own the props.
  * In the rare case where handling changing data over time is sufficiently costly (in runtime, complexity, etc) then the application may choose to reload/rebootstrap itself. The typical example is a change in locale and language; these impact all labels, formatting, data, etc. A reboot of the application is the simplest way to handle the change.
* The Data Service allows pluggable logic to manage domains of data.
  * In this regard the Data Service is conceptually a directory of underlying data services.
  * Each data domain defines its own verbs (eg CRUD) and behavior.
  * A data domain may choose to support progressive loading of data.
  * Each data domain defines its caching and invalidation strategy.

### Component Integration

* Loading data is expressed declaratively by a component.
  * The expression may provide static values, reference props or getters.
  * Props are monitored for changes. Monitoring getters is TBD.
* Data declarations may be accessed at compile time and may influence compiled output.
* Data is bound to decorated field or function.
* Component data declaration's comes in two flavors:
  * A root query: the query is sufficient to be resolved by a data service.
  * A fragment query: the query is insufficient. It must be *rolled up* to a root query.
