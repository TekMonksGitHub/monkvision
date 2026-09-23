/* 
 * (C) 2015 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
const FRONTEND = new URL(window.location.href).protocol + "//" + new URL(window.location.href).host;
const BACKEND = new URL(window.location.href).protocol + "//" + new URL(window.location.href).hostname + ":9090";
const APP_NAME = "monkvision";
const APP_PATH = `${FRONTEND}/apps/${APP_NAME}`;
const API_PATH = `${BACKEND}/apps/${APP_NAME}`;
const CONF_PATH = `${APP_PATH}/conf`;

export const APP_CONSTANTS = {
    FRONTEND, BACKEND, APP_PATH, APP_NAME, API_PATH,CONF_PATH,
    INDEX_HTML: APP_PATH+"/index.html",
    MAIN_HTML: APP_PATH+"/main.html",
    LOGIN_HTML: APP_PATH+"/login.html",
    LOGINRESULT_HTML: APP_PATH+"/loginresult.html",

    DIALOGS_PATH: APP_PATH+"/dialogs",
    COMPONENTS_PATH: APP_PATH+"/components",

    // Login constants
    API_LOGIN: API_PATH+"/login",
    TKMLOGIN_LIB: `${APP_PATH}/3p/tkmlogin.mjs`,
    TKMLOGINAPP_URL: "https://login.tekmonks.com",
    USERID: "userid",
    TIMEOUT: 600000,
    USERNAME: "username",
    USERORG: "userorg",
    USER_ROLE: "user",
    GUEST_ROLE: "guest",
    PERMISSIONS_MAP: {
        user:[APP_PATH+"/main.html", APP_PATH+"/login.html", APP_PATH+"/loginresult.html", APP_PATH+"/pdf_report.html", $$.MONKSHU_CONSTANTS.ERROR_HTML],
        guest:[APP_PATH+"/login.html", APP_PATH+"/loginresult.html", $$.MONKSHU_CONSTANTS.ERROR_HTML],
        admin:[APP_PATH+"/main.html", APP_PATH+"/login.html", APP_PATH+"/loginresult.html", APP_PATH+"/pdf_report.html", $$.MONKSHU_CONSTANTS.ERROR_HTML, "dash1", "dash2", "dash3"],
        dba:[APP_PATH+"/main.html", APP_PATH+"/login.html", APP_PATH+"/loginresult.html", APP_PATH+"/pdf_report.html", $$.MONKSHU_CONSTANTS.ERROR_HTML, "dash2"]
    },
    API_KEYS: {"*":"fheiwu98237hjief8923ydewjidw834284hwqdnejwr79389"},
    KEY_HEADER: "X-API-Key"
}
