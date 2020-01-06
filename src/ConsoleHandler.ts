
import { Handler, Entry, Level } from 'aono';

export type LogMethod = (message : string, ...meta : any[]) => void;

export interface Console {
  debug : LogMethod;
  log : LogMethod;
  warn : LogMethod;
  error : LogMethod;
}

const format = prepareFormatter();

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

      const log : LogMethod = getLogMethod(this.console, level);
      const args = format(level, logger, message);

      if (Object.keys(meta).length !== 0) {
        args.push(meta);
      }
      log.apply(this.console, args);
      this._messagesWritten += 1;
    });

    return Promise.resolve();
  }
}

export default ConsoleHandler;

function prepareFormatter() {
  const window = global as any;

  if (window.navigator && window.navigator.userAgent.match(/.*(FireFox|Chrome|Chormium).*/)) {
    return formatBrowser;
  } else {
    return formatNode;
  }
}

function getLogMethod(console : Console, level : Level) {
  switch (level) {
    case 'trace':
      // Not using `console.trace(...)` as it will print stack traces with every log entry.
      return console.debug;
    case 'debug':
      return console.debug;
    case 'info':
      // Not using `console.info(...)` as it will print an icon in Firefox.
      return console.log;
    case 'warn':
      return console.warn;
    case 'error':
      return console.error;
    default:
      throw new Error(`unknown log level: ${level}`);
  }
}

function formatNode(level : Level, logger : string, message : string) : any[] {
  return [ `${getNodeIcon(level)}[${logger}]: ${message}` ];
}

function formatBrowser(level : Level, logger : string, message : string) : any[] {
  const icon = getBrowserIcon(level);
  const color = getColorCss(level);
  const bold = 'font-weight:bold;';

  return [ `%c${icon}%c[%c${logger}%c]%c ${message}`, color + bold, bold, color + bold, bold, '' ];
}

function getNodeIcon(level : Level) {
  switch (level) {
    case 'trace': return '→ ';
    case 'debug': return '⇒ ';
    case 'info': return '✓ ';
    case 'warn': return '⚠ ';
    case 'error': return '💥 ';
    default: throw new Error(`unknown log level: ${level}`);
  }
}

function getBrowserIcon(level : Level) {
  switch (level) {
    case 'trace': return '→ ';
    case 'debug': return '⇒ ';
    case 'info': return '';
    case 'warn': return '';
    case 'error': return '';
    default: throw new Error(`unknown log level: ${level}`);
  }
}

function getColorCss(level : Level) {
  switch (level) {
    case 'trace': return 'color: #ff00ff;';
    case 'debug': return 'color: #0000ff;';
    case 'info': return 'color: #00ff00;';
    case 'warn': return 'color: #ffff00;';
    case 'error': return 'color: #ff0000;';
    default: throw new Error(`unknown log level: ${level}`);
  }
}
