import { promises as fs } from 'fs';
import path from 'path';
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import { checkIfDirectoryExists, getTemplatePath, deepMerge } from './utils.js';
import { ensureTemplatesAvailable } from './github-fetcher.js';

interface ProjectOptions {
  name: string;
  pm: string;
  provider: string;
  ui: string;
  storybook: boolean;
  templateTag?: string;
}

export async function createProject(options: ProjectOptions) {
  const { name, pm, provider, ui, storybook, templateTag } = options;
  const projectPath = path.resolve(process.cwd(), name);

  console.log(
    chalk.blue(`\n🚀 Creating Next.js starter: ${chalk.bold(name)}\n`)
  );

  // Check if directory exists
  if (checkIfDirectoryExists(projectPath)) {
    throw new Error(
      `Directory "${name}" already exists. Please choose a different name.`
    );
  }

  // Ensure templates are available
  const templatesDir = await ensureTemplatesAvailable(templateTag);

  // Create project directory
  await fs.mkdir(projectPath, { recursive: true });

  // Copy base template
  const baseTemplatePath = getTemplatePath('base', templatesDir);
  await copyDirectory(baseTemplatePath, projectPath);

  // Apply overlays
  if (storybook) {
    await applyOverlay(projectPath, 'storybook', templatesDir);
  }

  if (provider !== 'none') {
    await applyOverlay(projectPath, provider, templatesDir);
  }

  if (ui !== 'none' && ui !== 'headless') {
    await applyOverlay(projectPath, `ui-${ui}`, templatesDir);
  }

  // Merge package.json files
  await mergePackageJson(projectPath);

  // Create environment files
  await createEnvFiles(projectPath, provider);

  // Install dependencies
  const installSpinner = ora('Installing dependencies...').start();
  try {
    await execa(pm, ['install'], { cwd: projectPath });
    installSpinner.succeed('Dependencies installed');
  } catch (error) {
    installSpinner.fail('Failed to install dependencies');
    throw error;
  }

  // Initialize git
  const gitSpinner = ora('Initializing git repository...').start();
  try {
    await execa('git', ['init', '-b', 'main'], { cwd: projectPath });
    await execa('git', ['add', '-A'], { cwd: projectPath });
    await execa(
      'git',
      ['commit', '-m', 'chore: bootstrap from create-next-starter'],
      { cwd: projectPath }
    );
    gitSpinner.succeed('Git repository initialized');
  } catch (error) {
    gitSpinner.fail('Failed to initialize git repository');
    // Don't throw here, git is optional
  }

  // Print success message
  printSuccessMessage(name, provider, ui, storybook);
}

async function copyDirectory(src: string, dest: string) {
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function applyOverlay(
  projectPath: string,
  overlayName: string,
  templatesDir: string
) {
  const overlayPath = getTemplatePath(`overlays/${overlayName}`, templatesDir);

  if (!checkIfDirectoryExists(overlayPath)) {
    throw new Error(`Overlay "${overlayName}" not found`);
  }

  await copyDirectory(overlayPath, projectPath);
}

async function mergePackageJson(projectPath: string) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  // Find all package.json.partial files
  const partialFiles = await findAllPartialFiles(projectPath);

  if (partialFiles.length === 0) {
    throw new Error('No package.json.partial files found in template');
  }

  // Process all partial files and replace PROJECT_NAME placeholder
  const projectName = path.basename(projectPath);
  const processedPartials: any[] = [];

  for (const partialFile of partialFiles) {
    const partialContent = await fs.readFile(partialFile, 'utf-8');
    const processedContent = partialContent.replace(
      /\{\{PROJECT_NAME\}\}/g,
      projectName
    );
    const partialPackageJson = JSON.parse(processedContent);
    processedPartials.push(partialPackageJson);
  }

  // Start with the first processed partial as the base
  let mergedPackageJson = processedPartials[0];

  // Merge remaining processed partials
  for (let i = 1; i < processedPartials.length; i++) {
    mergedPackageJson = deepMerge(mergedPackageJson, processedPartials[i]);
  }

  // Remove all partial files
  for (const partialFile of partialFiles) {
    await fs.unlink(partialFile);
  }

  // Project name is already set from placeholder replacement

  // Reorder package.json properties to follow standard convention
  const orderedPackageJson = reorderPackageJson(mergedPackageJson);

  // Write merged package.json
  await fs.writeFile(
    packageJsonPath,
    JSON.stringify(orderedPackageJson, null, 2)
  );
}

function reorderPackageJson(packageJson: any): any {
  // Define the standard order for package.json properties
  const standardOrder = [
    'name',
    'version',
    'description',
    'private',
    'type',
    'main',
    'module',
    'exports',
    'bin',
    'engines',
    'scripts',
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
    'bundledDependencies',
    'os',
    'cpu',
    'preferGlobal',
    'publishConfig',
    'repository',
    'bugs',
    'homepage',
    'keywords',
    'author',
    'contributors',
    'license',
    'files',
  ];

  const ordered: any = {};

  // Add properties in standard order if they exist
  for (const key of standardOrder) {
    if (packageJson.hasOwnProperty(key)) {
      ordered[key] = packageJson[key];
    }
  }

  // Add any remaining properties that weren't in the standard order
  for (const key in packageJson) {
    if (!ordered.hasOwnProperty(key)) {
      ordered[key] = packageJson[key];
    }
  }

  return ordered;
}

async function findAllPartialFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function search(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await search(fullPath);
      } else if (
        entry.name === 'package.json.partial' ||
        entry.name.match(/^package\..*\.partial$/)
      ) {
        files.push(fullPath);
      }
    }
  }

  await search(dir);
  return files;
}

async function findPartialFiles(
  dir: string,
  pattern: string
): Promise<string[]> {
  const files: string[] = [];

  async function search(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await search(fullPath);
      } else if (entry.name === pattern) {
        files.push(fullPath);
      }
    }
  }

  await search(dir);
  return files;
}

async function createEnvFiles(projectPath: string, provider: string) {
  const envExamplePath = path.join(projectPath, 'env.example');
  const envLocalPath = path.join(projectPath, '.env.local');

  let envContent = await fs.readFile(envExamplePath, 'utf-8');

  // Add provider-specific environment variables
  if (provider !== 'none') {
    const providerEnvPath = path.join(projectPath, 'README.addon.md');
    if (checkIfDirectoryExists(providerEnvPath)) {
      // In a real implementation, you'd parse the README to extract env vars
      // For now, we'll add a comment
      envContent += `\n# ${provider} specific environment variables\n# See README.addon.md for details\n`;
    }
  }

  // Create .env.local if it doesn't exist
  if (!checkIfDirectoryExists(envLocalPath)) {
    await fs.writeFile(envLocalPath, envContent);
  }
}

function printSuccessMessage(
  projectName: string,
  provider: string,
  ui: string,
  storybook: boolean
) {
  console.log(
    chalk.green(`\n✅ Successfully created ${chalk.bold(projectName)}!\n`)
  );

  console.log(chalk.blue('Next steps:'));
  console.log(`  ${chalk.cyan('cd')} ${projectName}`);
  console.log(`  ${chalk.cyan('pnpm dev')} - Start the development server`);

  if (storybook) {
    console.log(`  ${chalk.cyan('pnpm storybook')} - Start Storybook`);
  }

  console.log(`\n${chalk.yellow("Don't forget to:")}`);
  console.log('  • Set up your environment variables in .env.local');

  if (provider !== 'none') {
    console.log(`  • Configure your ${provider} provider`);
    console.log(`  • See README.addon.md for ${provider} setup instructions`);
  }

  if (ui !== 'none' && ui !== 'headless') {
    console.log(`  • Configure your ${ui} UI library`);
    console.log(`  • See README.addon.md for ${ui} setup instructions`);
  }

  console.log('\nHappy coding! 🎉\n');
}
