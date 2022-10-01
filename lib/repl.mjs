export function createRepl({
  runtime,
}) {

  function acceptInput(input, callback) {
      input = input.trim();

      if (input === 'help') {
        runtime.send({
          kind: 'help',
          to: 'helpHandler',
          onDone: callback,
        });
        return;
      }

      if (input === 'look' || input === 'look around') {
        runtime.sendAll({ kind: 'tick' });
        runtime.send({
          kind: 'observeSurroundings',
          to: 'environmentAwareness',
          onDone: callback,
        });
        return;
      }

      const tokens = input.split(' ');

      runtime.send({
        kind: tokens[0],
        to: tokens[1],
        body: tokens.slice(2),
      });

      runtime.sendAll({ kind: 'tick' });

      setImmediate(callback);
  }

  return {
    acceptInput,
  };

}