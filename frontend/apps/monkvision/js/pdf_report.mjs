/**
 * PDF Report layout page for Monkvision
 *  
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */
import {utils} from "./utils.mjs";
import {i18n} from "/framework/js/i18n.mjs";
import {router} from "/framework/js/router.mjs";
import {session} from "/framework/js/session.mjs";
import {chart_box} from "../components/chart-box/chart-box.mjs";

const SELECTED_DATES = "__monkvision_selecteddates";

async function interceptPageLoadData() {
router.addOnLoadPageData(`${APP_CONSTANTS.APP_PATH}/pdf_report.html`, async data => {
    // add in css, theme and html data to the page data object
    await utils.addThemeDataAndCSS(data, "pdf_report");
    
    // add in dashboard path, and page title to the page data object
    const currentURL = new URL(router.getCurrentURL());
    data.dash = currentURL.searchParams.get("dash");
    data.htmlData.dateTimeNow = session.get(SELECTED_DATES).to;
    data.htmlData.dateTimeWeekAgo = session.get(SELECTED_DATES).from;
    data.pageTitle = `${await i18n.get("title", session.get($$.MONKSHU_CONSTANTS.LANG_ID))} - ${currentURL.searchParams.get("name")}`;

    //set datetime before API calls
    chart_box.setTimeRange(session.get(SELECTED_DATES));

    // add in page data property so page generator can receive pass through data
    data.pagedata = encodeURIComponent(JSON.stringify(data.htmlData));
    });
}

const beforePrintHandler = _ => {for (const id in Chart.instances) Chart.instances[id].canvas.style.width = "100%";}

const generatePDFReport = _ => {window.print(); window.close();}

if (window.matchMedia) {
    let mediaQueryList = window.matchMedia('print');
    mediaQueryList.addEventListener("change", _ => beforePrintHandler())
}

export const pdf_report = {interceptPageLoadData, generatePDFReport};