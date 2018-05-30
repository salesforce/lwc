module.exports = {
    extends: [
        '@commitlint/config-conventional' // scoped packages are not prefixed
    ],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'build',
                'chore',
                'ci',
                'docs',
                'feat',
                'fix',
                'perf',
                'proposal',
                'refactor',
                'revert',
                'style',
                'test',
                'wip'
            ]
        ]
    }
};
