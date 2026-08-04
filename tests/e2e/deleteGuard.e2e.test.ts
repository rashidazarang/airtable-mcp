import { E2EHarness, TEST_BASE_ID, createHarness } from './harness';

/**
 * E2E tests for the guarded delete flow (issue #28, feature gap): dryRun
 * previews the records and their linked-record impact without deleting, and
 * the real delete forwards the idempotency key to the Airtable client.
 */

const DELETE_TOOLS = ['delete_record', 'batch_delete_records'] as const;

describe.each(DELETE_TOOLS)('%s (e2e)', (toolName) => {
  let harness: E2EHarness;

  beforeEach(async () => {
    harness = await createHarness();
  });

  afterEach(async () => {
    await harness.close();
  });

  it('dryRun previews fields and linked-record impact without deleting', async () => {
    const result: any = await harness.client.callTool({
      name: toolName,
      arguments: {
        baseId: TEST_BASE_ID,
        table: 'Tasks',
        recordIds: ['recTask1', 'recTask2'],
        dryRun: true
      }
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.dryRun).toBe(true);
    expect(result.structuredContent.count).toBe(2);

    const [task1, task2] = result.structuredContent.records;

    expect(task1.id).toBe('recTask1');
    expect(task1.fields).toEqual({ Name: 'Task 1', Project: ['recProj1'] });
    expect(task1.linkedRecordImpact).toEqual([
      {
        field: 'Project',
        fieldId: 'fldProject',
        linkedTableId: 'tblProjects',
        linkedRecordIds: ['recProj1']
      }
    ]);

    expect(task2.id).toBe('recTask2');
    expect(task2.linkedRecordImpact).toEqual([]);

    // Nothing must reach the delete endpoint on a dry run.
    expect(harness.fake.deleteCalls).toHaveLength(0);
  });

  it('dryRun errors on a missing record instead of previewing partial state', async () => {
    const result: any = await harness.client.callTool({
      name: toolName,
      arguments: {
        baseId: TEST_BASE_ID,
        table: 'Tasks',
        recordIds: ['recDoesNotExist'],
        dryRun: true
      }
    });

    expect(result.isError).toBe(true);
    expect(harness.fake.deleteCalls).toHaveLength(0);
  });

  it('deletes records and forwards the idempotency key', async () => {
    const result: any = await harness.client.callTool({
      name: toolName,
      arguments: {
        baseId: TEST_BASE_ID,
        table: 'Tasks',
        recordIds: ['recTask1', 'recTask2'],
        idempotencyKey: 'e2e-delete-001'
      }
    });

    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.dryRun).toBe(false);
    expect(result.structuredContent.deletedIds).toEqual(['recTask1', 'recTask2']);
    expect(result.structuredContent.count).toBe(2);

    expect(harness.fake.deleteCalls).toEqual([
      {
        baseId: TEST_BASE_ID,
        table: 'Tasks',
        recordIds: ['recTask1', 'recTask2'],
        idempotencyKey: 'e2e-delete-001'
      }
    ]);
  });

  it('is blocked by governance when delete is not an allowed operation', async () => {
    const restricted = await createHarness({
      allowedOperations: ['describe', 'query']
    });

    try {
      const result: any = await restricted.client.callTool({
        name: toolName,
        arguments: {
          baseId: TEST_BASE_ID,
          table: 'Tasks',
          recordIds: ['recTask1']
        }
      });

      expect(result.isError).toBe(true);
      expect(restricted.fake.deleteCalls).toHaveLength(0);
    } finally {
      await restricted.close();
    }
  });
});
