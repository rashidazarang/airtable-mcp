import { GovernanceSnapshot } from './types';
import { GovernanceError } from '../errors';

type Operation = GovernanceSnapshot['allowedOperations'][number];

export class GovernanceService {
  private readonly snapshot: GovernanceSnapshot;
  private readonly tablesByBase: Map<string, Set<string>>;

  constructor(snapshot: GovernanceSnapshot) {
    this.snapshot = snapshot;
    this.tablesByBase = this.buildTableIndex(snapshot);
  }

  ensureBaseAllowed(baseId: string): void {
    // If allowedBases is empty, allow all bases (user will use list_bases to discover)
    if (this.snapshot.allowedBases.length > 0 && !this.snapshot.allowedBases.includes(baseId)) {
      throw new GovernanceError(`Base ${baseId} is not in the allow-list`, {
        context: { baseId, governanceRule: 'allowedBases' }
      });
    }
  }

  ensureOperationAllowed(operation: Operation): void {
    if (!this.snapshot.allowedOperations.includes(operation)) {
      throw new GovernanceError(`Operation ${operation} is not permitted`, {
        context: { governanceRule: 'allowedOperations' }
      });
    }
  }

  ensureTableAllowed(baseId: string, table: string): void {
    if (!this.isTableAllowed(baseId, table)) {
      throw new GovernanceError(`Table ${table} is not allowed in base ${baseId}`, {
        context: { baseId, table, governanceRule: 'allowedTables' }
      });
    }
  }

  listPiiPolicies(baseId: string, table: string): Array<{ field: string; policy: string }> {
    return this.snapshot.piiFields
      ?.filter((field) => field.baseId === baseId && field.table === table)
      .map((field) => ({ field: field.field, policy: field.policy })) ?? [];
  }

  getSnapshot(): GovernanceSnapshot {
    return this.snapshot;
  }

  isTableAllowed(baseId: string, table: string): boolean {
    const allowedTables = this.tablesByBase.get(baseId);
    if (!allowedTables || allowedTables.size === 0) {
      return true;
    }
    return allowedTables.has(table);
  }

  private buildTableIndex(snapshot: GovernanceSnapshot): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    for (const item of snapshot.allowedTables ?? []) {
      const baseTables = map.get(item.baseId) ?? new Set<string>();
      baseTables.add(item.table);
      map.set(item.baseId, baseTables);
    }
    return map;
  }
}
