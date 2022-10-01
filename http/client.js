
async function send(command) {
  const log = document.querySelector('#log');
  const result = await fetch('/repl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command }),
  })
  log.value += await result.text() + '\n';
  log.scrollTop = log.scrollHeight;
}

async function main() {
  document.querySelector('#log').value = '';
  send('help');

  const input = document.querySelector('#repl');
  const form = document.querySelector('#controls');
  const submit = document.querySelector('#submit');

  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    ev.stopPropagation();
    submit.disabled = true;
    await send(input.value);
    input.value = '';
    submit.disabled = false;
  })
}

main();