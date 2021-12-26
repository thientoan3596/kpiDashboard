import { numberFormat } from "./util.js";
export function tablesInitialize(data) {
  // Effectiveness
  let td = document.querySelector("#effectiveness_table_oee td");
  td.innerText = (data.OEEYTD * 100).toFixed(1) + " %";
  td.nextElementSibling.innerText = (data.OEEThisMonth * 100).toFixed(1) + " %";
  // console.log(data.OEEThisMonth);
  td.nextElementSibling.nextElementSibling.innerText = (data.OEELastMonth * 100).toFixed(1) + " %";
  td = document.querySelector("#effectiveness_table_ooe td");
  td.innerText = (data.OEEYTD * 100).toFixed(1) + " %";
  td.nextElementSibling.innerText = (data.OOEThisMonth * 100).toFixed(1) + " %";
  td.nextElementSibling.nextElementSibling.innerText = (data.OOELastMonth * 100).toFixed(1) + " %";
  // revenue_Cost
  td = document.querySelector("#cost_revenue_table_revenue td");
  td.innerText = numberFormat(data.revenueYTD, 2, " €");
  td.title = numberFormat(data.revenueYTD, 2, " €", true) + "\nClick for details";
  td.nextElementSibling.innerText = numberFormat(data.revenueThisMonth, 2, " €");
  td.nextElementSibling.title = numberFormat(data.revenueThisMonth, 2, " €", true) + "\nClick for details";
  td.nextElementSibling.nextElementSibling.innerText = numberFormat(data.revenueLastMonth, 2, " €");
  td.nextElementSibling.nextElementSibling.title = numberFormat(data.revenueLastMonth, 2, " €", true) + "\nClick for details";
  //Cost
  td = document.querySelector("#cost_revenue_table_cost td");
  td.innerText = numberFormat(data.costYTD, 2, " €");
  td.title = numberFormat(data.costYTD, 2, " €", true) + "\nClick for details";
  td.nextElementSibling.innerText = numberFormat(data.costThisMonth, 2, " €");
  td.nextElementSibling.title = numberFormat(data.costThisMonth, 2, " €", true) + "\nClick for details";
  td.nextElementSibling.nextElementSibling.innerText = numberFormat(data.costLastMonth, 2, " €");
  td.nextElementSibling.nextElementSibling.title = numberFormat(data.costLastMonth, 2, " €", true) + "\nClick for details";

  // production
  td = document.querySelector("#production_table_productiontime td");
  td.innerText = numberFormat(data.ProductionTimeYTD, 2, " hr");
  td.title = numberFormat(data.ProductionTimeYTD, 2, " hours", true) + "\nClick for details";
  td.nextElementSibling.innerText = numberFormat(data.ProductionTimeThisMonth, 2, " hr");
  td.nextElementSibling.title = numberFormat(data.ProductionTimeThisMonth, 2, " hours", true) + "\nClick for details";
  td.nextElementSibling.nextElementSibling.innerText = numberFormat(data.ProductionTimeLastMonth, 2, " hr");
  td.nextElementSibling.nextElementSibling.title = numberFormat(data.ProductionTimeLastMonth, 2, " hours", true) + "\nClick for details";
  td = document.querySelector("#production_table_operatingtime td");
  td.innerText = numberFormat(data.OperatingTimeYTD, 2, " hr");
  td.title = numberFormat(data.OperatingTimeYTD, 2, " hours", true) + "\nClick for details";
  td.nextElementSibling.innerText = numberFormat(data.OperatingTimeThisMonth, 2, " hr");
  td.nextElementSibling.title = numberFormat(data.OperatingTimeThisMonth, 2, " hours", true) + "\nClick for details"
  td.nextElementSibling.nextElementSibling.innerText = numberFormat(data.OperatingTimeLastMonth, 2, " hr");
  td.nextElementSibling.nextElementSibling.title = numberFormat(data.OperatingTimeLastMonth, 2, " hours", true) + "\nClick for details";
  td = document.querySelector("#production_table_downtime td");
  td.innerText = numberFormat(data.DowntimeYTD, 2, " hr");
  td.title = numberFormat(data.DowntimeYTD, 2, " hours", true) + "\nClick for details";
  td.nextElementSibling.innerText = numberFormat(data.DowntimeThisMonth, 2, " hr");
  td.nextElementSibling.title = numberFormat(data.DowntimeThisMonth, 2, "hours", true) + "\nClick for details"
  td.nextElementSibling.nextElementSibling.innerText = numberFormat(data.DowntimeLastMonth, 2, " hr");
  td.nextElementSibling.nextElementSibling.title = numberFormat(data.DowntimeLastMonth, 2, " hours", true) + "\nClick for details";

  // Performance
  td = document.querySelector("#performance_table_productionVolume td");
  td.innerText = numberFormat(data.productionVolumeYTD, 2, "");
  td.title = numberFormat(data.productionVolumeYTD, 2, "", true) + "\nClick for details";
  td.nextElementSibling.innerText = numberFormat(data.productionVolumeThisMonth, 2, "");
  td.nextElementSibling.title = numberFormat(data.productionVolumeThisMonth, 2, "", true) + "\nClick for details";
  td.nextElementSibling.nextElementSibling.innerText = numberFormat(data.productionVolumeLastMonth, 2, "");
  td.nextElementSibling.nextElementSibling.title = numberFormat(data.productionVolumeLastMonth, 2, "", true) + "\nClick for details";
  td = document.querySelector("#performance_table_quality td");
  td.innerText = (data.qualityYTD * 100).toFixed(1) + " %";
  td.nextElementSibling.innerText = (data.qualityThisMonth * 100).toFixed(1) + " %";
  td.nextElementSibling.nextElementSibling.innerText = (data.qualityLastMonth * 100).toFixed(1) + " %";
  td = document.querySelector("#performance_table_performance td");
  td.innerText = (data.performanceYTD * 100).toFixed(1) + " %";
  td.nextElementSibling.innerText = (data.performanceThisMonth * 100).toFixed(1) + " %";
  td.nextElementSibling.nextElementSibling.innerText = (data.performanceLastMonth * 100).toFixed(1) + " %";
  // td = document.querySelector("#performance_table_productionVolume td");
  // td.innerText = (data.productionVolumeYTD).toLocaleString('en-US');
  // td.nextElementSibling.innerText = (data.productionVolumeThisMonth).toLocaleString('en-US');
  // td.nextElementSibling.nextElementSibling.innerText = (data.productionVolumeLastMonth).toLocaleString('en-US');
  // td = document.querySelector("#performance_table_quality td");
  // td.innerText = (data.qualityYTD * 100).toFixed(1) + " %";
  // td.nextElementSibling.innerText = (data.qualityThisMonth * 100).toFixed(1) + " %";
  // td.nextElementSibling.nextElementSibling.innerText = (data.qualityLastMonth * 100).toFixed(1) + " %";
  // td = document.querySelector("#performance_table_performance td");
  // td.innerText = (data.performanceYTD * 100).toFixed(1) + " %";
  // td.nextElementSibling.innerText = (data.performanceThisMonth * 100).toFixed(1) + " %";
  // td.nextElementSibling.nextElementSibling.innerText = (data.performanceLastMonth * 100).toFixed(1) + " %";
}


