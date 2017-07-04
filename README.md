# Speech, NL & Vision API Demos (by GridCell)

This project showcases some of the APIs made available by the Google Cloud platform, namely:
 - [Google Cloud Speech](https://cloud.google.com/speech/)
 - [Google Cloud Natural Language](https://cloud.google.com/natural-language/)
 - [Google Cloud Vision](https://cloud.google.com/vision/)

It also showcases the Web Speech API made available by all modern browsers, as a mean of comparision against Google Cloud Speech.

## Getting started
Either:
 - Clone the project & follow the instructions below
 - See it live at: (https://gcpdemo.gridcell.io/). The local server process is still required for GCP Speech Demo.

The project was generated with [Angular CLI](https://github.com/angular/angular-cli) and its structure remains pretty much unchanged; Only new pages / components / services were added along with a complementary Node.js server process. [Material Design](https://material.angular.io/) and [Bootstrap](http://getbootstrap.com/) were used just to make the web app look nicer.

## Why is a server process needed?

While Google Cloud provides a REST and a RPC API, usually it is the client libraries that are the more complete way of accessing its features. That said, we were able to use the REST API for both Natural Language and Vision processing, but to be able to "stream" the speech for recognizing, we had to use the client library which is only available for server side languages.

Hence the reason for the "speech-server". The following flow can be observed:
 - the web app captures and streams the audio through a websocket (binaryJS) to a Node.js process;
 - in turn, the server process streams it to GCS through its client library implementation;
 - once a response is returned from GCS, it is piped back to the web app.

## Project structure

The meaningful bits and pieces of the project can be found in the following folders:
 - src/app/services/
 - src/app/pages/widgets/
 - speech-server/src/

The `src/app/services/` holds the services responsible for audio capture and integrating with the Google Cloud REST API or with our own Speech-Server. The services are broken down into separate files according to their responsibilities: Speech (WebSpeech & GoogleCloud), Natural Language Processing (NLP) and Vision APIs.

The `src/app/pages/widgets/` contains the main web app page. It basically consists of 3 cards showcasing the aforementioned features. They could / should have been split into separate components but are all bundled together so you can easily see and compare the relevant code.

The `speech-server/src` holds the Node.js typescript implementation of the server process responsible for piping the audio stream from the wep app to the Google Cloud Speech and back.

## Configuration

Before being able to run both web app and speech server, we need to configure the google cloud project ID and API Key. This can be done in the following files:
 - src/environments/environment.ts (and / or environment.prod.ts)
 - speech-server/src/environment.ts

## Web app (local) server

Run `npm install` and then `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Speech-(local)-server

Since the speech-server relies on google cloud's client library, to run it on your local workstation you must first install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/) and authenticate by running the following command: `gcloud auth application-default login`

Then `cd speech-server` and run `npm start` on a separate terminal window. The server will be accessable on `ws://localhost:8000`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
The coverage is not exhaustive in any way, just wanting to provide a few examples.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.
The coverage is not exaustive in any way, just wanting to provide a few examples.

## Further help

Don't hesitate to contact [GridCell](http://www.gridcell.io) or tweet us @gridcell_io

All trademarks acknowledged, this is not a Google product nor affiliated with Google, Google Cloud Services.
