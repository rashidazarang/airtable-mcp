import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { AppConfig } from '../../src/typescript/app/config';
import { AppContext } from '../../src/typescript/app/context';
import { AirtableClient } from '../../src/typescript/app/airtable-client';
import { GovernanceService } from '../../src/typescript/app/governance';
import { ExceptionStore } from '../../src/typescript/app/exceptions';
import { Logger } from '../../src/typescript/app/logger';
import { registerAllTools } from '../../src/typescript/app/tools';
import { GovernanceSnapshot } from '../../src/typescript/app/types';
import { NotFoundError } from '../../src/typescript/errors';

/**
 * End-to-end harness: runs the real McpServer with all tools registered,
 * connected to a real MCP Client over the SDK's in-memory transport. Only the
 * outbound Airtable HTTP layer is faked, so every request travels the full
 * path: client → protocol → tool handler → zod parsing → SDK output-schema
 * validation → client-side output validation.
 */

export interface FixtureField {
  id: string;
  name: string;
  type?: string;
  options?: Record<string, unknown>;
}

export interface FixtureTable {
  id: string;
  name: string;
  primaryFieldId?: string;
  fields: FixtureField[];
  views: Array<{ id: string; name: string; type?: string }>;
}

export interface FixtureRecord {
  id: string;
  createdTime?: string;
  fields: Record<string, unknown>;
}

export interface FixtureBase {
  id: string;
  name: string;
  tables: FixtureTable[];
  /** keyed by table id AND table name for convenience */
  records: Record<string, FixtureRecord[]>;
}

export interface DeleteCall {
  baseId: string;
  table: string;
  recordIds: string[];
  idempotencyKey?: string;
}

/**
 * Fake of the AirtableClient surface the tools under test touch. Records
 * mutating calls so tests can assert what would have hit the network.
 */
export class FakeAirtableClient {
  readonly deleteCalls: DeleteCall[] = [];

  constructor(private readonly base: FixtureBase) {}

  async getBase(_baseId: string): Promise<unknown> {
    return { id: this.base.id, name: this.base.name };
  }

  async listTables(_baseId: string): Promise<unknown> {
    return { tables: this.base.tables };
  }

  async getRecord(baseId: string, table: string, recordId: string): Promise<unknown> {
    const records = this.recordsForTable(table);
    const match = records.find((record) => record.id === recordId);
    if (!match) {
      throw new NotFoundError(`Record ${recordId} not found`, {
        context: { baseId, table }
      });
    }
    return match;
  }

  async deleteRecords(
    baseId: string,
    table: string,
    recordIds: string[],
    idempotencyKey?: string
  ): Promise<unknown> {
    const call: DeleteCall = { baseId, table, recordIds };
    if (idempotencyKey) {
      call.idempotencyKey = idempotencyKey;
    }
    this.deleteCalls.push(call);
    return { records: recordIds.map((id) => ({ id, deleted: true })) };
  }

  private recordsForTable(table: string): FixtureRecord[] {
    if (this.base.records[table]) {
      return this.base.records[table]!;
    }
    const match = this.base.tables.find(
      (entry) => entry.name.toLowerCase() === table.toLowerCase() || entry.id === table
    );
    if (match) {
      return this.base.records[match.id] ?? this.base.records[match.name] ?? [];
    }
    return [];
  }
}

export const TEST_BASE_ID = 'appTestBase0000001';

export function defaultFixture(): FixtureBase {
  return {
    id: TEST_BASE_ID,
    name: 'E2E Test Base',
    tables: [
      {
        id: 'tblTasks',
        name: 'Tasks',
        primaryFieldId: 'fldName',
        fields: [
          { id: 'fldName', name: 'Name', type: 'singleLineText' },
          {
            id: 'fldProject',
            name: 'Project',
            type: 'multipleRecordLinks',
            options: { linkedTableId: 'tblProjects' }
          },
          // Field with no `type` in the meta API payload: describe at `full`
          // must omit the key, not invent an empty string.
          { id: 'fldWeird', name: 'Untyped' }
        ],
        views: [{ id: 'viwAll', name: 'All tasks', type: 'grid' }]
      },
      {
        id: 'tblProjects',
        name: 'Projects',
        primaryFieldId: 'fldTitle',
        fields: [{ id: 'fldTitle', name: 'Title', type: 'singleLineText' }],
        views: [{ id: 'viwProjects', name: 'All projects', type: 'grid' }]
      }
    ],
    records: {
      tblTasks: [
        {
          id: 'recTask1',
          createdTime: '2026-01-01T00:00:00.000Z',
          fields: { Name: 'Task 1', Project: ['recProj1'] }
        },
        {
          id: 'recTask2',
          createdTime: '2026-01-02T00:00:00.000Z',
          fields: { Name: 'Task 2' }
        }
      ],
      tblProjects: [
        {
          id: 'recProj1',
          createdTime: '2026-01-01T00:00:00.000Z',
          fields: { Title: 'Project 1' }
        }
      ]
    }
  };
}

const ALL_OPERATIONS: GovernanceSnapshot['allowedOperations'] = [
  'describe',
  'query',
  'create',
  'update',
  'upsert',
  'delete',
  'manage_schema',
  'manage_webhooks',
  'manage_comments'
];

export interface HarnessOptions {
  fixture?: FixtureBase;
  allowedOperations?: GovernanceSnapshot['allowedOperations'];
}

export interface E2EHarness {
  client: Client;
  server: McpServer;
  fake: FakeAirtableClient;
  close: () => Promise<void>;
}

export async function createHarness(options: HarnessOptions = {}): Promise<E2EHarness> {
  const fixture = options.fixture ?? defaultFixture();
  const fake = new FakeAirtableClient(fixture);

  const governanceSnapshot: GovernanceSnapshot = {
    allowedBases: [],
    allowedTables: [],
    allowedOperations: options.allowedOperations ?? [...ALL_OPERATIONS],
    piiFields: [],
    redactionPolicy: 'mask_on_inline',
    loggingPolicy: 'minimal',
    retentionDays: 7
  };

  const config: AppConfig = {
    version: '0.0.0-e2e',
    auth: {
      personalAccessToken: 'pat_e2e_test_token',
      patHash: 'e2e-hash',
      allowedBases: [],
      tokenFormatWarnings: []
    },
    governance: governanceSnapshot,
    logLevel: 'error',
    exceptionQueueSize: 50
  };

  const logger = new Logger('error', { component: 'e2e' });

  const ctx: AppContext = {
    config,
    logger,
    airtable: fake as unknown as AirtableClient,
    governance: new GovernanceService(governanceSnapshot),
    exceptions: new ExceptionStore(config.exceptionQueueSize, logger)
  };

  const server = new McpServer(
    { name: 'airtable-brain-e2e', version: config.version },
    { capabilities: { tools: {} } }
  );
  registerAllTools(server, ctx);

  const client = new Client({ name: 'e2e-client', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  return {
    client,
    server,
    fake,
    close: async () => {
      await client.close();
      await server.close();
    }
  };
}
