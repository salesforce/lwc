import * as postcss from 'postcss';
declare module 'postcss' {
    export interface CssSyntaxError {
        lwcCode?: number;
    }
}
