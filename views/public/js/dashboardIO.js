import * as chartCreate from './chartIO.js';
import * as dataProcess from './dataProccess.js';
import * as gauge from './gauge.js';
import * as display from './display.js';
import { sendMsg } from './util.js'
let socket = io();
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
export function toggleChart(toggleTo) {
    if (chartGroup === toggleTo) {
        document.querySelector('#chart_dynamic').scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    } else {
        chartGroup = toggleTo;
        document.querySelector('#chart_dynamic').scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        btn_chartTabTwo.click();
    }
    if (chartGroup.includes('productionVolume') || chartGroup === "quality") {
        document.querySelector("#chart_downtime_tab").lastElementChild.classList.remove('d-none');
        document.querySelector("#chart_downtime_tab").lastElementChild.classList.add('d-inline');
    } else {
        document.querySelector("#chart_downtime_tab").lastElementChild.classList.add('d-none');
        document.querySelector("#chart_downtime_tab").lastElementChild.classList.remove('d-inline');
    }
}
let isLiveViewing = false;
//#region Data

let data = {
    dailyDowntimeData: {},
    monthlyDowntimeData: {},
    hourlyProductionData: {},
    dailyProductionData: {},
    monthlyProductionData: {},
    dailyOEEData: {},
    monthlyOEEData: {},
    dailyOOEData: {},
    monthlyOOEData: {},
    dailyRevenueData: {},
    monthlyRevenueData: {},
    doughnutThisMonthDowntime: {},
    doughnutYTDDowntime: {},

}
let liveProductionData = {};
let isCreated = false;
let hourlyProductionData = {};
let chartGroup = "downtime";
let gauges = {};
//#endregion 
window.addEventListener('DOMContentLoaded', e => {
    document.querySelector('#sidebarToggle').click();
    initializeGauges();
    socket.emit('dailydowntimeData', chartGroup);
    socket.emit('dashboardInfo');
    setTimeout(() => {
        socket.emit('hourlyproductionData');
    }, 3800);
})
document.querySelector("#chart_tab_doughnut_btn_second").addEventListener('click', e => {
    if (Object.keys(data.doughnutYTDDowntime).length === 0) {
        socket.emit('monthlydowntimeData', 'doughnut');
    } else {
        display.doughnut_YTD_downtime(data.doughnutYTDDowntime);
    }
})
document.querySelector("#chart_tab_doughnut_btn_first").addEventListener('click', e => {
    if (Object.keys(data.doughnutThisMonthDowntime).length === 0) {
        socket.emit('dashboardInfo');
    } else {
        display.doughnut_thisMonth_downtime(data.doughnutThisMonthDowntime);
    }
})
const btn_chartTabOne = document.querySelector("#chart_tab_btn_first");
const btn_chartTabTwo = document.querySelector('#chart_tab_btn_second');
const btn_chartTabThree = document.querySelector('#chart_tab_btn_third');
btn_chartTabOne.addEventListener('click', e => {
    isLiveViewing = true;
    chartCreate.destroyAllCharts();
    if (chartGroup.includes('productionVolume') || chartGroup === 'quality') {
        socket.emit('hourlyproductionData');
    } else {
        alert(`Invalid chart group ${chartGroup}!`);
    }
})

btn_chartTabTwo.addEventListener('click', e => {
    chartCreate.destroyAllCharts();
    isLiveViewing = false;
    switch (chartGroup) {
        case 'downtime':
            if (Object.keys(data.dailyDowntimeData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyDowntimeData.updatedAt, 'second')) {
                socket.emit('dailydowntimeData');
            } else {
                display.chart_dailydowntime(data.dailyDowntimeData);
            }
            break;
        case 'timeGroup':
            if (Object.keys(data.dailyDowntimeData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyDowntimeData.updatedAt, 'second')) {
                socket.emit('dailydowntimeData');
            } else if (Object.keys(data.dailyProductionData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyProductionData.updatedAt, 'second')) {
                socket.emit('dailyproductionData');
            } else {
                display.chart_dailyTimeGroup(data.dailyDowntimeData, data.dailyProductionData);
            }
            break;
        case 'OEE':
            if (Object.keys(data.dailyOEEData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyOEEData.updatedAt, 'second')) {

                socket.emit('dailyOEEData');
            } else {
                display.chart_dailyOEE_OOE(data.dailyOEEData, 'Daily Equipment Effectiveness');
            }
            break;
        case 'OOE':
            if (Object.keys(data.dailyOOEData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyOOEData.updatedAt, 'second')) {

                socket.emit('dailyOOEData');
            } else {
                display.chart_dailyOEE_OOE(data.dailyOOEData, 'Daily Operation Effectiveness');
            }
            break;
        case 'productionVolume_General':
            if (Object.keys(data.dailyProductionData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyProductionData.updatedAt, 'second')) {
                socket.emit('dailyproductionData');
            } else {
                display.chart_dailyProduction(data.dailyProductionData);
            }
            break;
        case 'quality':
            if (Object.keys(data.dailyProductionData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyProductionData.updatedAt, 'second')) {
                socket.emit('dailyproductionData');
            } else {
                display.chart_dailyQuality(data.dailyProductionData);
            }
            break;
        case 'revenue':
            if (Object.keys(data.dailyRevenueData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyRevenueData.updatedAt, 'second')) {
                socket.emit('dailyrevenueData');
            } else {
                display.chart_dailyRevenue(data.dailyRevenueData);
            }
            break;
        case 'FPY':
            if (Object.keys(data.dailyProductionData).length === 0 || moment().subtract(5, 'minute').isAfter(data.dailyProductionData.updatedAt, 'second')) {
                socket.emit('dailyproductionData');
            } else {
                display.chart_dailyFPY(data.dailyProductionData);
            }
            break;
        default:
            alert(`undefined chart group!! ${chartGroup}`);
            break;
    }

});

btn_chartTabThree.addEventListener('click', e => {
    chartCreate.destroyAllCharts();
    isLiveViewing = false;
    switch (chartGroup) {
        case 'downtime':
            if (Object.keys(data.monthlyDowntimeData).length === 0) {
                socket.emit('monthlydowntimeData', 'line');

            } else {
                display.chart_monthlydowntime(data.monthlyDowntimeData);
            }
            break;
        case 'timeGroup':
            if (Object.keys(data.monthlyDowntimeData).length === 0) {
                socket.emit('monthlydowntimeData');
            } else if (Object.keys(data.monthlyProductionData).length === 0) {
                socket.emit('monthlyproductionData');
            } else {
                display.chart_monthlyTimeGroup(data.monthlyDowntimeData, data.monthlyProductionData);
            }
            break;
        case 'OEE':
            if (Object.keys(data.monthlyOEEData).length === 0) {
                socket.emit('monthlyOEEData');
            } else {
                display.chart_monthlyOEE_OOE(data.monthlyOEEData, "Monthly Equipment Effectiveness");
            }
            break;
        case 'OOE':
            if (Object.keys(data.monthlyOOEData).length === 0) {
                socket.emit('monthlyOOEData');
            } else {
                display.chart_monthlyOEE_OOE(data.monthlyOOEData, "Monthly Operation Effectiveness");
            }
            break;
        case 'productionVolume_General':
            if (Object.keys(data.monthlyProductionData).length === 0) {
                socket.emit('monthlyproductionData');
            } else {
                display.chart_monthlyProduction(data.monthlyProductionData, 'general');
            }
            break;
        case 'quality':
            if (Object.keys(data.monthlyProductionData).length === 0) {
                socket.emit('monthlyproductionData');
            } else {
                display.chart_monthlyQuality(data.monthlyProductionData);
            }
            break;
        case 'revenue':
            if (Object.keys(data.monthlyRevenueData).length === 0) {
                socket.emit('monthlyrevenueData');
            } else {
                display.chart_monthlyRevenue(data.monthlyRevenueData);
            }
            break;
        case 'FPY':
            if (Object.keys(data.monthlyProductionData).length === 0) {
                socket.emit('monthlyproductionData');
            } else {
                display.chart_monthlyFPY(data.monthlyProductionData);
            }
            break;
        default:
            alert('undefined chart group!!');
    }

})


socket.on('dailyrevenueData', r => {
    dataProcess.parseData(r.data, data.dailyRevenueData, {
        minuteFormatContain: false,
        labelType: 1,
        timeFormatContain: false,
        keepField: false
    });
    chartCreate.dailyChartFrom_Set(-1);
    btn_chartTabTwo.click();
})
socket.on('monthlyrevenueData', r => {
    dataProcess.parseData(r.data, data.monthlyRevenueData, {
        minuteFormatContain: false,
        labelType: 2,
        timeFormatContain: false,
        keepField: false
    });

    btn_chartTabThree.click();
})



socket.on('dashboardInfo', _data => {
    display.firstInit(_data);
    dataProcess.parseData([_data.downtimeThisMonth], data.doughnutThisMonthDowntime, {
        minuteFormatContain: false,
        labelType: 2,
        timeFormatContain: true,
    });
    // console.log(data.doughnutThisMonthDowntime);
    display.doughnut_thisMonth_downtime(data.doughnutThisMonthDowntime);

});
socket.on('dailydowntimeData', res => {
    dataProcess.parseData(res.data, data.dailyDowntimeData, {
        minuteFormatContain: false,
        labelType: 1,
        timeFormatContain: true,
    });
    btn_chartTabTwo.click();
});

socket.on('monthlydowntimeData', res => {
    dataProcess.parseData(res.data, data.monthlyDowntimeData, {
        minuteFormatContain: false,
        labelType: 2,
        timeFormatContain: true,
    })
    // console.log(data.monthlyDowntimeData);
    if (Object.keys(data.doughnutYTDDowntime).length === 0) {

        for (let [key, val] of Object.entries(data.monthlyDowntimeData.datasets)) {
            data.doughnutYTDDowntime[key] = { data: 0 };
            val.data.forEach(d => {
                data.doughnutYTDDowntime[key].data += d;
            })
        }

    }
    if (res.chartFunc === 'line') {
        btn_chartTabThree.click();
    } else {
        display.doughnut_YTD_downtime(data.doughnutYTDDowntime);
    }


});
socket.on('dailyproductionData', res => {
    dataProcess.parseData(res.data, data.dailyProductionData, {
        minuteFormatContain: true,
        labelType: 1,
        timeFormatContain: true,
    });
    chartCreate.dailyChartFrom_Set(-1);;
    btn_chartTabTwo.click();

});
socket.on('monthlyproductionData', res => {
    dataProcess.parseData(res.data, data.monthlyProductionData, {
        minuteFormatContain: true,
        labelType: 2,
        timeFormatContain: true,
    })
    btn_chartTabThree.click();
})

socket.on('dailyOEEData', res => {
    data.dailyOEEData.labels = [...res.data.labels];
    data.dailyOEEData.datasets = [...res.data.datasets];
    data.dailyOEEData.updatedAt = moment();
    btn_chartTabTwo.click();
});
socket.on('monthlyOEEData', res => {
    data.monthlyOEEData.labels = [...res.data.labels];
    data.monthlyOEEData.datasets = [...res.data.datasets];
    btn_chartTabThree.click();
});
socket.on('dailyOOEData', res => {
    data.dailyOOEData.labels = [...res.data.labels];
    data.dailyOOEData.datasets = [...res.data.datasets];
    data.dailyOOEData.updatedAt = moment();
    btn_chartTabTwo.click();
});
socket.on('monthlyOOEData', res => {
    data.monthlyOOEData.labels = [...res.data.labels];
    data.monthlyOOEData.datasets = [...res.data.datasets];
    btn_chartTabThree.click();
});

const animationProgressiveLine = (datalength) => {
    return {
        x: {
            type: 'number',
            easing: 'linear',
            duration: 4000,
            from: NaN, // the point is initially skipped
            delay(ctx) {
                if (ctx.type !== 'data' || ctx.xStarted) {
                    return 0;
                }
                ctx.xStarted = true;
                return ctx.index * (4000 / datalength);
            }
        },
        y: {
            type: 'number',
            easing: 'linear',
            duration: 3,
            from: previousY,
            delay(ctx) {
                if (ctx.type !== 'data' || ctx.yStarted) {
                    return 0;
                }
                ctx.yStarted = true;
                return ctx.index ** (4000 / datalength);
            }
        }
    }
};
socket.on('statusChange', status => {
    display.setSystemStatus(status);
})
socket
function initializeGauges() {
    gauges.proccessAFPY = gauge.create('gauge_proccessA_FPY', 100, null, false);
    document.querySelector("#gauge_proccessA_FPY").addEventListener('click', e => {
        toggleChart('FPY');
    });
    gauges.proccessBFPY = gauge.create('gauge_proccessB_FPY', 100, null, false);
    document.querySelector("#gauge_proccessB_FPY").addEventListener('click', e => {
        toggleChart('FPY');
    });
    gauges.proccessCFPY = gauge.create('gauge_proccessC_FPY', 100, null, false);
    document.querySelector("#gauge_proccessC_FPY").addEventListener('click', e => {
        toggleChart('FPY');
    });
    gauges.RTY = gauge.create('gauge_RTY', 100, null, false);
    document.querySelector("#gauge_RTY").addEventListener('click', e => {
        toggleChart('FPY');
    });
    setTimeout(() => {
        gauges.defectRate = gauge.create('gauge_defectRate', 100, null, true);
    }, 200);
    document.querySelector("#gauge_defectRate").addEventListener('click', e => {
        document.querySelector('#chart_dynamic').scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        if (!chartGroup.includes("quality")) {
            chartGroup = "quality";
            document.querySelector("#chart_downtime_tab").lastElementChild.classList.remove('d-none');
            document.querySelector("#chart_downtime_tab").lastElementChild.classList.add('d-inline');

        } if (!btn_chartTabOne.classList.contains('active')) {
            btn_chartTabOne.click();
        }
    })
    setTimeout(() => {
        gauges.output = gauge.create('gauge_output', 60, null, false, true);

    }, 600);
    document.querySelector("#gauge_output").addEventListener('click', e => {
        document.querySelector('#chart_dynamic').scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        if (!chartGroup.includes("productionVolume")) {
            chartGroup = "productionVolume_General";
            document.querySelector("#chart_downtime_tab").lastElementChild.classList.remove('d-none');
            document.querySelector("#chart_downtime_tab").lastElementChild.classList.add('d-inline');
            if (!btn_chartTabOne.classList.contains('active')) {
                btn_chartTabOne.click();
            }
        } else {
            if (!btn_chartTabOne.classList.contains('active')) {
                btn_chartTabOne.click();
            }
        }
    })
}
socket.on('hourlyproductionData', r => {
    if (Object.keys(data.hourlyProductionData).length === 0) {
        dataProcess.parseData(r.data.slice(r.data.length - 120, r.data.length), data.hourlyProductionData, {
            minuteFormatContain: false,
            timeFormatContain: false,
        });
        // console.log(Object.keys());

    } else {
        dataProcess.dataPush(r.data, data.hourlyProductionData);
    }
    gaugeSetValues(r.data.at(-1));
    if (isLiveViewing) { //Do these things only if there is a live chart
        if (Object.keys(data.hourlyProductionData).length == 0) {
            socket.on('hourlyproductionData');
        } else {
            if (chartCreate.liveChartCreated) {
                if (chartGroup.includes("productionVolume")) {
                    display.chart_liveProductionUpdate(data.hourlyProductionData);
                } else if (chartGroup === 'quality') {
                    display.chart_liveQualityUpdate(data.hourlyProductionData);
                } else {
                    console.error(chartGroup);
                }
            } else {
                if (chartGroup.includes("productionVolume")) {
                    display.chart_liveProduction(data.hourlyProductionData);
                } else if (chartGroup === 'quality') {
                    display.chart_liveQuality(data.hourlyProductionData);
                } else {
                    console.error(chartGroup);
                }

            }
        }
    }

});


function gaugeSetValues(data) {
    display.gauge_proccessA_FPY(gauges.proccessAFPY, data.proccessA.FPY);
    display.gauge_proccessB_FPY(gauges.proccessBFPY, data.proccessB.FPY);
    display.gauge_proccessC_FPY(gauges.proccessCFPY, data.proccessC.FPY);
    display.gauge_RTY(gauges.RTY, (data.proccessA.FPY * data.proccessB.FPY * data.proccessC.FPY));
    if (data.proccessA.input === 0) {
        display.gauge_deffectRate(gauges.defectRate, 0);

    } else {
        display.gauge_deffectRate(gauges.defectRate, 1 - (data.output / data.proccessA.input));
    }
    display.gauge_output(gauges.output, data.output);
}
socket.on('rateChange', r => {



});
socket.on("systemOnline", r => {
    display.setSystemStatus(r.systemStatus);
    console.log(r.systemStatus);
});
socket.on("systemOffline", r => {
    console.log(r.systemStatus);
    display.setSystemStatus(r.systemStatus);
    gaugeSetValues({ proccessA: { input: 0, FPY: 0 }, proccessB: { FPY: 0 }, proccessC: { FPY: 0 }, output: 0 });
});

