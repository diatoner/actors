import { createActorRuntime } from './actors.mjs';

const {
  registerActor,
  send,
} = createActorRuntime({ debug: false });

// Alice loves ideas, and loves sharing them with Bob
registerActor('alice').on('tell', function (params) {
  console.info(`Alice: I like that idea!`);
  console.info(`Alice: Hey Bob, ${params.body}`);
  this.send({
    kind: 'tell',
    to: 'bob',
    body: params.body,
  })
});

// Bob loves ideas, but he doesn't really like old ideas.
const bob = registerActor('bob');
bob.ideas = new Map();
bob.on('tell', function (params) {

  const count = (bob.ideas.get(params.body) || 0) + 1;
  bob.ideas.set(params.body, count);

  if (count > 3) {
    console.info(`Bob: Actually, that idea is kinda old.`);
    return;
  }

  if (count > 1) {
    console.info(`Bob: I still like that idea, but I've heard it before.`);
    console.info(`Bob: Let's tell Alice!`);
    this.send({
      kind: 'tell',
      to: 'alice',
      body: params.body,
    })
    return;
  }

  console.info(`Bob: That's not a bad idea!`);
  console.info(`Bob: Hey Alice, ${params.body}`);
  this.send({
    kind: 'tell',
    to: 'alice',
    body: params.body,
  })
});

console.info(`You tell Alice: Let's rob a bank!`);
send({
  kind: 'tell',
  to: 'alice',
  body: `Let's rob a bank!`,
});