import { Logger } from './logger';
/**
 * Toolset selection for MCP-client compatibility.
 *
 * Some clients cap how many tools an agent may have enabled (Cursor enforces
 * 40 across all active servers), and lean toolsets also cost less context.
 * AIRTABLE_TOOLSET selects which tools this server registers:
 *
 * - unset / "full"  — all 42 tools (default)
 * - "core"          — the 18 record-centric tools (reads, writes, batches,
 *                     governance); fits comfortably under Cursor's cap
 * - comma list      — an explicit allowlist of tool names, e.g.
 *                     "describe,query,list_records,get_record"
 */
export declare const ALL_TOOL_NAMES: readonly ["list_bases", "describe", "query", "list_governance", "list_exceptions", "create", "update", "upsert", "list_webhooks", "create_webhook", "delete_webhook", "refresh_webhook", "get_webhook_payloads", "get_record", "delete_record", "search_records", "list_records", "get_base_schema", "list_tables", "list_field_types", "get_table_views", "create_table", "update_table", "delete_table", "create_field", "update_field", "delete_field", "batch_create_records", "batch_update_records", "batch_delete_records", "batch_upsert_records", "create_view", "get_view_metadata", "upload_attachment", "create_base", "list_collaborators", "list_shares", "list_comments", "create_comment", "update_comment", "delete_comment", "whoami"];
export type ToolName = (typeof ALL_TOOL_NAMES)[number];
/** Record-centric everyday tools; no schema/webhook/comment management. */
export declare const CORE_TOOLSET: readonly ToolName[];
export interface ToolsetConfig {
    mode: 'full' | 'core' | 'custom';
    /** Tool names to register. Always populated (full mode lists everything). */
    names: ReadonlySet<string>;
}
export declare function resolveToolset(raw: string | undefined, logger?: Logger): ToolsetConfig;
