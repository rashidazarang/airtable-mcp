import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AppContext } from '../context';
import { z } from 'zod';
declare const listBasesOutputSchema: z.ZodObject<{
    bases: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        permissionLevel: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListBasesOutput = z.infer<typeof listBasesOutputSchema>;
export declare function registerListBasesTool(server: McpServer, ctx: AppContext): void;
export {};
