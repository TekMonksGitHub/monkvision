/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
const FRONTEND = "https://{{{hostname}}}";
const BACKEND = "https://{{{hostname}}}:9090";
const APP_NAME = "monkvision";
const APP_PATH = `${FRONTEND}/apps/${APP_NAME}`;
const API_PATH = `${BACKEND}/apps/${APP_NAME}`;
const CONF_PATH = `${APP_PATH}/conf`;

export const APP_CONSTANTS = {
    FRONTEND, BACKEND, APP_PATH, APP_NAME, API_PATH,CONF_PATH,
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
        user:[APP_PATH+"/main.html", APP_PATH+"/register.html", APP_PATH+"/login.html", APP_PATH+"/pdf_report.html", $$.MONKSHU_CONSTANTS.ERROR_HTML],
        guest:[APP_PATH+"/register.html", APP_PATH+"/login.html", $$.MONKSHU_CONSTANTS.ERROR_HTML],
        admin:[APP_PATH+"/main.html", APP_PATH+"/register.html", APP_PATH+"/login.html", APP_PATH+"/pdf_report.html", $$.MONKSHU_CONSTANTS.ERROR_HTML, "dash1", "dash2", "dash3"],
        dba:[APP_PATH+"/main.html", APP_PATH+"/register.html", APP_PATH+"/login.html", APP_PATH+"/pdf_report.html", $$.MONKSHU_CONSTANTS.ERROR_HTML, "dash2"]
    },
    API_KEYS: {"*":"fheiwu98237hjief8923ydewjidw834284hwqdnejwr79389"},
    KEY_HEADER: "X-API-Key"
}