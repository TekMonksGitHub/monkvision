/**
 * Registration page handler
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */
import {utils} from "./utils.mjs";

async function interceptPageLoadData() {
    // add in css, theme and html data to the page data object
    const func = async data => await utils.addThemeDataAndCSS(data, "register");
    window.monkshu_env.pagedata_funcs[`${APP_CONSTANTS.APP_PATH}/register.html`] = [func];
}

export const main = {interceptPageLoadData};