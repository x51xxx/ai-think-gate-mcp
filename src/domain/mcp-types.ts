/**
 * Types from the Model Context Protocol (MCP) that we use in our implementation
 */

/**
 * A progress token, used to associate progress notifications with the original request
 */
export type ProgressToken = string | number;

/**
 * Content annotations for MCP content
 */
export interface ContentAnnotations {
    /**
     * Describes who the intended customer of this object or data is.
     * It can include multiple entries to indicate content useful for multiple audiences (e.g., ["user", "assistant"]).
     */
    audience?: ("user" | "assistant")[];

    /**
     * Describes how important this data is.
     * A value of 1 means "most important," and indicates that the data is effectively required, 
     * while 0 means "least important," and indicates that the data is entirely optional.
     */
    priority?: number;

    /**
     * Additional metadata
     */
    metadata?: Record<string, any>;
}

/**
 * Content item in response
 */
export interface ContentItem {
    type: string;
    text: string;
    data?: string;
    mimeType?: string;
    annotations?: ContentAnnotations;
}

/**
 * Annotations for tools in MCP
 */
export interface ToolAnnotations {
    /**
     * A human-readable title for the tool.
     */
    title?: string;

    /**
     * If true, the tool does not modify its environment.
     * Default: false
     */
    readOnlyHint?: boolean;

    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     * (This property is meaningful only when `readOnlyHint == false`)
     * Default: true
     */
    destructiveHint?: boolean;

    /**
     * If true, calling the tool repeatedly with the same arguments 
     * will have no additional effect on the its environment.
     * (This property is meaningful only when `readOnlyHint == false`)
     * Default: false
     */
    idempotentHint?: boolean;

    /**
     * If true, this tool may interact with an "open world" of external entities.
     * If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     * Default: true
     */
    openWorldHint?: boolean;
}

/**
 * The role of a message sender or recipient
 */
export type Role = "user" | "assistant";

/**
 * Text content in MCP
 */
export interface TextContent {
    type: "text";
    text: string;
    annotations?: ContentAnnotations;
}

/**
 * Image content in MCP
 */
export interface ImageContent {
    type: "image";
    data: string; // base64-encoded image data
    mimeType: string;
    annotations?: ContentAnnotations;
}

/**
 * Audio content in MCP
 */
export interface AudioContent {
    type: "audio";
    data: string; // base64-encoded audio data
    mimeType: string;
    annotations?: ContentAnnotations;
}

/**
 * Message sent to or received from an LLM
 */
export interface SamplingMessage {
    role: Role;
    content: TextContent | ImageContent | AudioContent;
}

/**
 * Logging levels in MCP
 */
export type LoggingLevel =
    | "debug"
    | "info"
    | "notice"
    | "warning"
    | "error"
    | "critical"
    | "alert"
    | "emergency";

/**
 * Type guard to check if content is text content
 */
export function isTextContent(content: any): content is TextContent {
    return content?.type === "text";
}

/**
 * Type guard to check if content is image content
 */
export function isImageContent(content: any): content is ImageContent {
    return content?.type === "image";
}

/**
 * Type guard to check if content is audio content
 */
export function isAudioContent(content: any): content is AudioContent {
    return content?.type === "audio";
}