import { flags, SfdxCommand } from './node_modules/@salesforce/command';
import { Messages, SfdxError } from './node_modules/@salesforce/core';
import { AnyJson } from './node_modules/@salesforce/ts-types';
import AutomationQuery from '../../lib/AutomationQuery';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('kacrouse', 'orgAutomationList');

export default class Trace extends SfdxCommand {
  // todo
  public static description = messages.getMessage('commandDescription');

  // todo
  public static examples = [];

  public static args = [];

  protected static flagsConfig = {
    name: flags.string({
      description: 'The name of the automation to retrieve.',
      multiple: true
    }),
    type: flags.string({
      description: 'The automation type to list. Defaults to all types.',
      options: ['ApexTrigger', 'ProcessBuilder', 'ApprovalProcess', 'ValidationRule', 'WorkflowRule'],
      multiple: true
    }),
    object: flags.string({
      description: 'The object to retrieve automation for. Defaults to all objects.',
      multiple: true
    }),
    namespace: flags.string({
      description: 'The namespace to retrieve automation for. Defaults to all namespaces.',
      multiple: true
    }),
    active: flags.boolean({
      description: 'Retrieve only active automation',
      exclusive: ['inactive']
    }),
    inactive: flags.boolean({
      description: 'Retrieve only inactive automation',
      exclusive: ['active']
    })
  };

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const conn = this.org.getConnection();
    return await new AutomationQuery(conn).query({
      types: ['ApprovalProcess'],
      objects: ['Strategy_Execution__c']
    });
  }
}
