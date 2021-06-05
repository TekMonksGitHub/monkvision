/**
 * Chart-box component common utility functions
 *  
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed license.txt file.
 */

/**
 * Export CSV
 * @param {object} contents The incoming data object for the csv
 * @param {string} filename The file name of csv
 */

const _init = async _ => { if (!window.Papa || !window.Papa.unparse) await $$.require(`${APP_CONSTANTS.COMPONENTS_PATH}/chart-box/3p/papaparse-5.3.0.min.js`); }

async function exportCSV(contents, filename) {
    await _init();
    let headers = ["Timestamp"]; headers = headers.concat(contents.legends || "");
    const rows = []; for (let i = 0; i < contents.length; i++) {
        const rowContent = [contents.x[i]]; for (let j = 0; j < contents.ys.length; j++) rowContent.push(contents.ys[j][i]);
        rows.push(rowContent);
    }
    const csvBlob = new Blob([Papa.unparse({ "fields": headers, "data": rows })], { type: "text/csv" }), link = document.createElement("a");
    link.download = filename; link.href = window.URL.createObjectURL(csvBlob);
    link.click(); window.URL.revokeObjectURL(link.href); link.remove();
}

export const utils = { exportCSV };