import { watch, FSWatcher, WatchOptions } from 'chokidar';

const watchOptions: WatchOptions = {};
let watcher: FSWatcher | undefined;
export function startWatch(dirPaths: string[]): FSWatcher {
    watcher = watch([...dirPaths], watchOptions);
    return watcher;
}

export function stopWatch() {
    watcher?.close();
}
