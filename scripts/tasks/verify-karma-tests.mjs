// @ts-check
/**
 * This script verifies that the karma tests defined in the .github/workflows/karma.yml file
 * have the same number of tests. It reads the workflow file, extracts all shell commands
import { exec as execCallback } from 'child_process';
 * The results are then logged to the console.
 */

import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const workflowFile = '.github/workflows/karma.yml';

console.log(`Reading ${workflowFile}`);

const workflowText = readFileSync(workflowFile, 'utf8');

// Extract all shell commands in `- run: ` lines and end in sauce:ci
// Regex pattern to match commands
// - run:        : Match the literal string "- run: "
// [\s\S]*?      : Match any character (including newlines) zero or more times, non-greedy
// sauce:ci      : Match the literal string "sauce:ci"
const commandPattern = /- run: [\s\S]*?sauce:ci/g;
const tasksMatches = workflowText.match(commandPattern);
if (!tasksMatches) {
    throw new Error('No matching commands found in the workflow file');
}

const tasks = tasksMatches.map((task) => ({
    task: task.replace(/^- run: /, '').replace('sauce:ci', 'test'),
    type: task.includes('hydration') ? 'hydration' : 'test',
}));

console.log(`Found ${tasks.length} tasks`);

// Run the commands and count the number of tests
const results = [];

const hydrationResults = await Promise.all(
    tasks.filter((cmd) => cmd.type === 'hydration').map((cmd) => runCommand(cmd.task))
);
hydrationResults.forEach((result) => {
    results.push(result);
    console.dir(result, { maxStringLength: 1000 });
});

console.log('Results:');

results.forEach((result) => console.log(`${result.command}, ${result.executed}, ${result.total}`));

/**
 * Run a command and return the number of tests
 * @param {string} command
 */
async function runCommand(command) {
    console.log(`Running: ${command}`);
    try {
        const { stdout } = await execAsync(`${command} --no-colors`, {
            cwd: 'packages/@lwc/integration-karma',
            encoding: 'utf8',
        });
        // ... Executed 3369 of 3759 (skipped 390) SUCCESS (18.824 secs / 17.177 secs) ...
        // match the last occurrence of Executed
        const match = stdout.match(/Executed (\d+) of (\d+)/g);

        if (!match) {
            throw new Error('Failed to match tests');
        }

        const lastMatch = match[match.length - 1];
        const matches = lastMatch.match(/(\d+)/g);

        if (!matches) {
            throw new Error('Failed to match tests');
        }

        return { command, executed: Number(matches[0]), total: Number(matches[1]) };
    } catch (error) {
        return { command, error: error.message };
    }
}
