import { JsonMap } from '@salesforce/ts-types';
import { Connection } from 'jsforce';

export default class AutomationQuery {
  private org: Connection;

  constructor(org: Connection) {
    this.org = org;
  }

  public async query(params: QueryParams): Promise<Automation[]> {
    const records: Automation[] = [];
    const objectIds = (await this.org.tooling.sobject('EntityDefinition')
      .find({
        QualifiedApiName: params.objects
      })
      .select(['DurableId'])
      .execute()).map(entity => entity.DurableId);
    if (params.types.includes('ApexTrigger')) {
      const triggers = await this.org.tooling.sobject('ApexTrigger')
        .find({
          'EntityDefinition.DurableId': objectIds
        })
        .select(['Status', 'EntityDefinition.QualifiedApiName', 'FullName'])
        .execute();
      records.push(...triggers.map(t => ({
        name: t.FullName,
        type: 'ApexTrigger',
        object: t.EntityDefinition.QualifiedApiName,
        active: t.Status === 'Active'
      })));
    }
    if (params.types.includes('ApprovalProcess')) {
      const approvalProcesses = await this.org.sobject('ProcessDefinition')
        .find({
          TableEnumOrId: params.objects
        })
        .select(['DeveloperName', 'State', 'TableEnumOrId'])
        .execute();
      records.push(...approvalProcesses.map(t => ({
        name: t.DeveloperName,
        type: 'ApprovalProcess',
        object: t.TableEnumOrId,
        active: t.Status === 'Active'
      })));
    }
    return records;
  }
}

export interface Automation extends JsonMap {
  name: string;
  type: string;
  object: string;
  active: boolean;
}

export interface QueryParams {
  types: string[];
  objects: string[];
  active?: boolean;
  name?: string[];
}
