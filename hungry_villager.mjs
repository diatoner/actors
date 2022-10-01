export function createVillager({
  console,
  runtime,
  name,
}) {

  const villager = runtime.registerActor(`${name}`);
  villager.satiation = 5;

  const greetings = [
    'Hello!',
    'Sure is nice weather today!',
    `Can't wait to have dinner later tonight!`,
  ];

  const states = {
    'happy': {
      'tick': () => {
        villager.satiation--;
        if (villager.satiation < 3) {
          villager.currentState = states['hungry'];
        }
      },
      'greet': () => {
        const greeting = greetings[Math.floor(Math.random()*greetings.length)];
        console.info(`${name}: ${greeting}`);
      },
      'look': () => {
        villager.send({
          kind: 'result:look',
          to: 'environmentAwareness',
          body: `You see ${name}.`,
        });
      },
    },
    'hungry': {
      'tick': () => {
        console.info(`${name}: *stomach grumbles*`);
        villager.satiation--;
        if (villager.satiation < 0) {
          console.info(`${name} collapses on the ground.`)
          villager.currentState = states['dead'];
          return;
        }
      },
      'greet': () => console.info(`${name}: Man, I need some food!`),
      'look': () => villager.send({
        kind: 'result:look',
        to: 'environmentAwareness',
        body: `You see ${name}. He looks visibly pained.`,
      }),
    },
    'dead': {
      'tick': () => null,
      'greet': () => console.info(`${name} appears to be dead from hunger.`),
      'look': () => villager.send({
        kind: 'result:look',
        to: 'environmentAwareness',
        body: `You see the corpse of ${name}.`,
      }),
    },
  };

  villager.currentState = states['happy'];

  function tryHandle(message, params) {
    const handler = villager.currentState[message];
    if (handler) handler(params);
  }

  villager.on('tick', params => tryHandle('tick', params));
  villager.on('greet', params => tryHandle('greet', params));
  villager.on('look', params => tryHandle('look', params));
  villager.on('commands?', params => villager.send({
    kind: 'result:commands?',
    to: params.from,
    commands: ['greet', 'look'],
  }));

  return villager;

}