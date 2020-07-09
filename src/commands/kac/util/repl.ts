import { flags, FlagsConfig, SfdxCommand } from '@salesforce/command';
import { Org } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import start from '../../../lib/async-repl';
import { Connection } from 'jsforce';

const DESTRUCTIVE_FUNCTIONS = [
  'remove',
  'addUsername',
  'removeUsername',
  'setSandboxOrgConfigField',
  'removeAuth',
  'removeUsersConfig',
  'removeUsers',
  'removeSandboxConfig'
];

export default class REPL extends SfdxCommand {
  protected static supportsUsername = true;
  protected static supportsDevhubUsername = true;
  protected static varargs = true;

  protected static flagsConfig: FlagsConfig = {
    allowdestructive: flags.boolean({
      char: 'd',
      description: 'Make destructive methods available on the connection object.'
    })
  };

  public async run(): Promise<AnyJson> {
    console.log(getAllProps(this.org));
    const server = start({
      prompt: '>> '
    });
    const org = this.org;
    server.context.org = createOrgProxy(org);
    server.context.args = this.varargs;
    return {};
  }
}

const createOrgProxy = (org: Org) => {
  return new Proxy(org, {
    get: (target, p, receiver) => {
      if (DESTRUCTIVE_FUNCTIONS.includes(p)) {
        return new Proxy(target[p], {
          apply: (target, thisArg, argArray) => {
            throw Error('Unsafe')
          }
        });
      } else {
        return target[p];
      }
    },
  });
}

const getAllProps = (obj: object) => {
  const prototypeChain = ((obj: object, chain = []): Array<object> => {
    const prototype = Object.getPrototypeOf(obj);
    if (prototype) {
      return prototypeChain(prototype, [...chain, prototype]);
    }
    return chain;
  });
  const prototypes = prototypeChain(obj);
  return prototypes.reduce((props: Array<string>, proto) => [...props, ...Object.getOwnPropertyNames(proto).map(prop => ({ name: prop, type: typeof proto[prop] }))], [])
}