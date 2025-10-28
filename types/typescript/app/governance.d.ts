import { GovernanceSnapshot } from './types';
type Operation = GovernanceSnapshot['allowedOperations'][number];
export declare class GovernanceService {
    private readonly snapshot;
    private readonly tablesByBase;
    constructor(snapshot: GovernanceSnapshot);
    ensureBaseAllowed(baseId: string): void;
    ensureOperationAllowed(operation: Operation): void;
    ensureTableAllowed(baseId: string, table: string): void;
    listPiiPolicies(baseId: string, table: string): Array<{
        field: string;
        policy: string;
    }>;
    getSnapshot(): GovernanceSnapshot;
    isTableAllowed(baseId: string, table: string): boolean;
    private buildTableIndex;
}
export {};
