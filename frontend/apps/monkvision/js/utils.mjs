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
    // add theme
    if (pageData?.theme) monkshu_env.app_theme = pageData.theme;

    // add css
    let css = ""; for (const key of Object.keys(monkshu_env.app_theme[`${pageName}_css`]))
        css += key=="*"?`${monkshu_env.app_theme[`${pageName}_css`][key]}\n`:`${key}{${monkshu_env.app_theme[`${pageName}_css`][key]}}\n`;
    pageData.css = `<style>${css}</style>`;

    // merge i18n 
    for (const key of Object.keys(monkshu_env.app_theme[`${pageName}_i18n`])) {
        const i18nThis = await i18n.getI18NObject(key);
        Object.assign(i18nThis, monkshu_env.app_theme[`${pageName}_i18n`][key]);
    }

    // add HTML data
    pageData.htmlData = monkshu_env.app_theme[`${pageName}_html_data`];
    
    return pageData;
}

export const utils = {addThemeDataAndCSS};