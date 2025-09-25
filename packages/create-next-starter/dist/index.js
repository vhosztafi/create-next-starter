#!/usr/bin/env node
import { program } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import { createProject } from './create-project.js';
import { validateProjectName } from './utils.js';
async function main() {
    program
        .name('create-next-starter')
        .description('Create a Next.js starter application with optional authentication providers')
        .version('1.0.0')
        .argument('[project-name]', 'Name of the project')
        .option('-p, --pm <package-manager>', 'Package manager to use (pnpm, npm, yarn, bun)', 'pnpm')
        .option('--provider <provider>', 'Authentication provider (none, authjs, clerk, auth0, supabase, msal)', 'authjs')
        .option('--ui <ui>', 'UI library (headless, shadcn, heroui, flowbite, daisy, tremor, none)', 'headless')
        .option('--storybook', 'Include Storybook')
        .option('--template-tag <tag>', 'Template version to use (defaults to latest)')
        .option('-y, --yes', 'Skip prompts and use defaults')
        .action(async (projectName, options) => {
        try {
            const answers = await getAnswers(projectName, options);
            await createProject(answers);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(chalk.red(`Error: ${error.message}`));
            }
            else {
                console.error(chalk.red('An unexpected error occurred'));
            }
            process.exit(1);
        }
    });
    await program.parseAsync();
}
async function getAnswers(projectName, options = {}) {
    if (options.yes) {
        return {
            name: projectName || 'my-app',
            pm: options.pm || 'pnpm',
            provider: options.provider || 'authjs',
            ui: options.ui || 'headless',
            storybook: options.storybook || false,
            templateTag: options.templateTag,
        };
    }
    const questions = [];
    if (!projectName) {
        questions.push({
            type: 'text',
            name: 'name',
            message: 'What is your project name?',
            initial: 'my-app',
            validate: (value) => {
                const validation = validateProjectName(value);
                return validation.valid ? true : validation.error;
            },
        });
    }
    questions.push({
        type: 'select',
        name: 'pm',
        message: 'Which package manager would you like to use?',
        choices: [
            { title: 'pnpm', value: 'pnpm' },
            { title: 'npm', value: 'npm' },
            { title: 'yarn', value: 'yarn' },
            { title: 'bun', value: 'bun' },
        ],
        initial: 0,
    }, {
        type: 'select',
        name: 'provider',
        message: 'Which authentication provider would you like to use?',
        choices: [
            { title: 'None', value: 'none' },
            { title: 'Auth.js (NextAuth)', value: 'authjs' },
            { title: 'Clerk', value: 'clerk' },
            { title: 'Auth0', value: 'auth0' },
            { title: 'Supabase', value: 'supabase' },
            { title: 'MSAL (Azure AD)', value: 'msal' },
        ],
        initial: 1,
    }, {
        type: 'select',
        name: 'ui',
        message: 'Which UI library would you like to use?',
        choices: [
            { title: 'Headless (default, safest)', value: 'headless' },
            { title: 'shadcn/ui', value: 'shadcn' },
            { title: 'HeroUI', value: 'heroui' },
            { title: 'Flowbite React', value: 'flowbite' },
            { title: 'DaisyUI', value: 'daisy' },
            { title: 'Tremor (analytics)', value: 'tremor' },
            { title: 'None', value: 'none' },
        ],
        initial: 0,
    }, {
        type: 'confirm',
        name: 'storybook',
        message: 'Would you like to include Storybook?',
        initial: false,
    });
    const answers = await prompts(questions);
    return {
        name: projectName || answers.name,
        pm: options.pm || answers.pm,
        provider: options.provider || answers.provider,
        ui: options.ui || answers.ui,
        storybook: options.storybook || answers.storybook,
        templateTag: options.templateTag,
    };
}
main().catch(console.error);
//# sourceMappingURL=index.js.map