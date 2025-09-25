import { existsSync } from 'fs';
import path from 'path';
export function validateProjectName(name) {
    if (!name) {
        return { valid: false, error: 'Project name is required' };
    }
    if (name.length === 0) {
        return { valid: false, error: 'Project name cannot be empty' };
    }
    if (name.length > 214) {
        return {
            valid: false,
            error: 'Project name cannot be longer than 214 characters',
        };
    }
    if (name.toLowerCase() !== name) {
        return { valid: false, error: 'Project name must be lowercase' };
    }
    if (!/^[a-z0-9-_]+$/.test(name)) {
        return {
            valid: false,
            error: 'Project name can only contain lowercase letters, numbers, hyphens, and underscores',
        };
    }
    if (name.startsWith('.') || name.startsWith('_')) {
        return {
            valid: false,
            error: 'Project name cannot start with a dot or underscore',
        };
    }
    if (name === 'node_modules' || name === 'favicon.ico') {
        return {
            valid: false,
            error: 'Project name cannot be "node_modules" or "favicon.ico"',
        };
    }
    return { valid: true };
}
export function checkIfDirectoryExists(dirPath) {
    return existsSync(dirPath);
}
export function getTemplatePath(templateName, templatesDir) {
    return path.resolve(templatesDir, 'templates', templateName);
}
export function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key]);
        }
        else if (Array.isArray(source[key])) {
            result[key] = [...(result[key] || []), ...source[key]];
        }
        else {
            result[key] = source[key];
        }
    }
    return result;
}
//# sourceMappingURL=utils.js.map