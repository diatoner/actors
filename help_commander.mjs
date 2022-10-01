export function createHelpCommander({
  console,
  runtime,
}) {
  const help = runtime.registerActor('helpHandler');
  const helpResults = new Set();
  let helpTimeoutId = null;
  let onHelpDone = null;
  function handleHelpResults() {
    console.info(`Available commands:`);
    for (const r of helpResults.values()) {
      console.info(r);
    }
    clearImmediate(helpTimeoutId);
    onHelpDone && onHelpDone();
    onHelpDone = null;
  }
  help.on('help', params => {
    helpResults.clear();
    helpResults.add('help');
    runtime.sendAll({ kind: 'commands?', from: help.id });
    onHelpDone = params.onDone;
    helpTimeoutId = setImmediate(handleHelpResults, 500);
  });
  help.on('result:commands?', params => {
    for (const k of params.commands) { helpResults.add(k) }
    clearImmediate(helpTimeoutId);
    helpTimeoutId = setImmediate(handleHelpResults, 500);
  });
}