let socket = io();
import { numberFormat } from './util.js';
import * as chartConst from './chartConst.js';
import * as create from './chartIO.js';
import * as tableCreate from './tableIO.js';
import { toggleChart } from './dashboardIO.js';
//#region chart display funcs

export function chart_dailydowntime(data, animation = true, length = 61) {
    document.querySelector('#chart_dynamic_tab_two_title').innerText = 'Daily Downtime';
    const locationCanvas = '#chart_dynamic_tab_two';
    const datasets = Object.values(data.datasets);
    const labels = data.labels;
    let animations = setAnimations(animation);
    create.lineChart(datasets, labels, locationCanvas, 'Date', {
        title: 'Time',
        ticks: 'hr',
    }, { animations, length });
}
export function chart_monthlydowntime(data, animation = true) {
    document.querySelector('#chart_dynamic_tab_three_title').innerText = 'Monthly Downtime';
    let locationCanvas = '#chart_dynamic_tab_three';
    const datasets = Object.values(data.datasets);
    const labels = data.labels;
    let animations = setAnimations(animation);
    create.lineChart(datasets, labels, locationCanvas, 'Month', { title: 'Time', ticks: 'hr', tickStep: 5 }, { delayTime: 900, chartType: 'monthly', animations });
}
export function chart_dailyTimeGroup(downtimedata, productiondata, animation = true) {
    document.querySelector('#chart_dynamic_tab_two_title').innerText = "Daily Production Time";
    let locationCanvas = '#chart_dynamic_tab_two';
    const labels = downtimedata.labels;
    let datasets = [];
    datasets.push(downtimedata.datasets['Total']);
    datasets.push(productiondata.datasets['Production Time']);
    datasets.push(productiondata.datasets['Operating Time']);
    let animations = setAnimations(animation);
    create.lineChart(datasets, labels, locationCanvas, 'Date', { title: 'Time', ticks: 'hr', tickStep: 1 }, { delayTime: 900, chartType: 'daily', animations });
}
export function chart_monthlyTimeGroup(downtimedata, productiondata, animation = true) {
    document.querySelector('#chart_dynamic_tab_three_title').innerText = "Monthly Production Time";
    let locationCanvas = '#chart_dynamic_tab_three';
    let animations = setAnimations(animation);
    const labels = downtimedata.labels;
    let datasets = [];
    datasets.push({
        label: 'Downtime',
        data: downtimedata.datasets['Total'].data
    });
    datasets.push(productiondata.datasets['Production Time']);
    datasets.push(productiondata.datasets['Operating Time']);
    create.lineChart(datasets, labels, locationCanvas, 'Month', { title: 'Time', ticks: 'hr', tickStep: 1 }, { delayTime: 900, chartType: 'monthly', animations });
}
export function chart_dailyOEE_OOE(data, title, animation = true) {
    document.querySelector('#chart_dynamic_tab_two_title').innerText = title;
    let locationCanvas = '#chart_dynamic_tab_two';
    const datasets = data.datasets;
    const labels = data.labels;
    let animations = setAnimations(animation);
    create.lineChart(datasets, labels, locationCanvas, 'Date', { title: 'Percent', ticks: '%', tickStep: 5 }, { delayTime: 900, chartType: 'daily', animations });
}
export function chart_monthlyOEE_OOE(data, title, animation = true) {
    document.querySelector('#chart_dynamic_tab_three_title').innerText = title;
    let locationCanvas = '#chart_dynamic_tab_three';
    const datasets = data.datasets;
    const labels = data.labels;
    let animations = setAnimations(animation);
    create.lineChart(datasets, labels, locationCanvas, 'Month', { title: 'Percent', ticks: '%', tickStep: 10 }, { delayTime: 900, chartType: 'monthly', animations });
}
//#region production count charts bundle
//#region FPY bundles
export function chart_dailyFPY(inputData, animation = true) {

    document.querySelector('#chart_dynamic_tab_two_title').innerText = 'Daily FPY Details';
    const locationCanvas = '#chart_dynamic_tab_two';
    let datasets = [inputData.datasets["Proccess A FPY"], inputData.datasets["Proccess B FPY"], inputData.datasets["Proccess C FPY"]];
    datasets.push({
        label: "RTY",
        data: [],
    })
    for (let counter = 0; counter < datasets[0].data.length; counter++) {
        datasets.at(-1).data.push(datasets[0].data[counter] * datasets[1].data[counter] * datasets[2].data[counter] / (10000));
    }

    const labels = inputData.labels;
    let animations = setAnimations(animation);
    create.lineChart(datasets, labels, locationCanvas, 'Date', {
        title: 'Percent',
        ticks: '%',
    }, { animations, delayTime: 300 });
}
export function chart_monthlyFPY(inputData, animation = true) {
    document.querySelector('#chart_dynamic_tab_three_title').innerText = 'Monthly FPY Details';
    const locationCanvas = '#chart_dynamic_tab_three';
    let datasets = [inputData.datasets["Proccess A FPY"], inputData.datasets["Proccess B FPY"], inputData.datasets["Proccess C FPY"]];
    datasets.push({
        label: "RTY",
        data: [],
    })
    for (let counter = 0; counter < datasets[0].data.length; counter++) {
        datasets.at(-1).data.push(datasets[0].data[counter] * datasets[1].data[counter] * datasets[2].data[counter] / (10000));
    }

    const labels = inputData.labels;
    let animations = setAnimations(animation);
    create.lineChart(datasets, labels, locationCanvas, 'Month', {
        title: 'Percent',
        ticks: '%',
    }, { animations, delayTime: 300 });
}

//#endregion


/**
 * 
 * @param {Object} inputData -parsed data
 */
export function chart_liveProductionUpdate(inputData) {
    let data = {
        datasets_left: {},
        datasets_right: {}
    }
    data.labels = inputData.labels.at(-1);
    data.datasets_left["Input"] = {
        label: "Input",
        data: inputData.datasets["Proccess A Input"].data.at(-1)
    };
    data.datasets_left["Output"] = {
        label: "Output",
        data: inputData.datasets["Output"].data.at(-1)
    }
    data.datasets_right["Proccess A FPY"] = {
        label: "Proccess A FPY",
        data: inputData.datasets["Proccess A FPY"].data.at(-1)
    };
    data.datasets_right["Proccess B FPY"] = {
        label: "Proccess B FPY",
        data: inputData.datasets["Proccess B FPY"].data.at(-1)
    };
    data.datasets_right["Proccess C FPY"] = {
        label: "Proccess C FPY",
        data: inputData.datasets["Proccess C FPY"].data.at(-1)
    };
    create.update_liveChart(data);
}
export function chart_liveProduction(inputData) {
    document.querySelector('#chart_dynamic_tab_one_title').innerText = 'Live Production Counts';
    const data = {
        labels: inputData.labels,
        datasets_left: {},
        datasets_right: {}
    }

    data.datasets_left["Input"] = {
        label: "Input",
        data: inputData.datasets["Proccess A Input"].data
    };
    data.datasets_left["Output"] = {
        label: "Output",
        data: inputData.datasets["Output"].data
    }
    // console.log(data.datasets_right);
    data.datasets_right["Proccess A FPY"] = inputData.datasets["Proccess A FPY"];
    data.datasets_right["Proccess B FPY"] = inputData.datasets["Proccess B FPY"];
    data.datasets_right["Proccess C FPY"] = inputData.datasets["Proccess C FPY"];

    create.liveChart_dualAxes_create(data, 'Time',
        { title: "Production Nr", tickStep: 20 },
        { title: "Percent", ticks: " %", tickStep: 10 });
    // create.lineChart(datasets, labels, locationCanvas, 'Date', 'Time', 'hr', 1);
}
export function chart_dailyProduction(data, type = 'general', animation = true) {

    const title = document.querySelector('#chart_dynamic_tab_two_title');
    let datasetsPrime = [];
    let datasetsScdr = [];
    let labels = data.labels;
    let locationCanvas = '#chart_dynamic_tab_two';
    if (type = 'general') {
        title.innerText = 'Daily General Production Volume';
        datasetsPrime.push({
            label: 'Input',
            data: data.datasets['Proccess A Input'].data,
        });
        datasetsPrime.push(data.datasets['Output']);
        datasetsScdr.push(data.datasets['Performance']);
    }
    let animations = setAnimations(animation);
    create.dualAxisLineChart(datasetsPrime, datasetsScdr, labels, locationCanvas, 'Date', { title: 'Products Nr', tickStep: 10, ticks: 'k', valueRatio: 0.001 }, { title: 'Performance', ticks: ' %', ticksStep: 5 }, { delayTime: 900, chartType: 'daily', animations });
}
export function chart_monthlyProduction(data, type = 'general', animation = true) {

    const title = document.querySelector('#chart_dynamic_tab_three_title');
    let datasetsPrime = [];
    let datasetsScdr = [];
    let labels = data.labels;
    let locationCanvas = '#chart_dynamic_tab_three';
    if (type = 'general') {
        title.innerText = 'Monthly General Production Volume';
        datasetsPrime.push({
            label: 'Input',
            data: data.datasets['Proccess A Input'].data,
        });
        datasetsPrime.push(data.datasets['Output']);
        datasetsScdr.push(data.datasets['Performance']);
    }
    let animations = setAnimations(animation);
    create.dualAxisLineChart(datasetsPrime, datasetsScdr, labels, locationCanvas, 'Month', { title: 'Products Nr', ticks: 'm', valueRatio: 0.000001 }, { title: 'Performance', ticks: ' %', ticksStep: 5 }, { delayTime: 900, chartType: 'monthly', animations });
}
//#endregion
//#region quality charts bundle
/**
 * 
 * @param {Object} data -parsed data
 */
export function chart_liveQualityUpdate(data) {
    let _data = {
        labels: data.labels.at(-1),
        datasets_left: {
            'Scraps Rate (Process A)': {
                label: 'Scraps Rate (Process A)',
            },
            'Scraps Rate (Process B)': {
                label: 'Scraps Rate (Process B)',
            },
            'Scraps Rate (Process C)': {
                label: 'Scraps Rate (Process C)',
            },
            'Scraps Rate (Total)': {
                label: 'Scraps Rate (Total)',
            },
        },
    }
    let input = data.datasets['Proccess A Input'].data.at(-1);
    let inputB = data.datasets['Proccess B Input'].data.at(-1);
    let inputC = data.datasets['Proccess C Input'].data.at(-1);
    let output = data.datasets['Output'].data.at(-1);
    if (input === 0) {
        _data.datasets_left['Scraps Rate (Process A)'].data = 100;
        _data.datasets_left['Scraps Rate (Process B)'].data = 100;
        _data.datasets_left['Scraps Rate (Process C)'].data = 100;
        _data.datasets_left['Scraps Rate (Total)'].data = 100;
    } else {
        _data.datasets_left['Scraps Rate (Process A)'].data = ((1 - (inputB / input)) * 100);
        _data.datasets_left['Scraps Rate (Process B)'].data = ((1 - (inputC / inputB)) * 100);
        _data.datasets_left['Scraps Rate (Process C)'].data = ((1 - (output / inputC)) * 100);
        _data.datasets_left['Scraps Rate (Total)'].data = ((1 - (output / input)) * 100);
    }
    create.update_liveChart(_data);

}
export function chart_liveQuality(data) {
    document.querySelector('#chart_dynamic_tab_one_title').innerText = 'Live Defects Rate';
    let input = data.datasets['Proccess A Input'].data;
    let inputB = data.datasets['Proccess B Input'].data;
    let inputC = data.datasets['Proccess C Input'].data;
    let output = data.datasets['Output'].data;
    let _data = {
        labels: data.labels,
        datasets: {
            'Scraps Rate (Process A)': {
                label: 'Scraps Rate (Process A)',
                data: []
            },
            'Scraps Rate (Process B)': {
                label: 'Scraps Rate (Process B)',
                data: []
            },
            'Scraps Rate (Process C)': {
                label: 'Scraps Rate (Process C)',
                data: []
            },
            'Scraps Rate (Total)': {
                label: 'Scraps Rate (Total)',
                data: []
            },
        },
    }
    for (let i = 0; i < output.length; i++) {
        _data.datasets['Scraps Rate (Process A)'].data.push(input[i] === 0 ? 100 : ((1 - (inputB[i] / input[i])) * 100));
        _data.datasets['Scraps Rate (Process B)'].data.push(input[i] === 0 ? 100 : ((1 - (inputC[i] / inputB[i])) * 100));
        _data.datasets['Scraps Rate (Process C)'].data.push(input[i] === 0 ? 100 : ((1 - (output[i] / inputC[i])) * 100));
        _data.datasets['Scraps Rate (Total)'].data.push(input[i] === 0 ? 100 : ((1 - (output[i] / input[i])) * 100));
    }

    create.liveChart_singleAxis_create(_data, 'Time', { ticks: '%', title: 'Percent' }, []);
}
export function chart_dailyQuality(data, animation = true) {
    document.querySelector('#chart_dynamic_tab_two_title').innerText = 'Daily Defect Rate';
    let locationCanvas = '#chart_dynamic_tab_two';
    let animations = setAnimations(animation);
    let labels = data.labels;
    let datasets = [];
    let proccessA = {
        label: 'Scraps Rate (Process A)',
        data: []
    }
    let proccessB = {
        label: 'Scraps Rate (Process B)',
        data: []
    }
    let proccessC = {
        label: 'Scraps Rate (Process C)',
        data: []
    }
    let total = {
        label: 'Scraps Rate (Total)',
        data: []
    }
    let input = data.datasets['Proccess A Input'].data;
    let inputB = data.datasets['Proccess B Input'].data;
    let inputC = data.datasets['Proccess C Input'].data;
    let output = data.datasets['Output'].data;

    for (let i = 0; i < output.length; i++) {
        proccessA.data.push((1 - (inputB[i] / input[i])) * 100);
        proccessB.data.push((1 - (inputC[i] / inputB[i])) * 100);
        proccessC.data.push((1 - (output[i] / inputC[i])) * 100);
        total.data.push((1 - (output[i] / input[i])) * 100);
    }
    datasets.push(proccessA, proccessB, proccessC, total);
    create.lineChart(datasets, labels, locationCanvas, 'Date', { title: 'Percent', ticks: '%', tickStep: 5 }, { delayTime: 900, chartType: 'daily', animations });
}
export function chart_monthlyQuality(data, animation = true) {
    document.querySelector('#chart_dynamic_tab_three_title').innerText = 'Monthly Defect Rate';
    let locationCanvas = '#chart_dynamic_tab_three';
    let animations = setAnimations(animation);
    let proccessA = {
        label: 'Scraps Rate (Process A)',
        data: []
    }
    let proccessB = {
        label: 'Scraps Rate (Process B)',
        data: []
    }
    let proccessC = {
        label: 'Scraps Rate (Process C)',
        data: []
    }
    let total = {
        label: 'Scraps Rate (Total)',
        data: []
    }
    let input = data.datasets['Proccess A Input'].data;
    let inputB = data.datasets['Proccess B Input'].data;
    let inputC = data.datasets['Proccess C Input'].data;
    let output = data.datasets['Output'].data;

    for (let i = 0; i < output.length; i++) {
        proccessA.data.push((1 - (inputB[i] / input[i])) * 100);
        proccessB.data.push((1 - (inputC[i] / inputB[i])) * 100);
        proccessC.data.push((1 - (output[i] / inputC[i])) * 100);
        total.data.push((1 - (output[i] / input[i])) * 100);
    }
    let labels = data.labels;
    let datasets = [];
    datasets.push(proccessA, proccessB, proccessC, total);

    create.lineChart(datasets, labels, locationCanvas, 'Month', { title: 'Percent', ticks: '%', tickStep: 5 }, { delayTime: 900, chartType: 'monthly', animations });
}
//#endregion
//#region revenue charts bundle
export function chart_dailyRevenue(data, animation = true) {

    document.querySelector('#chart_dynamic_tab_two_title').innerText = 'Daily Revenue';
    const locationCanvas = '#chart_dynamic_tab_two';
    let datasetsPrime = [];
    let datasetsScdr = [];
    datasetsPrime.push(data.datasets['Total Cost'], data.datasets['Total Revenue'], data.datasets['Total Profit']);
    datasetsScdr.push(data.datasets['Total Product']);
    const labels = data.labels;
    let animations = setAnimations(animation);
    create.dualAxisLineChart(datasetsPrime, datasetsScdr, labels, locationCanvas, 'Date', { type: 'logarithmic', ticks: ' k€', valueRatio: 0.001, tickStep: 15, beginAtZero: false }, { beginAtZero: false, title: 'Product Nr', valueRatio: 0.001, ticks: ' k', tickStep: 1000 }, { delayTime: 900, chartType: 'daily', animations });

}
export function chart_monthlyRevenue(data, animation = true) {

    document.querySelector('#chart_dynamic_tab_three_title').innerText = 'Monthly Revenue';
    const locationCanvas = '#chart_dynamic_tab_three';
    let datasetsPrime = [];
    let datasetsScdr = [];
    datasetsPrime.push(data.datasets['Total Cost'], data.datasets['Total Revenue'], data.datasets['Total Profit']);
    datasetsScdr.push(data.datasets['Total Product']);
    const labels = data.labels;
    let animations = setAnimations(animation);

    create.dualAxisLineChart(datasetsPrime, datasetsScdr, labels, locationCanvas, 'Month',
        { title: 'mils', ticks: ' m€', valueRatio: 0.000001, tickStep: 15, type: 'logarithmic' },
        { title: 'Product Nr (mils)', valueRatio: 0.001, ticks: ' k', tickStep: 1000 },
        { delayTime: 900, chartType: 'monthly', animations });

}
//#endregion
//#endregion
//#region firstInit
export function firstInit(data) {
    // for(let i =0;i<5;i++)
    document.querySelector('#revenue_this_month').innerText = numberFormat(data.revenueThisMonth, 2, "€");
    document.querySelector('#revenue_this_month').title = numberFormat(data.revenueThisMonth, 2, "€", true) + "\n Click for details."
    document.querySelector('#revenue_last_month').innerText = numberFormat(data.revenueLastMonth, 2, "€"); data.revenueLastMonth.toLocaleString('en-US', { maximumFractionDigits: 2 }) + " €";
    document.querySelector('#revenue_last_month').title = numberFormat(data.revenueLastMonth, 2, "€", true) + "\n Click for details."
    document.querySelector('#profit_this_month').innerText = numberFormat(data.profitThisMonth, 2, "€"); data.profitThisMonth.toLocaleString('en-US', { maximumFractionDigits: 2 }) + " €";
    document.querySelector('#profit_this_month').title = numberFormat(data.profitThisMonth, 2, "€", true) + "\n Click for details."
    document.querySelector('#profit_last_month').innerText = numberFormat(data.profitLastMonth, 2, "€"); data.profitLastMonth.toLocaleString('en-US', { maximumFractionDigits: 2 }) + " €";
    document.querySelector('#profit_last_month').title = numberFormat(data.profitLastMonth, 2, "€", true) + "\n Click for details."
    document.querySelector('#downtime_this_month').innerText = data.downtimeThisMonth.total.replace(':', 'h ') + 'm ';
    setSystemStatus(data.status);
    document.querySelector("#financialBoard").addEventListener('click', e => { toggleChart('revenue') });
    tableCreate.tablesInitialize(data);
    document.querySelector('#production_table_productiontime').addEventListener("click", e => { toggleChart('timeGroup') });
    document.querySelector('#production_table_operatingtime').addEventListener("click", e => { toggleChart('timeGroup') });
    document.querySelector('#production_table_downtime').addEventListener("click", e => { toggleChart('timeGroup') });
    document.querySelector('#effectiveness_table_ooe').addEventListener("click", e => { toggleChart('OOE') });
    document.querySelector('#effectiveness_table_oee').addEventListener("click", e => { toggleChart('OEE') });
    document.querySelector('#performance_table_productionVolume').addEventListener("click", e => { toggleChart('productionVolume_General') });
    document.querySelector('#performance_table_quality').addEventListener("click", e => { toggleChart('quality') });
    document.querySelector('#performance_table_performance').addEventListener("click", e => { toggleChart('productionVolume_General') });
    document.querySelector('#cost_revenue_table_revenue').addEventListener("click", e => { toggleChart('revenue') });
    document.querySelector('#cost_revenue_table_cost').addEventListener("click", e => { toggleChart('revenue') });
    document.querySelectorAll(".tt").forEach(e => {
        new bootstrap.Tooltip(e);
    })
}
export function doughnut_YTD_downtime(_data) {
    let data = {
        labels: [],
        datasets: []
    }

    data.datasets.push({
        data: [],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#FF9CB9'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#ff6384'],
        hoverBorderColor: "rgba(234, 236, 244, 1)"
    });
    for (let [key, value] of Object.entries(_data)) {
        if (key == "Total") {
            continue
        }
        data.labels.push(key);
        data.datasets[0].data.push(value.data);
    }
    create.doughnutChartCreate(data.datasets, data.labels, "#chart_doughnut_dynamic_tab_overall",
        { centerText: "Downtime", legendDisplay: true, plugin_args: [create.custommizedLabelsPlugin()], onClickFunc: btn_downtimeChart });
}
export function doughnut_thisMonth_downtime(_data) {

    let data = {
        labels: [],
        datasets: []
    }

    data.datasets.push({
        data: [],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#FF9CB9'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#ff6384'],
        hoverBorderColor: "rgba(234, 236, 244, 1)"
    });
    for (let [key, value] of Object.entries(_data.datasets)) {
        if (key == "Total") {
            continue
        }
        data.labels.push(key);
        data.datasets[0].data.push(value.data[0]);
    }
    create.doughnutChartCreate(data.datasets, data.labels, "#chart_doughnut_dynamic_tab_this_month",
        { centerText: "Downtime", legendDisplay: true, plugin_args: [create.custommizedLabelsPlugin()], onClickFunc: btn_downtimeChart });
}
//#region status Indicator
export function setSystemStatus(status) {
    if (status) {
        document.querySelector('#status_indicator').classList.add('text-success');
        document.querySelector('#status_indicator').classList.remove('text-danger');
        document.querySelector('#system_status').innerText = 'Online';
        document.querySelector('#system_status').classList.remove('text-danger');
        const card = document.querySelector('#system_status').parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        card.classList.toggle("border-left-info")
        card.classList.toggle("border-left-danger");
    } else {
        document.querySelector('#status_indicator').classList.toggle('text-danger');
        document.querySelector('#system_status').innerText = 'Offline';
        document.querySelector('#system_status').classList.toggle('text-danger');
        const card = document.querySelector('#system_status').parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        card.classList.toggle("border-left-info")
        card.classList.toggle("border-left-danger");
    }
}
//#endregion

//#region gauges
export function gauge_proccessA_FPY(gauge, data) {
    data *= 100;
    if ((data).toFixed('1') == '100') {
        data = 99 + (Math.random() * 0.91);
    }
    if ((data).toFixed('1') == '100') {
        data = (Math.random() * 0.91) + 0.08;
    }
    gauge.label.text = (data).toFixed('1') + '%';
    if (data > 25 && data < 75) {
        gauge.hand.showValue(data, 20000, am4core.ease.elasticOut);
    } else {
        gauge.hand.showValue(data, 40000, am4core.ease.linear);
    }
}
export function gauge_proccessB_FPY(gauge, data) {
    data *= 100;
    if ((data).toFixed('1') == '100') {
        data = 99 + (Math.random() * 0.91);
    }
    if ((data).toFixed('1') == '100') {
        data = (Math.random() * 0.91) + 0.08;
    }
    gauge.label.text = (data).toFixed('1') + '%';
    if (data > 25 && data < 75) {
        gauge.hand.showValue(data, 20000, am4core.ease.elasticOut);
    } else {
        gauge.hand.showValue(data, 40000, am4core.ease.linear);
    }
}
export function gauge_proccessC_FPY(gauge, data) {
    data *= 100;
    if ((data).toFixed('1') == '100') {
        data = 99 + (Math.random() * 0.91);
    }
    if ((data).toFixed('1') == '100') {
        data = (Math.random() * 0.91) + 0.08;
    }
    gauge.label.text = (data).toFixed('1') + '%';
    if (data > 25 && data < 75) {
        gauge.hand.showValue(data, 20000, am4core.ease.elasticOut);
    } else {
        gauge.hand.showValue(data, 40000, am4core.ease.linear);
    }
}
export function gauge_RTY(gauge, data) {
    data *= 100;
    if ((data).toFixed('1') == '100') {
        data = 99 + (Math.random() * 0.91);
    }
    if ((data).toFixed('1') == '100') {
        data = (Math.random() * 0.91) + 0.08;
    }
    gauge.label.text = (data).toFixed('1') + '%';
    if (data > 25 && data < 75) {
        gauge.hand.showValue(data, 20000, am4core.ease.elasticOut);
    } else {
        gauge.hand.showValue(data, 40000, am4core.ease.linear);
    }
}
export function gauge_deffectRate(gauge, data) {
    data *= 100;
    if ((data).toFixed('1') == '100') {
        data = 99 + (Math.random() * 0.91);
    }
    if ((data).toFixed('1') == '100') {
        data = (Math.random() * 0.91) + 0.08;
    }
    gauge.label.text = (data).toFixed('1') + '%';
    if (data > 25 && data < 75) {
        gauge.hand.showValue(data, 20000, am4core.ease.elasticOut);
    } else {
        gauge.hand.showValue(data, 40000, am4core.ease.linear);
    }
}
export function gauge_output(gauge, data, fast = false) {
    gauge.label.text = data;
    if (fast) {
        gauge.hand.showValue(data, 800, am4core.ease.elasticOut);
    } else {
        if (data > 10 && data < 50) {
            gauge.hand.showValue(data, 20000, am4core.ease.elasticOut);
        } else {
            gauge.hand.showValue(data, 40000, am4core.ease.linear);
        }
    }
}
//#endregion
function setAnimations(animation) {
    if (animation === true) {
        return chartConst.animation_lineAppear;
    } else if (animation === false) {
        return false;
    } else {
        return animation;
    }
}


function btn_downtimeChart() {
    toggleChart('downtime');

}
