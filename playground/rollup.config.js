import lwc from '@lwc/rollup-plugin';
import replace from '@rollup/plugin-replace';
import serve from 'rollup-plugin-serve';

const __ENV__ = process.env.NODE_ENV ?? 'development';

export default (args) => {
  return {
    input: 'src/main.js',

    output: {
      file: 'dist/main.js',
      format: 'esm',
    },

    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(__ENV__),
        preventAssignment: true,
      }),
      lwc(),
      args.watch &&
        serve({
          open: false,
          port: 3000,
        }),
    ],
  };
};
