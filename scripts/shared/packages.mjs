import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { globSync } from 'glob';

const allPackages = globSync(['packages/lwc/package.json', 'packages/@lwc/*/package.json']);

export const ALL_PACKAGES = allPackages.map((pkg) => ({
    path: dirname(pkg),
    package: JSON.parse(readFileSync(pkg, 'utf8')),
}));
export const PRIVATE_PACKAGES = ALL_PACKAGES.filter((data) => data.package.private);
export const PUBLIC_PACKAGES = ALL_PACKAGES.filter((data) => !data.package.private);
export const SCOPED_PACKAGES = ALL_PACKAGES.filter((data) => data.package.name.startsWith('@lwc/'));
