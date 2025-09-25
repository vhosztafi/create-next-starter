export interface TemplateInfo {
    tag: string;
    url: string;
}
export declare function getLatestTemplateTag(): Promise<string>;
export declare function downloadTemplate(tag: string, targetDir: string): Promise<void>;
export declare function getTemplatePath(templateName: string, templatesDir: string): string;
export declare function ensureTemplatesAvailable(tag?: string): Promise<string>;
//# sourceMappingURL=github-fetcher.d.ts.map