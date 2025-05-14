# MapMates

Below are instructions to run both the client and the server on a local machine. However, if you just want to experience MapMates, go to deployed version via AWS at http://18.221.85.114:4173/.

## Setup

In order to set up the project you need to install three sets of dependencies. Run `npm i` in the root (for TypeScript), in `client/`, and in `server/`.

Additionally, make sure a MongoDB database and a Redis Stack Server (with JSON module) is live.

### Environment Variables
To function properly you will need 3 enviornment variables, outlined in `.env.example`. Copy it into a `.env` in root and replace it with your own keys.

Without these, you will be unable to upload images with [Cloudinary](https://cloudinary.com) and pull restaurant data from [Geoapify](https://www.geoapify.com).

## Server

### Seed the Database

Use the command `npm run seed` to seed the database.

### Run the Server
Once dependencies are installed, navigate to `server/` and execute `npm start`.

You will be able to access the server directly through http://localhost:3000/.

## Client

### Run the Client

On a fresh install or after making some changes, first run `npm run build`. This will be read during execution.

Once built, run `npm start` to start the sever. You'll be able to access the server from http://localhost:5173/.

### Restaurant Adding

For the add restaurants feature, it is required for you to be Hoboken, otherwise you'll get an error message not allowing you to add a restaurant.

It is recommend you use these coordinates:
- Latitude: 40.746910
- Longitude: -74.025787

These can be adjusted slightly to different places in Hoboken depending on the tests.

Depending on your browser, it may be possible to override your location. On [Chromium browsers](https://devtoolstips.org/tips/en/simulate-geolocation/) this is possible. It is possible on [Firefox](https://security.stackexchange.com/a/147176), but more complicated, and seemingly not possible with Safari (or at least isn't built in to the browser).