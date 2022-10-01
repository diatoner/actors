import { EventEmitter } from 'node:events';

export function createActorRuntime({
  debug,
  console,
}) {

  const orchestrator = new EventEmitter();
  orchestrator.dlq = [];
  orchestrator.children = new Map();

  orchestrator.on('message', async (params) => {
    const message = JSON.stringify(params);
    debug && console.info(`orchestrator: message ${message}`);
    for (const [id, child] of orchestrator.children.entries()) {
      if (params.to === id) {
        debug && console.info(`orchestrator: passing ${message} to ${id}`);
        child.emit(params.kind, params);
        debug && console.info(`${id}: done handling ${message}`);
        return;
      }
    }
    debug && console.error('orchestrator: failed to handle ${message}');
    orchestrator.dlq.push(params);
  });

  orchestrator.on('message:all', async (params) => {
    const message = JSON.stringify(params);
    debug && console.info(`orchestrator: message:all ${message}`);
    for (const [id, child] of orchestrator.children.entries()) {
      debug && console.info(`orchestrator: copy-passing ${message} to ${id}`);
      child.emit(params.kind, params);
      debug && console.info(`${id}: done handling ${message}`);
    }
  });

  function registerActor(id) {
    const actor = new EventEmitter();
    actor.id = id;

    actor.send = function(params) {
      orchestrator.emit('message', {
        ...params,
        from: id,
      });
    }

    orchestrator.children.set(id, actor);
    return actor;
  }

  function send(params) {
    orchestrator.emit('message', {
      ...params,
      from: undefined,
    });
  }

  function sendAll(params) {
    orchestrator.emit('message:all', {
      ...params,
    });
  }

  return {
    registerActor,
    send,
    sendAll,
  };

}