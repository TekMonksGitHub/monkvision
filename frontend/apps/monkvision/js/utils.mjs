/**
 * Common utility functions
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */

import {i18n} from "/framework/js/i18n.mjs";

/**
 * Adds in CSS and html data objects to page's main data object for rendering
 * @param {object} pageData The incoming data object for the Page
 * @param {string} pageName The page name
 */
async function addThemeDataAndCSS(pageData, pageName) {
    // add css
    let css = ""; for (const key of Object.keys(APP_THEME[`${pageName}_css`]))
        css += key=="*"?`${APP_THEME[`${pageName}_css`][key]}\n`:`${key}{${APP_THEME[`${pageName}_css`][key]}}\n`;
    pageData.css = `<style>${css}</style>`;

    // merge i18n 
    for (const key of Object.keys(APP_THEME[`${pageName}_i18n`])) {
        const i18nThis = await i18n.getI18NObject(key);
        Object.assign(i18nThis, APP_THEME[`${pageName}_i18n`][key]);
    }
    
    return pageData;
}

export const utils = {addThemeDataAndCSS};