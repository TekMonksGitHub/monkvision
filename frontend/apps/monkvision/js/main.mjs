/* 
 * (C) 2020 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {router} from "/framework/js/router.mjs";
import {loginmanager} from "./loginmanager.mjs";
import {session} from "/framework/js/session.mjs";
import {chart_box} from "../components/chart-box/chart-box.mjs";

const SELECTED_DATES = "selecteddates";

function getAndUpdateTimeRange() {
    const dates = { from: document.querySelector("input#datetimepickerfrom").value,
        to: document.querySelector("input#datetimepickerto").value };
    session.set(SELECTED_DATES, dates);
    return dates;
}

function playPauseCharts(img) {
    if (img.src.endsWith("play.svg")) {
        img.src = "./img/pause.svg";
        chart_box.setRefresh(true);
    } else {
        img.src = "./img/play.svg";
        chart_box.setRefresh(false);
    }
}

async function interceptPageLoad() {
    window.monkshu_env.pageload_funcs[`${APP_CONSTANTS.APP_PATH}/main.html`] = async data => {
        // load dashboards config and build the data object
        const dashboardsRaw = await (await fetch(`${APP_CONSTANTS.APP_PATH}/dashboards/dashboards.json`)).json();
        data.dashboards = [];
        for (const key of Object.keys(dashboardsRaw)) data.dashboards.push(
            {name: await i18n.get(key, session.get($$.MONKSHU_CONSTANTS.LANG_ID)), file: dashboardsRaw[key],
                title: await i18n.get(`${key}.title`, session.get($$.MONKSHU_CONSTANTS.LANG_ID)), id: key} );

        // add in dashboard path and title, to the page data object
        const currentURL = new URL(router.getCurrentURL());
        if (!currentURL.searchParams.get("dash")) { // load first dashboard if none was provided in the incoming URL
            data.title = data.dashboards[0].title; 
            data.dash = `./dashboards/${data.dashboards[0].file}`;
        } else {                                                // else get dashboard path and title from the URL
            data.title = currentURL.searchParams.get("title"); 
            data.dash = currentURL.searchParams.get("dash");
        }

        // set the dates
        if (!session.get(SELECTED_DATES)) {
            const dateToday = new Date(), dateWeekAgo = new Date(); dateWeekAgo.setDate(dateToday.getDate() - 7);
            data.dateTimeNow = new Date(dateToday.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0];
            data.dateTimeWeekAgo = new Date(dateWeekAgo.toString().split('GMT')[0]+' UTC').toISOString().split('.')[0];
        } else {
            data.dateTimeNow = session.get("selecteddates").to;
            data.dateTimeWeekAgo = session.get("selecteddates").from;
        }
        
        chart_box.setTimeRange({from: data.dateTimeWeekAgo, to: data.dateTimeNow});
    }

    window.monkshu_env.onRouterLoadPage.push(async data=>{           // select current dashboard icon on page load
        const dashboardsRaw = await (await fetch(`${APP_CONSTANTS.APP_PATH}/dashboards/dashboards.json`)).json();
        const allDashIcons = document.querySelectorAll("div#leftheader > img.dashicon");
        for (const dashIcon of allDashIcons) if (data.dash.endsWith(dashboardsRaw[dashIcon.id]))
            dashIcon.classList.add("selected"); else dashIcon.classList.remove("selected");
    });
}

async function changePassword(_element) {
    monkshu_env.components['dialog-box'].showDialog(`${APP_CONSTANTS.DIALOGS_PATH}/changepass.html`, true, true, {}, "dialog", ["p1","p2"], async result=>{
        const done = await loginmanager.changepassword(session.get(APP_CONSTANTS.USERID), result.p1);
        if (!done) monkshu_env.components['dialog-box'].error("dialog", 
            await i18n.get("PWCHANGEFAILED", session.get($$.MONKSHU_CONSTANTS.LANG_ID)));
        else monkshu_env.components['dialog-box'].hideDialog("dialog");
    });
}

export const main = {changePassword, interceptPageLoad, getAndUpdateTimeRange, playPauseCharts};