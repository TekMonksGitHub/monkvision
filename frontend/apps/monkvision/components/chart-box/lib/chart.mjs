/**
 * Helper for drawing charts. Abstracts the charting framework
 * used from rest of the code.
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * See enclosed license.txt file.
 */

const _init = async _ => await $$.require(`${APP_CONSTANTS.COMPONENTS_PATH}/chart-box/3p/chartjs2.9.3.min.js`);

/**
 * Renders given data as a bar graph. 
 * 
 * @param canvas    The hosting canvas element
 * @param content   {x: x labels, ys:[[y values]], infos:[[info for each y, rendered as tooltips]]}
 * @param maxXTicks The maximum x-axis ticks allowed
 * @param gridLines Draw gridlines or not
 * @param xAtZero   Start X at zero
 * @param yAtZeros  Start Y at zero, array with one for each dataset y axis
 * @param ysteps    The y-axis tick stepping, for each dataset
 * @param ylabels   The y-axis tick labels, as many as ticks on y-axis
 * @param bgColors  The background colors for the bars, array of arrays for each value in the dataset
 * @param brColors  The border colors for the bars, array of arrays for each value in the dataset
 */
async function drawBargraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, bgColors, brColors) {
    await _drawLineOrBarGraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, bgColors, brColors, "bar", 0, 1);
}

/**
 * Renders given data as a line graph. Can support stacked line graphs, but can't
 * support multi-axis graphs.
 * 
 * @param canvas    The hosting canvas element
 * @param content   {x: x labels, ys:[[y values]], infos:[[info for each y, rendered as tooltips]]}
 * @param maxXTicks The maximum x-axis ticks allowed
 * @param gridLines Draw gridlines or not
 * @param xAtZero   Start X at zero
 * @param yAtZeros  Start Y at zero, array with one for each dataset y axis
 * @param ysteps    The y-axis tick stepping, for each dataset
 * @param ylabels   The y-axis tick labels, as many as ticks on y-axis
 * @param bgColor   The fill color for the line
 * @param brColor   The border color for the line
 */
async function drawLinegraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, bgColors, brColors) {
    await _drawLineOrBarGraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, bgColors, brColors, "line", 0.5, 2);
}

async function _drawLineOrBarGraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, bgColors, brColors, type, pointWidth, lineWidth) {
    await _init(); const ctx = canvas.getContext("2d"); gridLines = gridLines?gridLines.toLowerCase()=="true":false;

    const datasets = []; for (const [i,ys] of contents.ys.entries()) datasets.push({ data: ys, 
        backgroundColor: bgColors[i], borderColor: brColors[i], borderWidth: lineWidth, pointRadius: pointWidth });

    const data = {labels: contents.x, datasets}

    const yAxes = []; for (let i = 0; i < contents.ys.length; i++) yAxes.push({ 
        gridLines: {drawOnChartArea: gridLines, drawTicks: false}, 
        ticks: {padding:5, stepSize:ysteps[i], beginAtZero: yAtZeros?yAtZeros[i].toLowerCase()=="true":false, 
            callback:label => ylabels[i][label] ? ylabels[i][label] : (ylabels[i]["else"]||ylabels[i]["else"]=="" ? ylabels[i]["else"]:label)} });

    const options = {
        maintainAspectRatio: false, 
        responsive: true, 
        legend: { display: false },
        tooltips: {callbacks: {label: item => contents.infos[item.datasetIndex][item.index].split("\n")}, displayColors:false},
        animation: {animateScale:true},
        scales: { xAxes: [{ gridLines: {drawOnChartArea: gridLines, drawTicks: false}, 
                ticks: {padding:5, beginAtZero: xAtZero?xAtZero.toLowerCase() == "true":false, autoSkip: true,
                maxTicksLimit: maxXTicks, maxRotation: 0} }], yAxes }
    }

    return new Chart(ctx, {type, data, options});
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