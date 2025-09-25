interface ProjectOptions {
    name: string;
    pm: string;
    provider: string;
    storybook: boolean;
    templateTag?: string;
}
export declare function createProject(options: ProjectOptions): Promise<void>;
export {};
//# sourceMappingURL=create-project.d.ts.map