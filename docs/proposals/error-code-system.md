This proposal will address two items:
1. Introduce dev vs prod error messages
2. Introduce error code system

Summary:
Developers will replace assert blocks/statements with invariant( condition, message ) calls. With invariant calls, during development mode, error messages will appear in the console in its full length; however in production mode, only a friendly URL with an errorCode will be shown. User can follow the URL to the Lightning Web Components site to read detailed error explanation. This minimizes amount of text being shipped and hides error verboseness in production code.

NOTE: This proposal mimics, with some deviations, logic from React's [Error Code system](https://reactjs.org/blog/2016/07/11/introducing-reacts-error-code-system.html).
Please read over above react doc for it will help you follow current proposal.


# Lightning Web Components Error Code system will consist of following parts:
**1.** errorCodes.json -  json object with key:value pairs, where key is a unique error code and value is a unique message key. The message key is a result of concatenating error name-space and error-key ex:
```
{
   "1001":"EVENTS_callback_must_be_expression"
}
// EVENTS is a error message namespace and "callback_must_be_expression" is a unique error message key
```


Error-code keys follow numeric sequence, where each sequence represents a collection of error codes related to an individual engine part ( ex: 100x - events, 200x - props, 300x - render ... ). Leading digit of the error code will represent a specific engine part and will help developers to quickly identify failing area ( any error starting with '1' is related to events for example ).
NOTE: this file is append only - since these codes will be served on our website for documentation purposes and can potentially be referenced by support groups, these codes must not change.

**2.** errors.json - json object with key:value pairs, where key is a unique error identifier and value is a message string ( see below for 'discussion needed' ). This message key becomes the value in the error-code map ( error-code inverse map is used during prod build to retrieve an error code by the message key - see below ). This is the part where Lightning Web Components deviates from React ( see more in info section for explanation ).

**3.** extract-errors.js - ( this may not be needed - see discussion section below ) - script that will parse all error file(s) during build time to create new code entries.

**4.** replace-invariant-error-codes.js - is a Babel pass that rewrites error messages to IDs for a production (minified) build. ex:
```
// Turns this code:
invariant(condition, message, arguments);
```

```
// into this:
if (!condition) {
     if ("production" !== process.env.NODE_ENV) {
         invariant(false, 'foo', 'bar');
     } else {
         PROD_INVARIANT(1001, 'foo', 'bar');
     }
}
```

**5.** lwcProdInvariant.js is the replacement for invariant code in production, that accepts errorCode, arguments, and builds lwc error url. ex: https://lwc.sfdc.es/docs/error-decoder.html?id=1001&arg1='foo'&arg2='bar'.

**6.** ErrorDecoderComponent is an LWC component that lives at 'https://lwc.sfdc.es/docs/error-decoder.html'. This page takes parameters like lwc version and errorCode. Our documentation site will need to have support for adding the latest codes.json to the error decoder page.

Sample code to use instead of assertions:

```invariant( !isRendering, ErrorsRender.action_during_render )```

or

```invariant( !isRendering, Errors.get( action_during_render, render )```
// where first param is msg key and second param is namespace

----------------------------------------------------------------------------------------------------

## Discussion Needed:
**How should error messages be organized?**

**a.** Error message are broken down into separate files, where each file represents one individual part of the engine ex:
```
engine/errors/
            render.json
            props.json
            events.json
```

Pros:
- Easy to locate related messages in a smaller subset of errors vs one large errors file
- Easy to maintain/serve different file versions ( for different LWC versions ) in our ErrorDecoderComponent
- Error Keys are less verbose since each file represents a namespace

**b.** there is one common error file. Root level keys represent individual parts of the engine ex:

```
{
   "render":{
      "not_mounted":"Component has not been mounted"
   },
   "props":{
      "not_public_prop":"Received property is not supported"
   }
}
```

Pros:
- Single file
- Easy to lookup

Cons:
- Harder to locate existing messages


**Error Codes: Manually added vs Auto Generated**
**Manual:**
- full control of how code increments are being assigned.
- no need to introduce babel pass to collect new error messages which are then used to increment error code sequences by adding new entires into errorCodes.json file

**Auto Generated:**
- No need to worry about manually maintaining error codes - babel pass will automatically create new error code entries if new error messages are added

----------------------------------------------------------------------------------------------------

### More Info
**React vs Lightning Web Components: ErrorCode to Message mapping:**
**React:**
Here is a brief overview on how react creates/maintains error + messages:
- Developers write invariant( condition, "This is an actual error message displayed in the console") instead of assertions
- During build time, a script parses specified source files and searches for 'invariant' function calls. As it finds them, the script extracts the message and uses it as a key to perform existence check in  inverted map of code.json map ( inverted map <"This is an actual error message displayed in the console" : "1001"> ). If not found, the script adds new entry into codes.json file by incrementing the last error code key. Otherwise simply returns error code for URL building phase.
- There are few more unrelated to this discussion steps that we won't talk about for the sake of time.

**Pros:**
- Super fast development time, since developer does not have to maintain messages nor error codes, they can simply add invariant( condition, " new message" ); and the rest is done during build by scripts.

**Cons:**
- Any mistake in message string will result in a new errorCode entry, which cannot be removed after released since error codes are append only.
- Maintenance: Changes to message text/format will require developers to perform a manual replace in the every source file for every occurrence of such message.
- No language support
- Hard to find already existing messages since error code file will have unstructured labels for everything

**Lightning Web Components:**
- We are introducing one layer of indirection into errorCode to errorMessage mapping. Instead of mapping errorCode directly to the message string, we are mapping it to a unique message identified, which in our case is represented by namespace + message key ( ex: ENGINE_vm_not_found )

**Pros:**
- Loose coupling between error codes and labels
- Language support
- Ease in maintainability
- Version support
- Ease in finding already existing errors ( since each part of the engine will have its own error message namespace )

**Cons:**
- Manual error message maintenance
- Extra files to ship

