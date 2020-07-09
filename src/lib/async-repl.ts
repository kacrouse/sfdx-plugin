const repl = require('repl');

const awaitMatcher = /^(?:\s*(?:(?:let|var|const)\s)?\s*([^=]+)=\s*|^\s*)(await\s[\s\S]*)/;

const awaitEval = (baseEval) => (cmd, context, filename, callback) => {
  let wrappedCmd = cmd;
  const match = wrappedCmd.match(awaitMatcher);
  if (match) {
    wrappedCmd = `(function(){ async function _wrap() { return ${match[1] ? `global.${match[1]} = ` : ''}${match[2]} } return _wrap();})()`;
  }

  baseEval(wrappedCmd, context, filename, (error, result) => {
    if (error) {
      callback(error);
    } else if (result === undefined) {
      callback();
    } else if (result && typeof result.then === 'function') {
      result.then((res) => callback(null, res)).catch((err) => callback(err));
    } else {
      callback(null, result);
    }
  });
}

const start = (options) => {
  const replInstance = repl.start({
    ...(typeof options === 'string' ? { prompt: options } : options),
  });
  replInstance.eval = awaitEval(replInstance.eval);
  return replInstance;
}

export default start;