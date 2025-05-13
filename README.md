# MapMates

## Setup

In order to set up the project you need to install three sets of dependencies. Run `npm i` in the root (for TypeScript), in `client/`, and in `server/`.

Additionally, make sure a MongoDB database and a Redis Stack Server (with JSON module) is live.

### Environment Variables
To function properly you will need 3 enviornment variables, outlined in `.env.example`. Copy it into a `.env` in root and replace it with your own keys.

Without these, you will be unable to upload images with [Cloudinary](https://cloudinary.com) and pull restaurant data from [Geoapify](https://www.geoapify.com).

## Run the Server
Once dependencies are installed, navigate to `server/` and execute `npm start`.

You will be able to access the server directly through http://localhost:3000/.

## Run the Client
On a fresh install or after making some changes, first run `npm run build`. This will be read during execution.

Once built, run `npm start` to start the sever. You'll be able to access the server from http://localhost:5173/.