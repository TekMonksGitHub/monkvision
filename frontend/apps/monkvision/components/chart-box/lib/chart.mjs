/**
 * Helper for drawing charts. Abstracts the charting framework
 * used from rest of the code.
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * See enclosed license.txt file.
 */

const _init = async _ => await $$.require(`${APP_CONSTANTS.COMPONENTS_PATH}/chart-box/3p/chartjs2.9.3.min.js`);

/**
 * Renders given data as a bar graph. Makes the assumption that 
 * API data format is x, y and info where info is additional info.
 * 
 * @param canvas    The hosting canvas element
 * @param content   The log file contents - as returned from loggraph API
 * @param maxXTicks The maximum x-axis ticks allowed
 * @param ystep     The y-axis tick stepping
 * @param ylabels   The y-axis tick labels, as many as ticks on y-axis
 * @param bgColors  The background colors for the bars, array for each value
 * @param brColors  The border colors for the bars, array for each value
 */
async function drawBargraph(canvas, contents, maxXTicks, ystep, ylabels, bgColors, brColors) {
    await _init(); const ctx = canvas.getContext("2d");

    const data = {
        labels: contents.x,
        datasets: [{ data: contents.y, backgroundColor: bgColors, borderColor: brColors, borderWidth: 1 }]
    }

    const options = {
        maintainAspectRatio: false, 
        responsive: true, 
        legend: { display: false },
        tooltips: {callbacks: {label: item => contents.info[item.index].split("\n")}, displayColors:false},
        scales: {
            xAxes: [{ gridLines: {drawOnChartArea: false, drawTicks: false}, 
                ticks: {padding:5, autoSkip: true, maxTicksLimit: maxXTicks, maxRotation: 0} }],
            yAxes: [{ gridLines: {drawOnChartArea: false, drawTicks: false}, 
                ticks: {padding:5, stepSize:ystep, callback:label => ylabels[label]?ylabels[label]:label} }]
        }
    }

    return new Chart(ctx, {type: "bar", data, options});
}

/**
 * Renders given data as a line graph. Makes the assumption that 
 * API data format is x, y and info where info is additional info.
 * 
 * @param canvas    The hosting canvas element
 * @param content   The log file contents - as returned from loggraph API
 * @param maxXTicks The maximum x-axis ticks allowed
 * @param ystep     The y-axis tick stepping
 * @param ylabels   The y-axis tick labels, as many as ticks on y-axis
 * @param bgColor   The fill color for the line
 * @param brColor   The border color for the line
 */
async function drawLinegraph(canvas, contents, maxXTicks, ystep, ylabels, bgColor, brColor) {
    await _init(); const ctx = canvas.getContext("2d");

    const data = {
        labels: contents.x,
        datasets: [{ data: contents.y, backgroundColor: bgColor, borderColor: brColor, borderWidth: 2, pointRadius: 1 }]
    }

    const options = {
        maintainAspectRatio: false, 
        responsive: true, 
        legend: { display: false },
        tooltips: {callbacks: {label: item => contents.info[item.index].split("\n")}, displayColors:false},
        animation: {animateScale:true},
        scales: {
            xAxes: [{ gridLines: {drawOnChartArea: false, drawTicks: false}, 
                ticks: {padding:5, autoSkip: true, maxTicksLimit: maxXTicks, maxRotation: 0} }],
            yAxes: [{ gridLines: {drawOnChartArea: false, drawTicks: false}, 
                ticks: {padding:5, stepSize:ystep, callback:label => ylabels[label]?ylabels[label]:label} }]
        }
    }

    return new Chart(ctx, {type: "line", data, options});
}

/**
 * Renders given data as a line graph. Makes the assumption that 
 * API data format is x, y and info where info is additional info.
 * 
 * @param canvas    The hosting canvas element
 * @param contents  The graph contents - must be {"labelKey":"value",...} object
 * @param labelHash The labels, must be of format {"labelKey":"label",...} object
 * @param colorHash The colors, must be of format {"labelKey":["fill","stroke"],...} object
 */
async function drawPiegraph(canvas, contents, labelHash, colorHash, isDonut) {
    await _init(); const ctx = canvas.getContext("2d");

    const datas = [], labels = [], borders = [], backgrounds = [];
    for (const key of Object.keys(contents)) {
        datas.push(contents[key]); labels.push(labelHash[key]); 
        borders.push(colorHash[key][1]); backgrounds.push(colorHash[key][0])
    }

    const data = {labels, datasets: [{ data:datas, backgroundColor: backgrounds, borderColor: borders, borderWidth: 2}]}

    const options = {
        maintainAspectRatio: false, 
        responsive: true, 
        tooltips: {displayColors:false},
        animation: {animateScale:true}
    }

    return new Chart(ctx, {type: isDonut?"doughnut":"pie", data, options});
}

export const chart = {drawBargraph, drawLinegraph, drawPiegraph};