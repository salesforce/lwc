import { VitestTestRunner } from 'vitest/runners';
import type { RunnerTask } from 'vitest';

export default class SsrTestRunner extends VitestTestRunner {
    override onAfterRunTask(task: RunnerTask): void {
        // In the test file `src/__tests__/fixtures.spec.ts` we are matching snapshots from engine-server
        // We want to avoid updating snapshots here, so we replace 'Snapshot' with 'SSR Fixture' in error messages
        // This is a workaround while vitest does not provide a way to skip updating snapshots for specific tests
        // https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/utils/tasks.ts#L12-L20
        // This shouldn't be a problem in CI, as updating snapshots is globally disabled
        if (task.file.name === 'src/__tests__/fixtures.spec.ts') {
            task.result?.errors?.forEach((error) => {
                error.message = error.message.replaceAll('Snapshot', 'SSR Fixture');
            });
        }

        return super.onAfterRunTask(task);
    }
}
