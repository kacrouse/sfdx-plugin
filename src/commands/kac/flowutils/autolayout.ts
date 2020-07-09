import { flags, SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import ELK from 'elkjs';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('kacrouse', 'flowutilsAutolayout');

const SHAPE_HEIGHT = 132;
const SHAPE_WIDTH = 132;
const LABEL_HEIGHT = 23;
const LABEL_WIDTH_PER_CHAR = 5;
const LABEL_HORIZONTAL_PADDING = 16;
const FLOW_SHAPE_PROPERTIES = [
  'actionCalls',
  'apexPluginCalls',
  'assignments',
  'decisions',
  'loops',
  'recordCreates',
  'recordDeletes',
  'recordLookups',
  'recordUpdates',
  'screens',
  'subflows',
  'waits'
];
const FLOW_EDGE_LABELS = {
  faultConnector: 'Fault',
  nextValueConnector: 'For each item',
  noMoreValuesConnector: 'After last item',
  defaultConnector: 'Default Outcome'
};

export default class AutoLayout extends SfdxCommand {
  // todo
  public static description = messages.getMessage('commandDescription');

  // todo
  public static examples = [
    `$ sfdx hello:org --targetusername myOrg@example.com --targetdevhubusername devhub@org.com
  Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  My hub org id is: 00Dxx000000001234
  `,
    `$ sfdx hello:org --name myname --targetusername myOrg@example.com
  Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  `
  ];

  public static args = [
    {
      name: 'flowDevName',
      required: true,
      description: 'The Developer Name of the Flow to autolayout'
    }
  ];

  // add a flag for flow version
  protected static flagsConfig = {};

  protected static requiresUsername = true;
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    const conn = this.org.getConnection();

    // todo: possible to make it fit in the screen? or condense?
    // todo: test with disconnected shapes
    // todo: should only operate on inactive flows
    // allow version specification, default get most recent version
    const elk = new ELK();

    const flowDefinitions = await conn.tooling.query(`SELECT LatestVersionId, LatestVersion.VersionNumber, Id, LatestVersion.Status FROM FlowDefinition WHERE DeveloperName = '${this.args.flowDevName}'`);
    const flows = await conn.tooling.query(`SELECT Id, Metadata, FullName FROM Flow WHERE Id = '${flowDefinitions.records[0].LatestVersionId}'`);
    // const flows = await conn.tooling.query(`SELECT Id, Metadata, FullName FROM Flow WHERE Definition.DeveloperName = '${this.args.flowDevName}'`);
    // return;
    const flowRecord = flows.records[0];
    const graph = transform(flowRecord);
    const layout = await elk.layout(graph, {
      layoutOptions: {
        'elk.algorithm': 'layered'
      }
    });
    applyLayout(flowRecord.Metadata, layout);

    const result = await conn.tooling.update('Flow', flowRecord);
    console.log(result);
    return {};
  }
}

function transform(flow: object): ElkGraph {
  const metadata = flow.Metadata;

  //todo: test apex plugin calls
  const children = FLOW_SHAPE_PROPERTIES.map(prop => toNodes(metadata[prop])).flat();
  const edges: ElkEdge[] = [];
  edges.push(...metadata.actionCalls.map(shape => toEdges(['connector', 'faultConnector'], shape)).flat());
  edges.push(...metadata.assignments.map(shape => toEdges(['connector'], shape)).flat());

  FLOW_EDGE_LABELS.defaultConnector = metadata.decisions.defaultConnectorLabel || FLOW_EDGE_LABELS.defaultConnector;
  edges.push(...metadata.decisions.map(shape => toEdges(['defaultConnector'], shape)).flat());
  edges.push(...metadata.decisions.reduce((allEdges, shape) => {
    if (shape.rules) {
      allEdges.push(...shape.rules.reduce((ruleEdges, rule) => {
        if (rule.connector) {
          ruleEdges.push({
            id: shape.name + rule.connector.targetReference,
            sources: [shape.name],
            targets: [rule.connector.targetReference],
            labels: [getLabel(rule.label)]
          });
        }
        return ruleEdges;
      }, []));
    }
    return allEdges;
  }, []));
  edges.push(...metadata.loops.map(shape => toEdges(['nextValueConnector', 'noMoreValuesConnector'], shape)).flat());
  edges.push(...metadata.recordCreates.map(shape => toEdges(['connector', 'faultConnector'], shape)).flat());
  edges.push(...metadata.recordDeletes.map(shape => toEdges(['connector', 'faultConnector'], shape)).flat());
  edges.push(...metadata.recordLookups.map(shape => toEdges(['connector', 'faultConnector'], shape)).flat());
  edges.push(...metadata.recordUpdates.map(shape => toEdges(['connector', 'faultConnector'], shape)).flat());
  edges.push(...metadata.screens.map(shape => toEdges(['connector'], shape)).flat());
  edges.push(...metadata.subflows.map(shape => toEdges(['connector'], shape)).flat());

  return {
    id: 'start',
    children,
    edges
  };
}

function toNodes(shapes: object[]): ElkNode[] {
  return shapes.map(shape => ({
    id: shape.name,
    width: SHAPE_WIDTH,
    height: SHAPE_HEIGHT
  }));
}

function toEdges(connectorProps, shape): ElkEdge[] {
  return connectorProps
    .filter(prop => shape[prop])
    .map(prop => {
      const edge = {
        id: shape.name + shape[prop].targetReference,
        sources: [shape.name],
        targets: [shape[prop].targetReference]
      };

      if (prop in FLOW_EDGE_LABELS) {
        edge.labels = [getLabel(FLOW_EDGE_LABELS[prop])];
      }

      return edge;
    });
}

function applyLayout(metadata, layout): object {
  metadata.start.locationX = layout.x;
  metadata.start.locationY = layout.y;
  layout.children.forEach(node => {
    const shape = findShape(metadata, node.id);
    shape.locationX = Math.round(node.x);
    shape.locationY = Math.round(node.y);
  });
  return metadata;
}

function findShape(metadata, name): object {
  return FLOW_SHAPE_PROPERTIES
    .reduce((allShapes, prop) => allShapes.concat(metadata[prop]), [])
    .find(shape => shape.name === name);
}

function getLabelWidth(labelText: string): number {
  const calculatedWidth = LABEL_WIDTH_PER_CHAR * labelText.length + LABEL_HORIZONTAL_PADDING;
  return calculatedWidth > 132 ? 132 : calculatedWidth;
}

function getLabel(labelText: string): ElkLabel {
  return {
    text: labelText,
    width: getLabelWidth(labelText),
    height: LABEL_HEIGHT
  };
}

interface ElkGraph {
  id: string;
  children: ElkNode[];
  edges: ElkEdge[];
}

interface ElkNode {
  id: string;
  width: number;
  height: number;
}

interface ElkEdge {
  id: string;
  sources: string[];
  targets: string[];
  labels: object[];
}

interface ElkLabel {
  text: string;
  width: number;
  height: number;
}
