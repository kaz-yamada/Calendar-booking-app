/* eslint-disable camelcase */
import fs from "fs";
import readline from "readline";
import open from "open";
import { google } from "googleapis";
import { readFilePromise } from "../util/fileutil";

const CREDENTIAL_PATH = "credentials.json";

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "token.json";

const { PROEJECT_ID, CLIENT_ID, CLIENT_SECRET } = process.env;

const CREDENTIALS = {
  installed: {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    project_id: PROEJECT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    redirect_uris: ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
  }
};

const makeRequest = async callback => {
  const googleCredentials = await getCredentials();

  if (!googleCredentials) {
    return console.error("Enviroment variables or credentials.json not set");
  }

  authorize(googleCredentials, callback);
};

const getCredentials = async () => {
  let googleCredentials = null;
  if (PROEJECT_ID && CLIENT_ID && CLIENT_SECRET) {
    googleCredentials = { ...CREDENTIALS };
  } else {
    try {
      googleCredentials = JSON.parse(await readFilePromise(CREDENTIAL_PATH));
    } catch (err) {
      console.error(err);
    }
  }

  return googleCredentials;
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} googleCredentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (googleCredentials, callback) => {
  const {
    client_id,
    client_secret,
    redirect_uris
  } = googleCredentials.installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);

    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getAccessToken = (oAuth2Client, callback) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES
  });

  console.log("Authorize this app by visiting this url:", authUrl);

  open(authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("Enter the code from that page here: ", code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
};

export const initGoogleAuth = () => {
  makeRequest(auth => {});
};

export default makeRequest;
