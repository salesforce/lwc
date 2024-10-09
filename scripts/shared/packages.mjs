import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const readJsonSync = (filepath) => JSON.parse(readFileSync(filepath, 'utf8'));

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const lwcPackageDir = 'packages/lwc';
const relativeNamespaceDir = 'packages/@lwc';
const namespacedPackageDirs = readdirSync(join(root, 'packages/@lwc'), {
    withFileTypes: true,
})
    .filter((fd) => fd.isDirectory() && !fd.name.startsWith('.'))
    .map((fd) => join(relativeNamespaceDir, fd.name));
const allPackageDirs = [lwcPackageDir, ...namespacedPackageDirs];

export const ALL_PACKAGES = allPackageDirs.map((path) => ({
    path,
    package: readJsonSync(join(path, 'package.json')),
}));
export const PRIVATE_PACKAGES = ALL_PACKAGES.filter((data) => data.package.private);
export const PUBLIC_PACKAGES = ALL_PACKAGES.filter((data) => !data.package.private);
