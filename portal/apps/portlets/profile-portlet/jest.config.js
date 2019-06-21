module.exports = {
  name: 'portlets-profile-portlet',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/apps/portlets/profile-portlet',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
