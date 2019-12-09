declare module 'cssnano-preset-default' {
    import { Plugin } from 'postcss';

    const preset: (
        config: any
    ) => {
        plugins: [Plugin<any>, any];
    };
    export default preset;
}
