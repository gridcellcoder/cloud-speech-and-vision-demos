// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  speechServerUrl: 'ws://localhost:8000',

  gCloudProjectId: 'ENTER YOUR GLCOUD PROJECT ID HERE',
  gCloudProjectApiKey: 'ENTER YOUR OWN API KEY HERE',

  gCloudNLPApiUrl: 'https://language.googleapis.com/v1/documents:annotateText',
  gCloudVisionApiUrl: 'https://vision.googleapis.com/v1/images:annotate',
};
