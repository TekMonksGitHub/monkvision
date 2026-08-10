/**
 * Threat-Status-Card - Displays live threat status for multiple attacks.
 */

import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const toUTCString = d => new Date(d.toString().split('GMT')[0] + ' UTC').toISOString().split('.')[0];

async function elementRendered(element) {
    if (!element.__skip_refresh) _refreshData(element, true);
}

function getTimeRange() {
    if (!threat_status_card.timeRange) {
        const dateToday = new Date(), dateWeekAgo = new Date();
        dateWeekAgo.setDate(dateToday.getDate() - 2);
        setTimeRange({ from: toUTCString(dateWeekAgo), to: toUTCString(dateToday) });
    }
    return threat_status_card.timeRange;
}

function setTimeRange(timeRange) {
    threat_status_card.timeRange = timeRange;
    for (const element of threat_status_card.getAllElementInstances()) _refreshData(element);
}

async function _refreshData(element, force) {
    const id = element.id, api = element.getAttribute("api"), params = element.getAttribute("params");
    const content = await _getContent(api, params);
    const memory = threat_status_card.getMemory(id);

    const createData = () => ({
        title: content?.contents?.title || element.getAttribute("title"),
        styleBody: element.getAttribute("styleBody") ? `<style>${element.getAttribute("styleBody")}</style>` : null
    });

    if (!force && content && !content.contents) {
        if (memory.contents) {
            element.__skip_refresh = true;
            await threat_status_card.bindData(createData(), id);
            delete element.__skip_refresh;
            delete memory.contents;
        }
        return;
    } else if (!force && content && JSON.stringify(memory.contents) == JSON.stringify(content.contents)) {
        return;
    } else if (content) {
        memory.contents = content.contents ? JSON.parse(JSON.stringify(content.contents)) : null;
    } else {
        delete memory.contents;
    }

    const data = createData();
    if (content?.contents) {
        delete content.contents.title;
        if (content.contents.attacks) {
            data.attacks = content.contents.attacks.map(attack => ({
                ...attack,
                name: APP_CONSTANTS.TITLE_MAPPING?.[attack.name] ?? attack.name,
                isSafe: attack.status === 'SAFE'
            }));
        }
    }

    element.__skip_refresh = true;
    await threat_status_card.bindData(data, id);
    delete element.__skip_refresh;
}

async function _getContent(api, params) {
    if (!api) return;
    const paramsAsJSON = Object.fromEntries(params.split("&").map(p => p.split("=")));
    return await apiman.rest(
        `${APP_CONSTANTS.API_PATH}/${api}`,
        "GET",
        { ...paramsAsJSON, timeRange: JSON.stringify(getTimeRange()) },
        true
    );
}

function refresh() {
    for (const element of threat_status_card.getAllElementInstances()) _refreshData(element);
}

export const threat_status_card = {
    trueWebComponentMode: true,
    elementRendered,
    getTimeRange,
    setTimeRange,
    refresh
}

monkshu_component.register("threat-status-card", `${APP_CONSTANTS.COMPONENTS_PATH}/threat-status-card/threat-status-card.html`, threat_status_card);
