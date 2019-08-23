module.exports = {
  name: 'microphi',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/microphi',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
