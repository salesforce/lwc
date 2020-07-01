# @lwc/engine-server

This package can be used to render LWC components as strings in a server environment.

Usage of internal APIs are prevented by the compiler and are therefore not documented here.

## Supported APIs

This package supports the following APIs.

### renderComponent()

This function renders a string-representation of a serialized component tree, given a tag name
and an LWC constructor. The output format itself is aligned with the [current leading
proposal][explainer], but is subject to change.

## Experimental APIs

Experimental APIs are subject to change or removal, are not stable, and should be used at your
own risk.

[explainer]: https://github.com/mfreed7/declarative-shadow-dom/blob/master/README.md
