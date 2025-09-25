#!/usr/bin/env node

import { program } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import { createProject } from './create-project.js';
import { validateProjectName } from './utils.js';

interface Options {
  name?: string;
  pm?: string;
  provider?: string;
  storybook?: boolean;
  yes?: boolean;
  templateTag?: string;
}

async function main() {
  program
    .name('create-next-starter')
    .description(
      'Create a Next.js starter application with optional authentication providers'
    )
    .version('1.0.0')
    .argument('[project-name]', 'Name of the project')
    .option(
      '-p, --pm <package-manager>',
      'Package manager to use (pnpm, npm, yarn, bun)',
      'pnpm'
    )
    .option(
      '--provider <provider>',
      'Authentication provider (none, authjs, clerk, auth0, supabase, msal)',
      'authjs'
    )
    .option('--storybook', 'Include Storybook')
    .option(
      '--template-tag <tag>',
      'Template version to use (defaults to latest)'
    )
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (projectName, options: Options) => {
      try {
        const answers = await getAnswers(projectName, options);
        await createProject(answers);
      } catch (error) {
        if (error instanceof Error) {
          console.error(chalk.red(`Error: ${error.message}`));
        } else {
          console.error(chalk.red('An unexpected error occurred'));
        }
        process.exit(1);
      }
    });

  await program.parseAsync();
}

async function getAnswers(projectName?: string, options: Options = {}) {
  if (options.yes) {
    return {
      name: projectName || 'my-app',
      pm: options.pm || 'pnpm',
      provider: options.provider || 'authjs',
      storybook: options.storybook || false,
      templateTag: options.templateTag,
    };
  }

  const questions: any[] = [];

  if (!projectName) {
    questions.push({
      type: 'text' as const,
      name: 'name',
      message: 'What is your project name?',
      initial: 'my-app',
      validate: (value: string) => {
        const validation = validateProjectName(value);
        return validation.valid ? true : validation.error;
      },
    });
  }

  questions.push(
    {
      type: 'select' as const,
      name: 'pm',
      message: 'Which package manager would you like to use?',
      choices: [
        { title: 'pnpm', value: 'pnpm' },
        { title: 'npm', value: 'npm' },
        { title: 'yarn', value: 'yarn' },
        { title: 'bun', value: 'bun' },
      ],
      initial: 0,
    },
    {
      type: 'select' as const,
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
    },
    {
      type: 'confirm' as const,
      name: 'storybook',
      message: 'Would you like to include Storybook?',
      initial: false,
    }
  );

  const answers = await prompts(questions);

  return {
    name: projectName || answers.name,
    pm: options.pm || answers.pm,
    provider: options.provider || answers.provider,
    storybook: options.storybook || answers.storybook,
    templateTag: options.templateTag,
  };
}

main().catch(console.error);
