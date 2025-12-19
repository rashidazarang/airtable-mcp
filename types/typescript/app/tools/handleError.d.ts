import { AppContext } from '../context';
export declare function handleToolError(toolName: string, error: unknown, ctx: AppContext): {
    isError: boolean;
    content: {
        type: "text";
        text: string;
    }[];
};
