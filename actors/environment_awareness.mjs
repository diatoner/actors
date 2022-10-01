/**
 * Spawns an Actor instance that requests results to a 'look' command
 * from all alive actors, then prints those results to the console 500ms
 * after the last received result.
 * 
 * @param {ActorRuntime} runtime 
 */
export function createEnvironmentAwareness({
  console,
  runtime,
}) {
  const actor = runtime.registerActor('environmentAwareness');

  const results = [];
  let timeoutId = null;
  let onDone = null;

  function processResults() {
    if (results.length === 0) results.push('You see nothing.');
    console.log(results.join('\n'));

    clearImmediate(timeoutId);

    results.splice(0, results.length);
    onDone && onDone();
    onDone = null;
  }

  actor.on('observeSurroundings', params => {
    results.splice(0, results.length);
    runtime.sendAll({ kind: 'look', from: actor.id });
    onDone = params.onDone;
    timeoutId = setImmediate(processResults, 500);
  });

  actor.on('result:look', params => {
    params.body && results.push(params.body);
    clearImmediate(timeoutId);
    timeoutId = setImmediate(processResults, 500);
  });

  actor.on('commands?', params => actor.send({
    kind: 'result:commands?',
    to: params.from,
    commands: ['look'],
  }));
}