# LWC playground

The simplest LWC setup for simple experiments and bug reproductions.

```sh
$ npm run dev       # Get app server running
$ npm run build     # Build app in production mode
$ npx serve         # Serve the app (after running `npm run build`).
```

## TypeScript

To enable TypeScript in the LWC playground, add `@rollup/plugin-typescript` to the list of plugins in `rollup.config.js`. The playground has a pre-configured `tsconfig.json` that allows both JS and TS files to be used.
