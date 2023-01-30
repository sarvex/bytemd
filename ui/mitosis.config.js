/** @type {import('@builder.io/mitosis').MitosisConfig} */
module.exports = {
  files: 'src/*.lite.tsx',
  dest: '../packages',
  targets: ['svelte'],
  options: {
    svelte: {
      typescript: true,
    },
  },
}
