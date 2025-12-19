import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { AppContext } from '../context';
import { z } from 'zod';
declare const listBasesOutputSchema: z.ZodObject<{
    bases: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        permissionLevel: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        permissionLevel?: string | undefined;
    }, {
        id: string;
        name: string;
        permissionLevel?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    bases: {
        id: string;
        name: string;
        permissionLevel?: string | undefined;
    }[];
}, {
    bases: {
        id: string;
        name: string;
        permissionLevel?: string | undefined;
    }[];
}>;
export type ListBasesOutput = z.infer<typeof listBasesOutputSchema>;
export declare function registerListBasesTool(server: McpServer, ctx: AppContext): void;
export {};
