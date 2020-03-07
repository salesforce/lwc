/* eslint-disable */

const { compile } = require('./dist/commonjs/index');

const res = compile(`
<template>
    <div>awdaw   {adwadawd} adwda {awdawda}</div>
</template>
`);

console.log(res);
