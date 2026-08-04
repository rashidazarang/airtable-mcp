import { E2EHarness, TEST_BASE_ID, createHarness } from './harness';

/**
 * E2E regression tests for issue #28: `describe` must not reject its own
 * output at any detailLevel. Calls travel through the real MCP client/server
 * pair, so the SDK's output-schema validation runs on both sides.
 */

describe('describe (e2e)', () => {
  let harness: E2EHarness;

  beforeEach(async () => {
    harness = await createHarness();
  });

  afterEach(async () => {
    await harness.close();
  });

  it('succeeds at detailLevel identifiersOnly (issue #28 regression)', async () => {
    const result: any = await harness.client.callTool({
      name: 'describe',
      arguments: { scope: 'base', baseId: TEST_BASE_ID, detailLevel: 'identifiersOnly' }
    });

    expect(result.isError).toBeFalsy();
    const tables = result.structuredContent?.tables;
    expect(Array.isArray(tables)).toBe(true);
    expect(tables).toHaveLength(2);

    for (const table of tables) {
      expect(typeof table.id).toBe('string');
      expect(typeof table.name).toBe('string');
      for (const field of table.fields ?? []) {
        expect(typeof field.id).toBe('string');
        expect(typeof field.name).toBe('string');
        // identifiersOnly omits type entirely — the key must not exist.
        expect('type' in field).toBe(false);
      }
    }
  });

  it('succeeds at detailLevel identifiersOnly with scope table', async () => {
    const result: any = await harness.client.callTool({
      name: 'describe',
      arguments: {
        scope: 'table',
        baseId: TEST_BASE_ID,
        table: 'Tasks',
        detailLevel: 'identifiersOnly'
      }
    });

    expect(result.isError).toBeFalsy();
    const tables = result.structuredContent?.tables;
    expect(tables).toHaveLength(1);
    expect(tables[0].name).toBe('Tasks');
    expect(tables[0].fields.length).toBeGreaterThan(0);
    for (const field of tables[0].fields) {
      expect('type' in field).toBe(false);
    }
  });

  it('succeeds at detailLevel tableIdentifiersOnly with only ids and names', async () => {
    const result: any = await harness.client.callTool({
      name: 'describe',
      arguments: { scope: 'base', baseId: TEST_BASE_ID, detailLevel: 'tableIdentifiersOnly' }
    });

    expect(result.isError).toBeFalsy();
    const tables = result.structuredContent?.tables;
    expect(tables).toHaveLength(2);
    for (const table of tables) {
      expect(table.fields).toBeUndefined();
      expect(table.views).toBeUndefined();
    }
  });

  it('includes field types at detailLevel full, omitting type for untyped fields', async () => {
    const result: any = await harness.client.callTool({
      name: 'describe',
      arguments: { scope: 'base', baseId: TEST_BASE_ID, detailLevel: 'full' }
    });

    expect(result.isError).toBeFalsy();
    const tasks = result.structuredContent?.tables?.find((t: any) => t.name === 'Tasks');
    expect(tasks).toBeDefined();

    const byName: Record<string, any> = {};
    for (const field of tasks.fields) {
      byName[field.name] = field;
    }

    expect(byName['Name'].type).toBe('singleLineText');
    expect(byName['Project'].type).toBe('multipleRecordLinks');
    expect(byName['Project'].options).toEqual({ linkedTableId: 'tblProjects' });

    // A field whose meta entry has no type must omit the key — "" is not a
    // valid Airtable field type (issue #28, secondary bug).
    expect(byName['Untyped']).toBeDefined();
    expect('type' in byName['Untyped']).toBe(false);
  });
});
