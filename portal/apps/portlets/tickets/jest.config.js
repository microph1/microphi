module.exports = {
  name: 'portlets-tickets',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/portlets/tickets',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
