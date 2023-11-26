
import * as fs from 'fs';
import * as util from 'util';
import * as glob from 'glob';

import * as sinon from 'sinon';
import * as should from 'should';

import { Entry } from 'aono';
import ConsoleHandler from './ConsoleHandler';

describe('ConsoleHandler', () => {
  const console = {
    debug: sinon.spy(),
    log: sinon.spy(),
    warn: sinon.spy(),
    error: sinon.spy(),
  };

  let testedHandler : ConsoleHandler;

  afterEach(() => {
    console.debug.resetHistory();
    console.log.resetHistory();
    console.warn.resetHistory();
    console.error.resetHistory();
  });

  describe('after creation', () => {
    beforeEach(() => {
      testedHandler = new ConsoleHandler(console);
    });

    it('contains passed parameters', () => {
      testedHandler.console.should.equal(console);
    });
    it('contains zero messagesWritten', () => {
      testedHandler.messagesWritten.should.equal(0);
    });

    describe('when after handling log entry without meta', () => {
      const entry : Entry = {
        timestamp: 0,
        logger: 'test',
        level: 'info',
        message: 'hello, console!',
        meta: {},
      };

      beforeEach(() => {
        return testedHandler.write([ entry ]);
      });

      it('contains properly set bytesWritten', () => {
        testedHandler.messagesWritten.should.equal(1);
      });

      it('wrote log entry to the console instance', () => {
        console.log.should.have.callCount(1);
        console.log.should.have.been.calledWithExactly('✅ [test]: hello, console!');
      });

      describe('when after handling log entry with meta', () => {
        const entry : Entry = {
          timestamp: 0,
          logger: 'test',
          level: 'trace',
          message: 'hello, debug!',
          meta: {
            number: 1,
          },
        };

        beforeEach(() => {
          return testedHandler.write([ entry ]);
        });

        it('contains properly set messagesWritten', () => {
          testedHandler.messagesWritten.should.equal(2);
        });

        it('wrote log entry to the console instance', () => {
          console.debug.should.have.callCount(1);
          console.debug.should.have.been.calledWithExactly('✴︎ [test]: hello, debug!', entry.meta);
        });
      });
    });
  });
});

