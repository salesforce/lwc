declare module 'balanced-match' {
    interface Match {
        start: number;
        end: number;
        pre: string;
        body: string;
        post: string;
    }

    type Range = [number, number];

    interface BalancedMatch {
        (open: string | RegExp, close: string | RegExp, str: string): Match | undefined;
        range(open: string | RegExp, close: RegExp, str: string): Range | undefined;
    }

    const balanced: BalancedMatch;
    export = balanced;
}
