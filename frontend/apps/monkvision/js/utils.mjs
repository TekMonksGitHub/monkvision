/**
 * Common utility functions
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */

import {i18n} from "/framework/js/i18n.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";

/**
 * Adds in CSS and html data objects to page's main data object for rendering
 * @param {object} pageData The incoming data object for the Page
 * @param {string} pageName The page name
 */
async function addThemeDataAndCSS(pageData, pageName) {
    // add theme
    const theme = (pageData && pageData.themeMode) ? await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/theme_${pageData.themeMode}.json`) : await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/theme.json`);

    // add css
    let css = ""; for (const key of Object.keys(theme[`${pageName}_css`]))
        css += key=="*"?`${theme[`${pageName}_css`][key]}\n`:`${key}{${theme[`${pageName}_css`][key]}}\n`;
    pageData.css = `<style>${css}</style>`;

    // merge i18n 
    for (const key of Object.keys(theme[`${pageName}_i18n`])) {
        const i18nThis = await i18n.getI18NObject(key);
        Object.assign(i18nThis, theme[`${pageName}_i18n`][key]);
    }

    // add HTML data
    pageData.htmlData = theme[`${pageName}_html_data`];
    
    return pageData;
}

async function rest(api, params, method = "GET") {
	const API_TO_CALL = `${APP_CONSTANTS.API_PATH}/${api}`;

    const paramObj = {}; 
    if (params && typeof(params) == "string") for (const param of params.split("&")) paramObj[param.split("=")[0]] = param.split("=")[1];
    else Object.assign(paramObj, params);

	const resp = await apiman.rest(API_TO_CALL, method, paramObj, true, false);
	return resp;
}

export const utils = {addThemeDataAndCSS, rest};