am4core.addLicense("ch-custom-attribution");
export function create(location, max, innerText, reverse = false, requireMinMax = false) {
    let chart = am4core.create(location, am4charts.GaugeChart);
    let axis = chart.xAxes.push(new am4charts.ValueAxis());
    axis.min = 0;
    axis.max = max;
    // axis.strictMinMax = true;
    axis.renderer.grid.template.disabled = true;
    axis.renderer.labels.template.disabled = true;
    chart.innerRadius = am4core.percent(70);
    chart.startAngle = -180;
    chart.endAngle = 0;
    axis.renderer.labels.template.radius = am4core.percent(0);
    axis.renderer.labels.template.fontSize = 20;
    axis.renderer.labels.template.fontWeight = 600;
    if (requireMinMax) {
        var rangeMin = axis.axisRanges.create();
        rangeMin.value = axis.min;
        rangeMin.label.text = "" + axis.min; // converting to string
        var rangeMax = axis.axisRanges.create();
        rangeMax.value = axis.max;
        rangeMax.label.text = "" + axis.max; // converting to string
    }

    // console.log(axis.renderer.labels);
    if (reverse) {
        let temp = parseInt(max * 0.25);
        var range0 = axis.axisRanges.create();
        range0.value = 0;
        range0.endValue = temp;
        range0.axisFill.fillOpacity = 1;
        range0.axisFill.fill = am4core.color('#1cc88a');
        range0.axisFill.zIndex = 0;
        var range1 = axis.axisRanges.create();
        range1.value = temp;
        let temp2 = parseInt(max * 0.5);
        range1.endValue = temp2;
        range1.axisFill.fillOpacity = 1;
        range1.axisFill.fill = am4core.color('#f6c23e');
        range1.axisFill.zIndex = 0;
        var range2 = axis.axisRanges.create();
        range2.value = temp2;
        range2.endValue = max;
        range2.axisFill.fillOpacity = 1;
        range2.axisFill.fill = am4core.color('#e74a3b');
        range2.axisFill.zIndex = 0;
    } else {
        let temp = parseInt(max * 0.5)
        var range0 = axis.axisRanges.create();
        range0.value = 0;
        range0.endValue = temp;
        range0.axisFill.fillOpacity = 1;
        range0.axisFill.fill = am4core.color('#e74a3b');
        range0.axisFill.zIndex = 0;
        var range1 = axis.axisRanges.create();
        range1.value = temp;
        let temp2 = parseInt(max * 0.75);
        range1.endValue = temp2;
        range1.axisFill.fillOpacity = 1;
        range1.axisFill.fill = am4core.color('#f6c23e');
        range1.axisFill.zIndex = 0;
        let range2 = axis.axisRanges.create();
        range2.value = temp2;
        range2.endValue = max;
        range2.axisFill.fillOpacity = 1;
        range2.axisFill.fill = am4core.color('#1cc88a');
        range2.axisFill.zIndex = 0;
    }

    let hand = chart.hands.push(new am4charts.ClockHand());
    hand.value = 0;
    hand.pin.disabled = true;
    hand.fill = am4core.color("#000000");
    hand.stroke = am4core.color("#000000");
    hand.innerRadius = am4core.percent(50);
    hand.radius = am4core.percent(85);
    hand.startWidth = 15;
    var label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = am4core.percent(100);
    label.x = am4core.percent(80);
    label.y = am4core.percent(100);
    label.fontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    label.horizontalCenter = "middle";
    label.verticalCenter = "bottom";
    label.properties.fill = am4core.color('#858796');

    if (innerText == null) {
        innerText = Math.random() * (max);
        label.text = innerText;
        let time1 = Math.random() * (3000 - 1000) + 1000;

        let val = Math.random() * (max);
        let time2 = Math.random() * ((100 - val) * 100 - (100 - val) * 30) + (100 - val) * 30;
        if (requireMinMax) {
            time2 = Math.random() * ((max - val) * 100 - (max - val) * 50) + (max - val) * 50;
        }
        setTimeout(function () { hand.showValue(max, time1, am4core.ease.cubicIn); label.text = max + "%" }, 200);
        setTimeout(function () {
            hand.showValue(val, time2, am4core.ease.elasticOut);

            if (requireMinMax) {
                label.text = (val * 0.8).toFixed(0);
            } else {
                label.text = (val * 0.8).toFixed(1) + "%";
            }
        }, time1 + 250);
    } else {
        label.text = innerText;
        setTimeout(function () { hand.showValue(max, 2500, am4core.ease.cubicIn) }, 200);
        setTimeout(function () {
            hand.showValue(max * 0.8, 4000, am4core.ease.elasticOut);
            if (requireMinMax) {
                label.text = (max * 0.8).toFixed(0);
            } else {
                label.text = (max * 0.8).toFixed(1) + "%";
            }

        }, 2750);
    }


    return { hand, label };
}