
import { Handler, Entry, Level } from 'aono';

export type LogMethod = (message : string, ...meta : any[]) => void;

export interface Console {
  trace : LogMethod;
  debug : LogMethod;
  info : LogMethod;
  warn : LogMethod;
  error : LogMethod;
}

/**
 * @author Maciej Chalapuk (maciej@chalapuk.pl)
 */
export class ConsoleHandler implements Handler {
  private _messagesWritten = 0;

  constructor(
    readonly console : Console,
  ) {
  }

  get messagesWritten() {
    return this._messagesWritten;
  }

  async write(entries : Entry[]) : Promise<void> {
    if (entries.length === 0) {
      return;
    }

    entries.forEach(entry => {
      const { level, logger, message, meta } = entry;

      const log : LogMethod = getBoundMethod(this.console, level);
      const formatted = `${getIcon(level)} [${logger}]: ${message}`;

      if (Object.keys(meta).length !== 0) {
        log(formatted, meta);
      } else {
        log(formatted);
      }
      this._messagesWritten += 1;
    });

    return Promise.resolve();
  }
}

export default ConsoleHandler;

function getIcon(level : Level) {
  switch (level) {
    case 'trace': return '→';
    case 'debug': return '⇒';
    case 'info': return '✓';
    case 'warn': return '⚠';
    case 'error': return '💥'
    default: throw new Error(`uncknown entry kevek`);
  }
}

function getBoundMethod(instance : any, name : Level) {
  return instance[name].bind(instance);
}

