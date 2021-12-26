
import { parsingDefaultConfig } from "./util.js";

export const COLOR_PALLETE2 = ['#4e73df', '#1cc88a', '#36b9cc', '#FF9CB9'];
export const COLOR_PALLETE3 = ['#2e59d9', '#17a673', '#2c9faf', '#ff6384'];
export const COLOR = ['#156f99', '#e4ac1e', '#c45850', '#d45087', '#d4a294', '#a05195', '#f95d6a', '#ff7c43', '#ffa600', '#3e95cd', '#8e5ea2', '#2f4b7c', '#fffff'];
let delayed = false;
export const delayed_reset = () => {
    delayed = false;
}

const options_doughnut_default = {
    centerText: '',
    legendPosition: 'bottom',
    legendDisplay: true,
    onClickFunc: null,
    plugin_args: [],
    cutoutPercentage: 80,

}
export function option_doughnutChart(options = options_doughnut_default) {
    parsingDefaultConfig(options, options_doughnut_default);
    let plugins = {
        text: {
            text: options.centerText
        },
        legend: {
            onHover: function (e) {
                e.native.target.style.cursor = 'pointer';
            },
            display: options.legendDisplay,
            position: options.legendPosition,
        },
        tooltip: {
            callbacks: {
                footer: footer,
            }

        },
    }

    options.plugin_args.forEach(p => {
        for (let [key, value] of Object.entries(p)) {
            plugins[key] = value;
        }
    })
    return {
        responsive: true,
        maintainAspectRatio: false,
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 10,
            yPadding: 10,
            displayColors: true,
            caretPadding: 10,
        },
        plugins,
        cutoutPercentage: options.cutoutPercentage,
        onHover: (chart, chartElmnt) => {
            if (chartElmnt[0]) {
                chart.native.target.style.cursor = 'pointer';
            }
        },
        onClick: options.onClickFunc
    }
}
const yAxisDefaultConfig = {
    beginAtZero: false,
    titleDisplay: true,
    type: 'linear',
    title: ' ',
    ticks: '',
    tickStep: '5',
    fontSize: 20,
    valueRatio: 1,
    position: 'left'
}
/**
 * initialize option for general line chart
 * @param {String} xAxisLabel 
 * @param {String} yAxisLabel 
 * @param {Number} yAxisStep 
 * @param {String} ticksType 
 * @param {Object} animations 
 * @returns 
 */
export const option_lineChart = (xAxisLabel, yAxisConfig = yAxisDefaultConfig, animations, plugins_args = []) => {
    if (animations === false)
        animations = [];
    let plugins = {
        legend: {
            display: true
        },
        text: false,
        labels: false,
        zoom: plugin_zoom,
    }
    plugins_args.forEach(p => {
        plugins[Object.keys(p)[0]] = Object.values(p)[0];
    });

    parsingDefaultConfig(yAxisConfig, yAxisDefaultConfig);

    return {
        maintainAspectRatio: false,
        radius: 1,
        hitRadius: 30,
        hoverRadius: 10,
        animation: animations,
        onHover: (chart, chartElmnt) => {
            if (chartElmnt[0]) {
                chart.native.target.style.cursor = 'pointer';
                // let index = chartElmnt[0].datasetIndex;
                // chart.chart.data.datasets[index].borderWidth = 5;
                // console.log(chart.datasets[index]);
            } else {
                if (chart.y < chart.chart.chartArea.bottom && chart.y > chart.chart.chartArea.top && chart.x > chart.chart.chartArea.left && chart.y < chart.chart.chartArea.right) {
                    chart.native.target.style.cursor = 'grab';
                };
            }
        },
        scales: {
            y: {
                type: yAxisConfig.type,
                position: yAxisConfig.position,
                beginAtZero: yAxisConfig.beginAtZero,
                title: {
                    display: yAxisConfig.titleDisplay,
                    text: yAxisConfig.title,
                    font: {
                        size: yAxisConfig.fontSize
                    }

                },
                ticks: {
                    stepSize: yAxisConfig.tickStep,

                    callback: function (value, index, values) {
                        if (index === 0) {
                            return (Math.floor(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else if (index === (values.length - 1)) {
                            return (Math.ceil(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else {
                            return (value * yAxisConfig.valueRatio).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        }

                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: xAxisLabel,
                    font: {
                        size: 20
                    }
                }
            }
        },
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 10,
            yPadding: 10,
            displayColors: false,
            caretPadding: 10,
        },
        plugins
    }
}

/**
 * 
 * @param {String} xAxisLabel 
 * @param {Object} yAxisConfig - Configuration of LEFT axis
 * @param {Object} y1AxisConfig - Configuration of RIGHT Axist
 * @param {Array | False} animations 
 * @param {Array} plugins_args 
 * @returns 
 */
export function option_DualAxesLineChart(xAxisLabel, yAxisConfig = yAxisDefaultConfig, y1AxisConfig = yAxisDefaultConfig, animations, plugins_args = []) {
    y1AxisConfig.position = 'right';
    if (animations === false)
        animations = [];
    let plugins = {
        legend: {
            display: true
        },
        text: false,
        labels: false,
        zoom: plugin_zoom,
    }
    plugins_args.forEach(p => {
        plugins[Object.keys(p)[0]] = Object.values(p)[0];
    });
    parsingDefaultConfig(yAxisConfig, yAxisDefaultConfig);
    parsingDefaultConfig(y1AxisConfig, yAxisDefaultConfig);


    return {
        maintainAspectRatio: false,
        radius: 1,
        hitRadius: 30,
        hoverRadius: 10,
        animation: animations,
        scales: {
            y: {
                position: yAxisConfig.position,
                type: yAxisConfig.type,
                beginAtZero: yAxisConfig.beginAtZero,
                title: {
                    display: yAxisConfig.titleDisplay,
                    text: yAxisConfig.title,
                    font: {
                        size: yAxisConfig.fontSize
                    }

                },
                ticks: {
                    stepSize: yAxisConfig.stepSize,
                    callback: function (value, index, values) {
                        if (index === 0) {
                            return (Math.floor(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else if (index === (values.length - 1)) {
                            return (Math.ceil(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else {
                            return (value * yAxisConfig.valueRatio).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        }

                    }
                }, grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
            y1: {
                position: y1AxisConfig.position,
                type: y1AxisConfig.type,
                beginAtZero: y1AxisConfig.beginAtZero,
                title: {
                    display: y1AxisConfig.titleDisplay,
                    text: y1AxisConfig.title,
                    font: {
                        size: y1AxisConfig.fontSize
                    }

                },
                ticks: {
                    stepSize: y1AxisConfig.stepSize,
                    callback: function (value, index, values) {
                        if (index === 0) {
                            return (Math.floor(value * y1AxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + y1AxisConfig.ticks;
                        } else if (index === (values.length - 1)) {
                            return (Math.ceil(value * y1AxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + y1AxisConfig.ticks;
                        } else {
                            return (value * y1AxisConfig.valueRatio).toLocaleString('en-US', { maximumFractionDigits: 2 }) + y1AxisConfig.ticks;
                        }


                    }
                }, grid: {
                    drawOnChartArea: false,
                },
            },
            x: {
                title: {
                    display: true,
                    text: xAxisLabel,
                    font: {
                        size: 20
                    }
                }
            }
        },
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 10,
            yPadding: 10,
            displayColors: false,
            caretPadding: 10,
        },
        plugins
    }

}

export function option_liveChart_dualAxes(xAxisLabel, yAxisConfig = yAxisDefaultConfig, y1AxisConfig = yAxisDefaultConfig, animations, plugins_args = []) {
    y1AxisConfig.position = 'right';
    if (animations === false)
        animations = [];
    let plugins = {
        legend: {
            display: true
        },
        text: false,
        labels: false,
        zoom: plugin_zoom_live,
    }
    plugins_args.forEach(p => {
        plugins[Object.keys(p)[0]] = Object.values(p)[0];
    });
    parsingDefaultConfig(yAxisConfig, yAxisDefaultConfig);
    parsingDefaultConfig(y1AxisConfig, yAxisDefaultConfig);

    return {
        maintainAspectRatio: false,
        radius: 1,
        hitRadius: 30,
        hoverRadius: 10,
        animation: animations,
        scales: {
            y: {
                position: yAxisConfig.position,
                type: yAxisConfig.type,
                beginAtZero: yAxisConfig.beginAtZero,
                title: {
                    display: yAxisConfig.titleDisplay,
                    text: yAxisConfig.title,
                    font: {
                        size: yAxisConfig.fontSize
                    }

                },
                ticks: {
                    stepSize: yAxisConfig.stepSize,
                    callback: function (value, index, values) {
                        if (index === 0) {
                            return (Math.floor(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else if (index === (values.length - 1)) {
                            return (Math.ceil(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else {
                            return (value * yAxisConfig.valueRatio).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        }

                    }
                }, grid: {
                    drawOnChartArea: false,
                },
            },
            y1: {
                position: y1AxisConfig.position,
                type: y1AxisConfig.type,
                beginAtZero: y1AxisConfig.beginAtZero,
                title: {
                    display: y1AxisConfig.titleDisplay,
                    text: y1AxisConfig.title,
                    font: {
                        size: y1AxisConfig.fontSize
                    }

                },
                ticks: {
                    stepSize: y1AxisConfig.stepSize,
                    callback: function (value, index, values) {
                        if (index === 0) {
                            return (Math.floor(value * y1AxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + y1AxisConfig.ticks;
                        } else if (index === (values.length - 1)) {
                            return (Math.ceil(value * y1AxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + y1AxisConfig.ticks;
                        } else {
                            return (value * y1AxisConfig.valueRatio).toLocaleString('en-US', { maximumFractionDigits: 2 }) + y1AxisConfig.ticks;
                        }


                    }
                }, grid: {
                    drawOnChartArea: false,
                },
            },
            x: {
                type: 'realtime',
                realtime: {
                    duration: 7200000,
                    delay: 50000,
                    refresh: 30000,
                    framRate: 5
                },
                title: {
                    display: true,
                    text: xAxisLabel,
                    font: {
                        size: 20
                    }
                }
            }
        },
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 10,
            yPadding: 10,
            displayColors: false,
            caretPadding: 10,
        },
        plugins
    }
}
/**
 * 
 * @param {String} xAxisLabel 
 * @param {Object} yAxisConfig - Configuration of LEFT axis
 * @param {Array | False} animations 
 * @param {Array} plugins_args 
 * @returns 
 */
export function option_liveChart_singleAxis(xAxisLabel, yAxisConfig = yAxisDefaultConfig, animations, plugins_args = []) {

    if (animations === false)
        animations = [];
    let plugins = {
        legend: {
            display: true
        },
        text: false,
        labels: false,
        zoom: plugin_zoom_live,
    }
    plugins_args.forEach(p => {
        plugins[Object.keys(p)[0]] = Object.values(p)[0];
    });
    parsingDefaultConfig(yAxisConfig, yAxisDefaultConfig);
    return {
        maintainAspectRatio: false,
        radius: 1,
        hitRadius: 30,
        hoverRadius: 10,
        animation: animations,
        scales: {
            y: {
                position: yAxisConfig.position,
                type: yAxisConfig.type,
                beginAtZero: yAxisConfig.beginAtZero,
                title: {
                    display: yAxisConfig.titleDisplay,
                    text: yAxisConfig.title,
                    font: {
                        size: yAxisConfig.fontSize
                    }

                },
                ticks: {
                    stepSize: yAxisConfig.stepSize,
                    callback: function (value, index, values) {
                        if (index === 0) {
                            return (Math.floor(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else if (index === (values.length - 1)) {
                            return (Math.ceil(value * yAxisConfig.valueRatio)).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        } else {
                            return (value * yAxisConfig.valueRatio).toLocaleString('en-US', { maximumFractionDigits: 2 }) + yAxisConfig.ticks;
                        }

                    }
                }, grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            },
            x: {
                type: 'realtime',
                realtime: {
                    duration: 7200000,
                    delay: 50000,
                    refresh: 30000,
                    framRate: 5
                },
                title: {
                    display: true,
                    text: xAxisLabel,
                    font: {
                        size: 20
                    }
                }
            }
        },
        tooltips: {
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 10,
            yPadding: 10,
            displayColors: false,
            caretPadding: 10,
        },
        plugins
    }

}
export const plugin_zoom = {
    zoom: {
        wheel: {
            enabled: true,
        },
        pinch: {
            enabled: true
        },
        onZoom: function (chart) {
            chart.chart.data.datasets.forEach(dataset => {
                dataset.borderWidth = (chart.chart.getZoomLevel(this) * 1.5);
            });
        }
        ,
        mode: 'xy'
    },
    pan: {
        enabled: true,
        mode: 'xy',
        threshold: 1
    },
    limits: {
        x: { min: 'original', max: 'original' },
        y: { min: 'original', max: 'original' }
    }
}
export const plugin_zoom_live = {
    zoom: {
        wheel: {
            enabled: true,
        },
        pinch: {
            enabled: true
        },
        // resize line width
        onZoom: function (chart) {
            chart.chart.data.datasets.forEach(dataset => {
                dataset.borderWidth = (chart.chart.getZoomLevel(this) * 1.5);
            });
        },
        mode: 'xy'
    },
    pan: {
        enabled: true,
        mode: 'xy'
    },
    limits: {
        x: {
            minDelay: 30000,     // Min value of the delay option
            maxDelay: 7200000,     // Max value of the delay option
            minDuration: 30000,  // Min value of the duration option
            maxDuration: 7200000   // Max value of the duration option
        },
        y: { min: 'original', max: 'original' }

    }
}
/**
 * Doughnut Charts
 */






//#region custome plugins
// import zoomPlugin from 'chartjs-plugin-zoom';
// Chart.register(zoomPlugin);
//#region Center text doughnut plugin
Chart.register({
    id: 'text',
    beforeDraw: function (chart, args, option) {
        // console.log(chart);
        var width = chart.chartArea.width,
            height = chart.chartArea.height,
            ctx = chart.ctx;
        ctx.restore();
        var fontSize = (width / 10) < (height / 10) ? (width / 10).toFixed(2) : (height / 10).toFixed(2);
        ctx.font = fontSize + "px " + Chart.defaults.font.family
        ctx.textBaseline = "middle";
        var textX = Math.round((width - ctx.measureText(option.text).width) / 2),
            textY = height / 2;
        ctx.fillStyle = Chart.defaults.font.color;
        ctx.fillText(option.text, textX, textY);
        ctx.save();
    }
});
//#endregion
Chart.register({
    id: "vLine",
    beforeDraw: function (chart, args, option) {
        if (chart.config._config.type === 'line') {
            if (chart.tooltip._active.length > 0) {
                const ctx = chart.ctx;
                ctx.save();
                const activePoint = chart.tooltip._active[0];
                const color = activePoint.element.options.borderColor;
                ctx.beginPath();
                ctx.moveTo(activePoint.element.x, activePoint.element.y);
                ctx.strokeStyle = color;
                if ((activePoint.element.y) < chart.chartArea.bottom - 25) {
                    ctx.setLineDash([5, 7]);
                    ctx.lineWidth = chart.chartArea.height / 80;
                    ctx.lineTo(activePoint.element.x, chart.chartArea.bottom - 25);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.fillStyle = color;
                    ctx.moveTo(activePoint.element.x, chart.chartArea.bottom - 25);
                    ctx.lineTo(activePoint.element.x - 5, chart.chartArea.bottom - 25);
                    ctx.lineTo(activePoint.element.x, chart.chartArea.bottom);
                    ctx.lineTo(activePoint.element.x + 5, chart.chartArea.bottom - 25);
                    ctx.closePath();
                    ctx.fill();
                    ctx.restore();
                }

            }
        }


    },
})
//#region H_line plugin
Chart.register({
    id: 'hLine',

    beforeDraw: function (chart, args, option) {
        if (chart.config._config.type === 'line') {
            if (chart.tooltip._active.length > 0) {
                const ctx = chart.ctx;
                ctx.save();
                const activePoint = chart.tooltip._active[0];
                const color = activePoint.element.options.borderColor;
                ctx.beginPath();
                ctx.moveTo(activePoint.element.x, activePoint.element.y);
                ctx.strokeStyle = color;
                if ((chart.chartArea.bottom - activePoint.element.y) > 10 && (activePoint.element.y - chart.chartArea.top) > 10) {
                    if (activePoint.element.$context.dataset.yAxisID === 'y') {
                        if ((activePoint.element.x - chart.chartArea.left) > 25) {

                            ctx.setLineDash([5, 7]);
                            ctx.lineWidth = chart.chartArea.height / 80;
                            ctx.lineTo(chart.chartArea.left + 25, activePoint.element.y);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.fillStyle = color;
                            ctx.lineTo(chart.chartArea.left + 25, activePoint.element.y - 5);
                            ctx.lineTo(chart.chartArea.left, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.left + 25, activePoint.element.y + 5);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            ctx.fillStyle = color;
                            ctx.moveTo(chart.chartArea.left - 40, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.left - 40, activePoint.element.y - 10);
                            ctx.lineTo(chart.chartArea.left - 15, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.left - 40, activePoint.element.y + 10);
                            ctx.globalAlpha = 0.8;
                            ctx.closePath();
                            ctx.fill();

                        }
                    } else {

                        if ((chart.chartArea.right - activePoint.element.x) > 25) {
                            ctx.setLineDash([5, 7]);
                            ctx.lineWidth = chart.chartArea.height / 80;
                            ctx.lineTo(chart.chartArea.right - 25, activePoint.element.y);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.fillStyle = color;
                            ctx.lineTo(chart.chartArea.right - 25, activePoint.element.y - 5);
                            ctx.lineTo(chart.chartArea.right, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.right - 25, activePoint.element.y + 5);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            ctx.fillStyle = color;
                            ctx.moveTo(chart.chartArea.right + 40, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.right + 40, activePoint.element.y - 10);
                            ctx.lineTo(chart.chartArea.right + 15, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.right + 40, activePoint.element.y + 10);
                            ctx.globalAlpha = 0.8;
                            ctx.closePath();
                            ctx.fill();

                        }
                    }

                    ctx.restore();
                }

            }
        }


    },
    afterDraw: function (chart, args, option) {
        if (chart.config._config.type === 'line') {
            if (chart.tooltip._active.length > 0) {
                const ctx = chart.ctx;
                ctx.save();
                const activePoint = chart.tooltip._active[0];
                const color = activePoint.element.options.borderColor;
                ctx.beginPath();
                ctx.strokeStyle = color;
                if ((chart.chartArea.bottom - activePoint.element.y) < 10 || (activePoint.element.y - chart.chartArea.top) < 10) {
                    if (activePoint.element.$context.dataset.yAxisID === 'y') {
                        if ((activePoint.element.x - chart.chartArea.left) > 25) {
                            ctx.moveTo(chart.chartArea.left + 25, activePoint.element.y)
                            ctx.fillStyle = color;
                            ctx.lineTo(chart.chartArea.left + 25, activePoint.element.y - 10);
                            ctx.lineTo(chart.chartArea.left, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.left + 25, activePoint.element.y + 10);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            ctx.moveTo(chart.chartArea.left - 40, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.left - 40, activePoint.element.y - 10);
                            ctx.lineTo(chart.chartArea.left - 15, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.left - 40, activePoint.element.y + 10);
                            ctx.closePath();
                            ctx.globalAlpha = 0.7;
                            ctx.fillStyle = color;
                            ctx.fill();

                        }


                    } else {

                        if ((chart.chartArea.right - activePoint.element.x) > 25) {
                            ctx.moveTo(chart.chartArea.right - 25, activePoint.element.y);
                            ctx.fillStyle = color;
                            ctx.lineTo(chart.chartArea.right - 25, activePoint.element.y - 10);
                            ctx.lineTo(chart.chartArea.right, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.right - 25, activePoint.element.y + 10);
                            ctx.closePath();
                            ctx.fill();
                        } else {
                            ctx.fillStyle = color;
                            ctx.moveTo(chart.chartArea.right + 40, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.right + 40, activePoint.element.y - 10);
                            ctx.lineTo(chart.chartArea.right + 15, activePoint.element.y);
                            ctx.lineTo(chart.chartArea.right + 40, activePoint.element.y + 10);
                            ctx.globalAlpha = 0.7;
                            ctx.closePath();
                            ctx.fill();

                        }
                    }
                    ctx.restore();
                }

            }
        }

    }
});
//#endregion
Chart.register(ChartStreaming);
// Chart.register(zoomPlugin);
//#endregion
//#region ChartJs init default vals
Chart.defaults.font.family = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.font.color = '#858796';
Chart.defaults.font.size = 15;
Chart.defaults.elements.line.borderWidth = 2;
//#endregion
export const animation_lineAppear = {
    onComplete: (e) => {
        delayed = true;
    },
    delay: (context) => {
        let delay = 0;
        if (context.type === 'data' && context.mode === 'default' && !delayed) {
            delay = context.dataIndex * 100 + context.datasetIndex * 100;
        }
        return delay;
    },
}

const footer = (tooltipItems, b, c) => {
    let sum = 0;
    for (let i = 0; i < tooltipItems[0].dataset.data.length; i++) {
        if (tooltipItems[0].chart.getDataVisibility(i)) {
            sum += tooltipItems[0].dataset.data[i];
        }
    }
    return 'Total: ' + sum.toFixed(2) + " hours\nClick for details";
};

const pulsingEffect = () => {
    return {
        borderWidth: {
            duration: 1000,
            from: 10,
            to: 0,
            loop: true
        }
    }
}