/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
const FRONTEND = `http://${location.hostname}:8080`;
const BACKEND = `http://${location.hostname}:9090`;
const APP_NAME = "monkvision";
const APP_PATH = `${FRONTEND}/apps/${APP_NAME}`;
const API_PATH = `${BACKEND}/apps/${APP_NAME}`;

export const APP_CONSTANTS = {
    FRONTEND, BACKEND, APP_PATH, APP_NAME, API_PATH,
    INDEX_HTML: APP_PATH+"/index.html",
    MAIN_HTML: APP_PATH+"/main.html",
    LOGIN_HTML: APP_PATH+"/login.html",
    REGISTER_HTML: APP_PATH+"/register.html",

    DIALOGS_PATH: APP_PATH+"/dialogs",
    COMPONENTS_PATH: APP_PATH+"/components",

    // Login constants
    MIN_PASS_LENGTH: 8,
    API_LOGIN: API_PATH+"/login",
    API_REGISTER: API_PATH+"/register",
    API_CHANGEPW: API_PATH+"/changepassword",
    BCRYPT_SALT: "$2a$10$VFyiln/PpFyZc.ABoi4ppf",
    USERID: "userid",
    PWPH: "pwph",
    MIN_PW_LENGTH: 10,
    TIMEOUT: 600000,
    USERNAME: "username",
    USERORG: "userorg",
    USER_ROLE: "user",
    GUEST_ROLE: "guest",
    PERMISSIONS_MAP: {
        user:[APP_PATH+"/main.html", APP_PATH+"/register.html", APP_PATH+"/login.html", $$.MONKSHU_CONSTANTS.ERROR_THTML], 
        guest:[APP_PATH+"/register.html", APP_PATH+"/login.html", $$.MONKSHU_CONSTANTS.ERROR_THTML]
    },
    API_KEYS: {"*":"fheiwu98237hjief8923ydewjidw834284hwqdnejwr79389"},
    KEY_HEADER: "X-API-Key"
}