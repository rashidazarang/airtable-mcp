import { E2EHarness, createHarness } from './harness';
import { ALL_TOOL_NAMES, CORE_TOOLSET } from '../../src/typescript/app/toolset';

/**
 * AIRTABLE_TOOLSET compatibility profiles: some clients cap enabled tools
 * (Cursor allows 40 across all servers), so the server must be able to
 * register a subset without touching the tool modules.
 */
describe('toolset selection (e2e)', () => {
  let harness: E2EHarness | undefined;

  afterEach(async () => {
    await harness?.close();
    harness = undefined;
  });

  async function listToolNames(h: E2EHarness): Promise<string[]> {
    const result = await h.client.listTools();
    return result.tools.map((tool) => tool.name).sort();
  }

  it('registers every tool by default, matching the toolset manifest', async () => {
    harness = await createHarness();
    const names = await listToolNames(harness);
    expect(names).toEqual([...ALL_TOOL_NAMES].sort());
  });

  it('registers only the core profile under AIRTABLE_TOOLSET=core', async () => {
    harness = await createHarness({ toolset: 'core' });
    const names = await listToolNames(harness);
    expect(names).toEqual([...CORE_TOOLSET].sort());
    expect(names).not.toContain('create_table');
    expect(names).not.toContain('create_webhook');
    // Cursor caps agents at 40 enabled tools across all servers.
    expect(names.length).toBeLessThanOrEqual(40);
  });

  it('registers an explicit comma-separated allowlist', async () => {
    harness = await createHarness({ toolset: 'describe,query, get_record' });
    const names = await listToolNames(harness);
    expect(names).toEqual(['describe', 'get_record', 'query']);
  });

  it('ignores unknown names and keeps the known ones', async () => {
    harness = await createHarness({ toolset: 'describe,not_a_real_tool' });
    const names = await listToolNames(harness);
    expect(names).toEqual(['describe']);
  });

  it('still serves a selected tool end to end', async () => {
    harness = await createHarness({ toolset: 'core' });
    const result: any = await harness.client.callTool({
      name: 'describe',
      arguments: { scope: 'base', baseId: 'appTestBase0000001', detailLevel: 'tableIdentifiersOnly' }
    });
    expect(result.isError).toBeFalsy();
    expect(result.structuredContent.tables.length).toBeGreaterThan(0);
  });
});
