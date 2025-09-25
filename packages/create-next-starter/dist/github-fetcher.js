import { promises as fs } from 'fs';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import fetch from 'node-fetch';
import * as tar from 'tar';
import ora from 'ora';
/**
 * Normalizes a version tag by removing the 'v' prefix if it exists
 * @param tag - The version tag (e.g., 'v1.0.0' or '1.0.0')
 * @returns The normalized version without 'v' prefix
 */
function normalizeVersion(tag) {
    return tag.startsWith('v') ? tag.slice(1) : tag;
}
const TEMPLATES_REPO = 'vhosztafi/next-starter-templates';
const TEMPLATES_BASE_URL = `https://api.github.com/repos/${TEMPLATES_REPO}`;
export async function getLatestTemplateTag() {
    const spinner = ora('Fetching latest template version...').start();
    try {
        const response = await fetch(`${TEMPLATES_BASE_URL}/releases/latest`);
        if (!response.ok) {
            throw new Error(`Failed to fetch latest release: ${response.statusText}`);
        }
        const release = (await response.json());
        spinner.succeed(`Latest template version: ${release.tag_name}`);
        return release.tag_name;
    }
    catch (error) {
        spinner.fail('Failed to fetch latest template version');
        throw error;
    }
}
export async function downloadTemplate(tag, targetDir) {
    const spinner = ora(`Downloading templates v${normalizeVersion(tag)}...`).start();
    try {
        // Create target directory
        await fs.mkdir(targetDir, { recursive: true });
        // Download the tarball
        const tarballUrl = `${TEMPLATES_BASE_URL}/tarball/${tag}`;
        const response = await fetch(tarballUrl);
        if (!response.ok) {
            throw new Error(`Failed to download template: ${response.statusText}`);
        }
        if (!response.body) {
            throw new Error('No response body received');
        }
        // Create a temporary file for the tarball
        const tempTarballPath = path.join(targetDir, 'templates.tar.gz');
        const writeStream = createWriteStream(tempTarballPath);
        // Pipe the response to the file
        await pipeline(response.body, writeStream);
        // Extract the tarball
        await tar.extract({
            file: tempTarballPath,
            cwd: targetDir,
            strip: 1, // Remove the top-level directory (repo-name-tag)
        });
        // Clean up the tarball
        await fs.unlink(tempTarballPath);
        spinner.succeed(`Templates v${normalizeVersion(tag)} downloaded successfully`);
    }
    catch (error) {
        spinner.fail(`Failed to download templates v${normalizeVersion(tag)}`);
        throw error;
    }
}
export function getTemplatePath(templateName, templatesDir) {
    return path.resolve(templatesDir, 'templates', templateName);
}
export async function ensureTemplatesAvailable(tag) {
    const templatesDir = path.join(process.cwd(), '.create-next-starter-cache');
    const templatesPath = path.join(templatesDir, 'templates');
    // Check if templates are already available
    if (await fs
        .access(templatesPath)
        .then(() => true)
        .catch(() => false)) {
        return templatesDir;
    }
    // Download templates
    const templateTag = tag || (await getLatestTemplateTag());
    await downloadTemplate(templateTag, templatesDir);
    return templatesDir;
}
//# sourceMappingURL=github-fetcher.js.map