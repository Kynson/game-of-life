#! /usr/local/bin/node

import { watch } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { sep } from 'node:path';

import getCargoWorkspaceMembers from './getCargoWorkspaceMembers.mjs';
import * as log from './log.mjs';

const cargoWorkspaceMembers = await getCargoWorkspaceMembers();

const watcherAbortController = new AbortController();

/**
 * @type { Map<string, { buildProcess: import('node:child_process').ChildProcess, time: number }> }
 */
const buildTasks = new Map();

process.on('SIGINT', () => {
  log.info('\nStopping watcher...');

  watcherAbortController.abort();
  process.exit(0);
});

log.info('Watching all WASM packages for changes...');
const watcher = watch('packages', {
  recursive: true,
  signal: watcherAbortController.signal,
});
for await (const { filename } of watcher) {
  const changedDirectory = `packages/${filename.split(sep)[0]}`;
  if (
    !cargoWorkspaceMembers.includes(changedDirectory) ||
    !filename.endsWith('.rs') ||
    // If the file was changed within 200ms of the previous build, we ignore it, as it is likely that fs.watch fires the event multiple times
    Date.now() - (buildTasks.get(changedDirectory)?.time || 0) < 200
  ) {
    continue;
  }

  const previousBuildTaskForDirectory = buildTasks.get(changedDirectory);

  if (previousBuildTaskForDirectory) {
    const { buildProcess: previousBuildProcess } =
      previousBuildTaskForDirectory;

    log.info(
      `Killing previous build process for ${changedDirectory} (PID: ${previousBuildProcess.pid}) as file changed before the previous build completes`,
    );
    previousBuildProcess.kill();
  }

  const buildProcess = execFile(
    // --color always is used to force colored output as TTY is not availbe from the child process perspective
    'wasm-pack',
    ['build', changedDirectory, '--color', 'always'],
    (error, _stdout, stderr) => {
      if (!error) {
        log.info(
          `Successfully built ${changedDirectory} (PID: ${buildProcess.pid})`,
        );
        buildTasks.delete(changedDirectory);

        return;
      }

      // If the process was killed, we don't want to log an error message
      if (error.killed) {
        return;
      }

      log.error(
        `Failed to build ${changedDirectory} (PID: ${buildProcess.pid})\n${stderr}`,
      );
    },
  );

  buildTasks.set(changedDirectory, {
    buildProcess,
    time: Date.now(),
  });

  // Log here to ensure the build process is started before the message is logged
  // and we have the PID
  log.info(`Building ${changedDirectory}... (PID: ${buildProcess.pid})`);
}
