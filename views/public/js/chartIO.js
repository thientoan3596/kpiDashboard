import * as config from './chartConst.js';
export let liveChartCreated = false;
import { parsingDefaultConfig } from './util.js';
export let dailyChartFrom = -1;
let chart = null;
export let doughnutChart = null;
export function dailyChartFrom_Set(value) {
    dailyChartFrom = value;
}
export function destroyAllCharts() {
    liveChartCreated = false;
    config.delayed_reset();
    if (chart != null) {

        chart.destroy();
        chart = null;
    }

}

/**
 * Doughnut charts
 * @param {Object} [options] -{
 *   centerText: '',
 *   legendPosition: 'botton',
 *   legendDisplay: false,
 *   onClickFunc: null,
 *   plugin_args: [],
 *   cutoutPercentage: 80,}
 */

export function doughnutChartCreate(datasets, labels, locationCanvas, options, delayTime = 200) {
    let ctx = document.querySelector(locationCanvas);
    if (doughnutChart !== null) {
        doughnutChart.destroy();
    }
    setTimeout(() => {
        doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets,
            },
            options: config.option_doughnutChart(options)
        });
    }, delayTime)

}


const option_default_lineChart = { delayTime: 500, chartType: 'daily', animations: config.animation_lineAppear, plugins: [], from: -1, length: 61 }

/**
 * 
 * @param {Array} datasets 
 * @param {Array} labels 
 * @param {String} locationCanvas 
 * @param {String} xAxisLabel 
 * @param {String} yAxisLabel 
 * @param {String} yAxisTicks 
 * @param {Number} yAxisTicksStep 
 * @param {Object} [option] - [delayTime=500,chartType='daily', animations=config.animation_lineAppear, from=-1, length=61] 
 */
export function lineChart(datasets, labels, locationCanvas, xAxisLabel, yAxisConfig, options = option_default_lineChart) {

    parsingDefaultConfig(options, option_default_lineChart);

    var ctx = document.querySelector(locationCanvas);
    let data = {
        labels: [],
        datasets: []
    }
    if (options.chartType === 'daily') {
        if (options.from = -1) {
            if (dailyChartFrom = -1) {
                options.from = labels.length - options.length;
            } else {
                options.from = dailyChartFrom;
            }
        }
        data.labels = labels.slice(options.from, options.from + options.length - 1);
        for (let i = 0; i < datasets.length; i++) {
            let item = {
                label: datasets[i].label,
                data: datasets[i].data.slice(options.from, options.from + options.length - 1),
                borderColor: config.COLOR[i],
                backgroundColor: config.COLOR[i],
                pointBackgroundColor: config.COLOR[i],
                fill: false,
                yAxisID: 'y',
                tension: 0.3
            }
            data.datasets.push(item)
        }
    } else {
        data.labels = labels;
        for (let i = 0; i < datasets.length; i++) {
            let item = {
                label: datasets[i].label,
                data: datasets[i].data,
                borderColor: config.COLOR[i],
                backgroundColor: config.COLOR[i],
                pointBackgroundColor: config.COLOR[i],
                fill: false,
                yAxisID: 'y',
                tension: 0.3
            }
            data.datasets.push(item)
        }
    }
    setTimeout(() => {
        if (chart !== null) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data,
            options: config.option_lineChart(xAxisLabel, yAxisConfig, options.animations, options.plugins)
        });
    }, options.delayTime);

}
export function dualAxisLineChart(datasetsY, datasetsY1, labels, locationCanvas, xAxisLabel, yAxisConfig, y1AxisConfig, options = option_default_lineChart) {
    parsingDefaultConfig(options, option_default_lineChart);
    var ctx = document.querySelector(locationCanvas);
    let data = {
        labels: [],
        datasets: []
    }
    if (options.chartType === 'daily') {
        if (options.from = -1) {
            if (dailyChartFrom = -1) {
                options.from = labels.length - options.length;
            } else {
                options.from = dailyChartFrom;
            }
        }
        data.labels = labels.slice(options.from, options.from + options.length - 1);
        let i = 0;
        for (; i < datasetsY.length; i++) {
            let item = {
                label: datasetsY[i].label,
                data: datasetsY[i].data.slice(options.from, options.from + options.length - 1),
                pointBackgroundColor: '#4e73df',
                borderColor: config.COLOR[i],
                backgroundColor: config.COLOR[i],
                pointBackgroundColor: config.COLOR[i],
                fill: false,
                tension: 0.3,
                yAxisID: 'y',
            }
            data.datasets.push(item)
        }
        let colorPos = i;
        for (i = 0; i < datasetsY1.length; i++) {
            let item = {
                label: datasetsY1[i].label,
                data: datasetsY1[i].data.slice(options.from, options.from + options.length - 1),
                pointBackgroundColor: '#4e73df',
                borderColor: config.COLOR[colorPos],
                backgroundColor: config.COLOR[colorPos],
                pointBackgroundColor: config.COLOR[colorPos],
                fill: false,
                tension: 0.3,
                yAxisID: 'y1',
            }
            colorPos++;
            data.datasets.push(item)
        }
    } else {
        data.labels = labels;
        let i = 0;
        for (; i < datasetsY.length; i++) {
            let item = {
                label: datasetsY[i].label,
                data: datasetsY[i].data,
                pointBackgroundColor: '#4e73df',
                borderColor: config.COLOR[i],
                backgroundColor: config.COLOR[i],
                fill: false,
                tension: 0.3,
                yAxisID: 'y',
            }
            data.datasets.push(item)
        }
        let colorPos = i;
        for (i = 0; i < datasetsY1.length; i++) {
            let item = {
                label: datasetsY1[i].label,
                data: datasetsY1[i].data,
                pointBackgroundColor: '#4e73df',
                borderColor: config.COLOR[colorPos],
                backgroundColor: config.COLOR[colorPos],
                fill: false,
                tension: 0.3,
                yAxisID: 'y1'
            }
            colorPos++;
            data.datasets.push(item)
        }
    }
    setTimeout(() => {
        if (chart !== null) {
            chart.destroy();
        }
        chart = new Chart(ctx, {
            type: 'line',
            data,
            options: config.option_DualAxesLineChart(xAxisLabel, yAxisConfig, y1AxisConfig, options.animations, options.plugins)
        });
    }, options.delayTime);

}


/**
 * 
 * @param {Object} data  -  contains {x:[],y:[],y1:[] }
 * Where x is labels (of x Axis)
 * y1 datasets of y1
 * y datasets of y
 */
export function liveChart_dualAxes_create(data, xAxisLabel, leftAxisConfig, rightAxisConfig, plugins = []) {

    let ctx = document.querySelector('#chart_dynamic_tab_one');
    let datasets = [];
    let counter = 0;
    for (let [key, val] of Object.entries(data.datasets_left)) {
        datasets.push({
            label: val.label,
            data: [],
            borderWidth: 1.5,
            pointBackgroundColor: config.COLOR[counter],
            pointBackgroundColor: config.COLOR[counter],
            borderColor: config.COLOR[counter],
            backgroundColor: config.COLOR[counter],
            fill: false,
            tension: 0.2,
            yAxisID: 'y'
        });
        counter++;
    }
    for (let [key, val] of Object.entries(data.datasets_right)) {
        datasets.push({
            label: val.label,
            data: [],
            borderWidth: 1.5,
            pointBackgroundColor: config.COLOR[counter],
            pointBackgroundColor: config.COLOR[counter],
            borderColor: config.COLOR[counter],
            backgroundColor: config.COLOR[counter],
            fill: false,
            tension: 0.2,
            yAxisID: 'y1'
        });
        counter++;
    }
    if (chart !== null) {
        chart.destroy();
    }
    // Create chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets,
        },
        options: config.option_liveChart_dualAxes(xAxisLabel, leftAxisConfig, rightAxisConfig, false, plugins)
    });
    // console.log(data.datasets_left["Input"].data[0]);
    for (counter = 0; counter < data.labels.length; counter++) {
        chart.data.datasets.forEach(i => {
            if (i.yAxisID === 'y') {
                i.data.push({
                    x: data.labels[counter],
                    y: data.datasets_left[i.label].data[counter]
                });
            }
            else {
                i.data.push({
                    x: data.labels[counter],
                    y: data.datasets_right[i.label].data[counter]
                });
            }
        });
    }
    // console.log(chart.data.datasets[0].data[0]);
    liveChartCreated = true;
    chart.update();
}


/**
 * 
 * @param {Object} data  -  contains {labels: (singleItem) ,datasets_left:{<label>:{label:<label>, data: (singleItem)}},datasets_right:{...} }
 * update live chart
 */
export function update_liveChart(data) {
    if (liveChartCreated) {
        chart.data.datasets.forEach(i => {
            if (i.yAxisID === 'y') {
                i.data.push({
                    x: data.labels,
                    y: data.datasets_left[i.label].data
                });
            }
            else {
                i.data.push({
                    x: data.labels,
                    y: data.datasets_right[i.label].data
                });
            }
        });
        chart.update('quite');
    }
}
/**
 * 
 * @param {Object} data -contains {x:[],y:[] }
 * @param {String} xAxisLabel 
 * @param {Object} yAxisConfig 
 * @param {Array} [plugins]  - array
 */
export function liveChart_singleAxis_create(data, xAxisLabel, yAxisConfig, plugins = []) {
    let ctx = document.querySelector('#chart_dynamic_tab_one');
    let datasets = [];
    let counter = 0;
    for (let [key, val] of Object.entries(data.datasets)) {
        datasets.push({
            label: val.label,
            data: [],
            borderWidth: 1.5,
            pointBackgroundColor: config.COLOR[counter],
            pointBackgroundColor: config.COLOR[counter],
            borderColor: config.COLOR[counter],
            backgroundColor: config.COLOR[counter],
            fill: false,
            tension: 0.2,
            yAxisID: 'y'
        });
        counter++;
    }
    if (chart !== null) {
        chart.destroy();
    }
    // Create chart
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets,
        },
        options: config.option_liveChart_singleAxis(xAxisLabel, yAxisConfig, plugins)
    });
    // push data in the past 120(?) min to the chart
    let m = 0;
    for (; m < data.labels.length; m++) {
        chart.data.datasets.forEach(i => {
            i.data.push({
                x: data.labels[m],
                y: data.datasets[i.label].data[m]
            });
        });
    }
    liveChartCreated = true;
    chart.update();
}

export const custommizedLabelsPlugin = (chart) => {
    return {
        labels: {
            fontSize: Chart.defaults.font.size,
            fontFamily: Chart.defaults.font.family,
            render: (context) => {
                const percentage = context.value / showData() * 100;
                return percentage.toFixed(1) + '%';
            }
        }
    }
}
export function showData(chart) {
    let totalSum = 0;
    let i = 0;
    for (i; i < doughnutChart.config.data.datasets[0].data.length; i++) {
        if (doughnutChart.getDataVisibility(i) === true) {
            totalSum += doughnutChart.config.data.datasets[0].data[i];
        }
    }
    return totalSum;
}
