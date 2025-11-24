/* eslint-env node */

const branch = process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_BRANCH;

const config = {
  branches: ['main'],
  tagFormat: 'shared-v${version}',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@anolilab/semantic-release-pnpm',
      {
        publishBranch: branch,
        pkgRoot: '.',
      },
    ],
  ],
};

// Git plugin comes AFTER npm
config.plugins.push([
  '@semantic-release/git',
  {
    assets: ['package.json'],
    message:
      'chore(release): @postman-enricher/shared ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
  },
]);

// GitHub plugin comes last
config.plugins.push('@semantic-release/github');

module.exports = config;
