# To set up this application

1. Go to https://console.developers.google.com/
2. Create a project and enable the Google Calendar API
3. Setup an OAuth consent screen
4. Go to create credentials
5. Create credentials and select "OAuth client ID" from the dropdown
6. Select "Other" and then hit create

Now you have 2 options...

## Option 1: use .env files

Add your project id, client id and client secret to the .env file under "PROJECT_ID", "CLIENT_ID" and "CLIENT_SECRET" respectively

## Option 2: use json file

In your project in the google developer console:

1. go to "Credentials"
2. "OAuth 2.0 Client IDs"
3. select your newly created credentials
4. "Download json"
5. place the json at the root of this project and rename it to "credentials.json"

Once you've set up the google auth credentials you can run `npm start` to start up the server or `npm run dev` to start and watch for changes in files
