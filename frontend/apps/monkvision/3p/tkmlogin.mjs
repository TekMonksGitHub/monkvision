/**
 * Tekmonks Unified Login for Monkvision.
 */
const UNIFIED_LOGIN_BASE_URL = "https://login.tekmonks.com";

async function login(appname, redirect, otkapi, bgcolor, unifiedloginbaseurl=UNIFIED_LOGIN_BASE_URL, textcolor) {
    let otkResponse;
    try { otkResponse = await fetch(otkapi); }
    catch (err) { console.error(`Unable to request the Unified Login one-time key: ${err}`); return; }

    if (!otkResponse.ok) { console.error("Unable to request the Unified Login one-time key."); return; }
    const onetimekey = (await otkResponse.json()).otk;
    if (!onetimekey) { console.error("Unified Login did not receive a one-time key."); return; }

    const search = `an=${encodeURIComponent(appname)}&rdr=${encodeURIComponent(redirect)}&otk=${encodeURIComponent(onetimekey)}` +
        `${bgcolor ? `&bgc=${encodeURIComponent(bgcolor)}` : ""}${textcolor ? `&txtc=${encodeURIComponent(textcolor)}`:""}${APP_CONSTANTS.SSO.TKMLOGINAPP_DISABLE_MFA ? `&${APP_CONSTANTS.SSO.TKMLOGINAPP_DISABLE_MFA_KEY}=${APP_CONSTANTS.SSO.TKMLOGINAPP_DISABLE_MFA}` : ""}`;
    window.location.replace(`${unifiedloginbaseurl}?${search}`);
}

async function verify(verifyapi, resulturl=window.location.href) {
    const jwt = new URL(resulturl).searchParams.get("jwt");
    if (!jwt) throw new Error("Missing Unified Login JWT.");

    const separator = new URL(verifyapi).search ? "&" : "?";
    let verifiedResult;
    try { verifiedResult = await fetch(`${verifyapi}${separator}op=verify&jwt=${encodeURIComponent(jwt)}`); }
    catch (err) { console.error(`Unified Login JWT verification failed: ${err}`); return false; }

    if (!verifiedResult.ok) return false;
    try {
        const headers = Object.fromEntries(verifiedResult.headers.entries());
        return {url: verifyapi, response: await verifiedResult.json(), headers};
    } catch (err) { console.error(`Invalid Unified Login verification response: ${err}`); return false; }
}

export const tkmlogin = {login, verify};
