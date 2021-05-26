/**
 * Helper for drawing charts. Abstracts the charting framework
 * used from rest of the code.
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * See enclosed license.txt file.
 */

const _init = async _ => {
    await $$.require(`${APP_CONSTANTS.COMPONENTS_PATH}/chart-box/3p/chartjs2.9.4.min.js`);
    await $$.require(`${APP_CONSTANTS.COMPONENTS_PATH}/chart-box/3p/chartjs-plugin-annotation.min.js`);
} 

/**
 * Renders given data as a bar graph. 
 * 
 * @param canvas    The hosting canvas element
 * @param contents  {x: x labels, ys:[[y values]], infos:[[info for each y, rendered as tooltips]]}
 * @param maxXTicks The maximum x-axis ticks allowed
 * @param gridLines Draw gridlines or not
 * @param xAtZero   Start X at zero
 * @param yAtZeros  Start Y at zero, array with one for each dataset y axis
 * @param ysteps    The y-axis tick stepping, for each dataset
 * @param ylabels   The y-axis tick labels, as many as ticks on y-axis
 * @param ymaxs     The max Y value
 * @param bgColors  The background colors for the bars, array of arrays for each value in the dataset
 * @param brColors  The border colors for the bars, array of arrays for each value in the dataset
 * @param labelColor The label color
 * @param gridColor The grid color
 * @param singleAxis Use single Y axis?
 * @param annotation The annotation data
 * @param legend     The legend
 */
async function drawBargraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, ymaxs, bgColors, brColors, labelColor, gridColor, singleAxis, annotation, legend) {
    return await _drawLineOrBarGraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, ymaxs, bgColors, brColors, labelColor, gridColor, singleAxis, "bar", 0, 1, annotation, legend);
}

/**
 * Renders given data as a line graph. Can support stacked line graphs, but can't
 * support multi-axis graphs.
 * 
 * @param canvas    The hosting canvas element
 * @param contents  {x: x labels, ys:[[y values]], infos:[[info for each y, rendered as tooltips]]}
 * @param maxXTicks The maximum x-axis ticks allowed
 * @param gridLines Draw gridlines or not
 * @param xAtZero   Start X at zero
 * @param yAtZeros  Start Y at zero, array with one for each dataset y axis
 * @param ysteps    The y-axis tick stepping, for each dataset
 * @param ylabels   The y-axis tick labels, as many as ticks on y-axis
 * @param ymaxs     The max Y value
 * @param bgColor   The fill color for the line
 * @param brColor   The border color for the line
 * @param labelColor The label color
 * @param gridColor The grid color
 * @param singleAxis Use single Y axis?
 * @param annotation Draw threshold line
 * @param legend     Show/Hide legend property
 */
async function drawLinegraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, ymaxs, bgColors, brColors, labelColor, gridColor, singleAxis, annotation, legend) {
    return await _drawLineOrBarGraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, ymaxs, bgColors, brColors, labelColor, gridColor, singleAxis, "line", 0.5, 2, annotation, legend);
}

async function _drawLineOrBarGraph(canvas, contents, maxXTicks, gridLines, xAtZero, yAtZeros, ysteps, ylabels, ymaxs, bgColors, brColors, labelColor, gridColor, singleAxis, type, pointWidth, lineWidth, annotations, legend) {
    await _init(); const ctx = canvas.getContext("2d"); 

    const datasets = []; for (const [i,ys] of contents.ys.entries()) datasets.push({ data: ys, ...contents.legends && { label: contents.legends[i] },     /* Add label property if legends present in contents */
        backgroundColor: bgColors[i], borderColor: brColors[i], borderWidth: lineWidth, pointRadius: pointWidth,
        yAxisID: singleAxis?"yaxis0":`yaxis${i}` });
    
    const data = {labels: contents.x, datasets}

    const yAxes = []; for (let i = 0; i < (singleAxis?1:contents.ys.length); i++) yAxes.push({ 
        gridLines: {drawOnChartArea: gridLines, drawTicks: false, color: gridColor}, id: `yaxis${i}`, type: 'linear', 
        ticks: {padding:5, stepSize:ysteps[i], beginAtZero: yAtZeros?yAtZeros[i].toLowerCase()=="true":false, 
            callback:label => ylabels[i][label] ? ylabels[i][label] : (ylabels[i]["else"]||ylabels[i]["else"]=="" ? ylabels[i]["else"]:label),
            fontColor: labelColor, suggestedMax: ymaxs&&ymaxs[i]?ymaxs[i]:null} });

    const annotationArray = []; for (const [i,annotation] of annotations.entries()) annotationArray.push({
        type: "line", mode: "horizontal", scaleID: `yaxis${i}`, value: annotation.value, borderColor: annotation.color, 
        borderWidth: annotation.width})

    const options = {
        maintainAspectRatio: false, 
        responsive: true, legend,
        tooltips: {callbacks: {label: item => contents.infos[item.datasetIndex][item.index].split("\n")}, displayColors:false},
        animation: {animateScale:true},
        scales: { xAxes: [{ gridLines: {drawOnChartArea: gridLines, drawTicks: false, color: gridColor}, 
                ticks: {padding:5, beginAtZero: xAtZero?xAtZero.toLowerCase() == "true":false, autoSkip: true,
                maxTicksLimit: maxXTicks, maxRotation: 0, fontColor: labelColor} }], yAxes },
        annotation: {drawTime: "afterDatasetsDraw",annotations:annotationArray}
    }

    return new Chart(ctx, {type, data, options});
}

/**
 * Renders given data as a pie graph. Makes the assumption that 
 * API data format is x, y and info where info is additional info.
 * 
 * @param canvas    The hosting canvas element
 * @param contents  The graph contents - must be {data, labels, colors, infos} where
 *                  data:{"labelKey":"value",...}, 
 *                  labels, must be of format {"labelKey":"label",...} object
 *                  the colors, must be of format {"labelKey":["fill","stroke"],...} object
 *                  and infos must be infos:{"labelKey":"tooltip",...} object
 * @param labelColor The label color
 * @param gridLines Draw gridlines or not
 * @param gridColor The grid color
 * @param type   Can be pie, doughnut or polararea
 */
async function drawPiegraph(canvas, rawContents, labelColor, gridLines, gridColor, type="pie") {
    await _init(); const ctx = canvas.getContext("2d");

    const datas = [], labels = [], borders = [], backgrounds = [], infos = [], contents = rawContents.data, 
        labelHash = rawContents.labels, colorHash = rawContents.colors, infoHash = rawContents.infos||[];
    for (const key of Object.keys(contents)) {
        datas.push(contents[key]); labels.push(labelHash[key]); 
        borders.push(colorHash[key][1]); backgrounds.push(colorHash[key][0]); infos.push(infoHash[key]||labelHash[key]);
    }

    const data = {labels, datasets: [{ data:datas, backgroundColor: backgrounds, borderColor: borders, borderWidth: 2}]}

    const options = {
        maintainAspectRatio: false, 
        responsive: true, 
        tooltips: {callbacks: {
            title: item => labels[item[0].index],
            label: item => datas[item.index],
            afterLabel: item => infos[item.index] == labels[item.index] ? "" : infos[item.index].split("\n")
        }, displayColors:false},
        animation: {animateScale:true},
        legend: {labels: {fontColor: labelColor}}
    }

    if (type == "polarArea") options.scale = {
        ticks: {showLabelBackdrop: false, fontColor:labelColor},
        gridLines: {display: gridLines, color: gridColor?gridColor:null}
    };

    return new Chart(ctx, {type, data, options});
}

export const chart = {drawBargraph, drawLinegraph, drawPiegraph};