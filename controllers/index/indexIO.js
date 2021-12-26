
const get = require('../../manufacturing/getData');
const moment = require('moment');
const { eventObj: downtimeEvent } = require('../../manufacturing/simulators/downtime'); //sytemOnline systemOffline  +time) statusChange
const { eventObj: productionEvent } = require('../../manufacturing/simulators/production'); // eventObj.emit('dailyUpdated', dailyRecord);  eventObj.emit('24HoursUpdated', newRecord); eventObj.emit('monthlyUpdated', monthlyRecord);
const { eventObj: priceEvent } = require('../../manufacturing/simulators/price'); //eventObj.emit('newPrice', newPriceList);

function dashboardInfo() {
    return new Promise((resolve, reject) => {
        const status = get.systemStatus();
        let data = {
            status,
            revenueThisMonth: 0,
            revenueLastMonth: 0,
            profitThisMonth: 0,
            profitLastMonth: 0,
            downtimeThisMonth: 0,
        }
        const thisMonthStr = moment().format('yyyy-MM-DD');
        const lastMonthStr = moment().subtract(1, 'month').format('yyyy-MM-DD');

        get.monthlyRevenue(thisMonthStr)
            .then(result => {
                let revenueThisMonth = result.totalRevenue;
                let profitThisMonth = result.totalProfit;
                data.revenueThisMonth = revenueThisMonth;
                data.profitThisMonth = profitThisMonth;
                data.costThisMonth = result.totalCost;
                return get.monthlyRevenue(lastMonthStr);
            })
            .then((result) => {
                let revenueLastMonth = result.totalRevenue;
                let profitLastMonth = result.totalProfit;
                data.revenueLastMonth = revenueLastMonth;
                data.profitLastMonth = profitLastMonth;
                data.costLastMonth = result.totalCost;
                return get.monthlyRevenue('YTD');
            })
            .then((r) => {
                let revenueYTD = 0;
                let profitYTD = 0;
                let costYTD = 0;
                r.forEach(i => {
                    revenueYTD += i.totalRevenue;
                    profitYTD += i.totalProfit;
                    costYTD += i.totalCost;
                })
                data.revenueYTD = revenueYTD;
                data.profitYTD = profitYTD;
                data.costYTD = costYTD;
                return get.monthlyDowntime(thisMonthStr);
            })
            .then((result) => {
                data.downtimeThisMonth = result;
                return get.OEE(thisMonthStr);
            })
            .then((result) => {
                data.OEEThisMonth = result;
                return get.OEE(lastMonthStr);
            }).then((result) => {
                data.OEELastMonth = result;
                return get.OEE();
            })
            .then((result) => {
                data.OEEYTD = result;
                return get.OOE(thisMonthStr);
            })
            .then((result) => {
                data.OOEThisMonth = result;
                return get.OOE(lastMonthStr);
            })
            .then((r) => {
                data.OOELastMonth = r;
                return get.OOE();
            })
            .then((r) => {
                data.OOEYTD = r;
                return get.qualityPerformance(thisMonthStr);

            })
            .then((r) => {
                data.productionVolumeThisMonth = r.ProductionVolume;
                data.qualityThisMonth = r.Quality;
                data.performanceThisMonth = r.Performance;
                return get.qualityPerformance(lastMonthStr);
            }).then((r) => {
                data.productionVolumeLastMonth = r.ProductionVolume;
                data.qualityLastMonth = r.Quality;
                data.performanceLastMonth = r.Performance;

                return get.qualityPerformance();
            }).then((r) => {
                data.productionVolumeYTD = r.ProductionVolume;
                data.qualityYTD = r.Quality;
                data.performanceYTD = r.Performance;

                return get._production(thisMonthStr);
            }).then((r) => {
                data.ProductionTimeThisMonth = r.ProductionTime;
                data.OperatingTimeThisMonth = r.OperatingTime;
                data.DowntimeThisMonth = r.Downtime;
                return get._production(lastMonthStr);
            })
            .then((r) => {
                data.ProductionTimeLastMonth = r.ProductionTime;
                data.OperatingTimeLastMonth = r.OperatingTime;
                data.DowntimeLastMonth = r.Downtime;
                return get._production();
            })
            .then((r) => {
                data.ProductionTimeYTD = r.ProductionTime;
                data.OperatingTimeYTD = r.OperatingTime;
                data.DowntimeYTD = r.Downtime;
                resolve(data);
            })
            .catch(err => {
                console.log(err);
                reject();
            })


    })

}

module.exports = function (io) {
    io.sockets.on('connection', (Socket) => {
        console.log(Socket.id, ' Connected.');
        Socket.join('broadcast');
        Socket.on('disconnect', () => {
            Socket.leave('guest_broadcast');
            console.log(Socket.id, ' Disconnected..');
        });
        Socket.on('dashboardInfo', () => {
            dashboardInfo()
                .then(data => {
                    Socket.emit('dashboardInfo', data);
                }).catch(() => {
                    Socket.emit('redirect', '404');
                });
        })

        Socket.on('dailydowntimeData', (chartGroup) => {
            get.dailyDowntime()
                .then(r => {
                    Socket.emit('dailydowntimeData', { data: r, chartFunc: chartGroup });
                }).catch(e => {
                    console.log(e);
                })
        });
        Socket.on('dailyproductionData', () => {
            get.dailyProduction()
                .then(r => {
                    Socket.emit('dailyproductionData', { data: r });
                }).catch(e => {
                    console.log(e);
                })
        });
        Socket.on('monthlyproductionData', (chartGroup) => {
            get.monthlyProduction()
                .then(r => {
                    Socket.emit('monthlyproductionData', { data: r, chartFunc: chartGroup });
                }).catch(e => {
                    console.log(e);
                })
        });
        Socket.on('monthlydowntimeData', () => {
            get.monthlyDowntime()
                .then((result) => {
                    Socket.emit('monthlydowntimeData', { data: result });
                }).catch((err) => {
                    console.log(err);
                });
        });
        //#region OEE
        Socket.on('dailyOEEData', () => {
            get.OEE('daily')
                .then((result) => {
                    Socket.emit('dailyOEEData', { data: result });
                }).catch((err) => {
                    console.log(err);
                });
        });
        Socket.on('monthlyOEEData', () => {
            get.OEE('monthly')
                .then((result) => {
                    Socket.emit('monthlyOEEData', { data: result });
                }).catch((err) => {
                    console.log(err);
                });
        });
        //#endregion
        //#region OOE
        Socket.on('dailyOOEData', () => {
            get.OOE('daily')
                .then((result) => {
                    Socket.emit('dailyOOEData', { data: result });
                }).catch((err) => {
                    console.log(err);
                });
        });
        Socket.on('monthlyOOEData', () => {
            get.OOE('monthly')
                .then((result) => {
                    Socket.emit('monthlyOOEData', { data: result });
                }).catch((err) => {
                    console.log(err);
                });
        });
        //#endregion
        //#region revenue
        Socket.on('dailyrevenueData', () => {
            get.dailyRevenue()
                .then((r) => {
                    Socket.emit('dailyrevenueData', { data: r });

                }).catch((err) => {
                    console.log(err);
                });
        });
        Socket.on('monthlyrevenueData', () => {
            get.monthlyRevenue()
                .then((r) => {
                    Socket.emit('monthlyrevenueData', { data: r });

                }).catch((err) => {
                    console.log(err);
                });
        })
        //#endregion
        Socket.on('hourlyproductionData', () => {
            get._24HoursProduction()
                .then((result) => {
                    Socket.emit('hourlyproductionData', { data: result });
                }).catch((err) => {
                    console.log(err);
                });
        })
    })
    downtimeEvent.on('statusChange', () => {
        io.to('broadcast').emit('statusChange', get.systemStatus());
    });

    productionEvent.on('dailyUpdated', dailyRecord => {
        io.to('broadcast').emit('dailyProductionDataUpdated', { data: dailyRecord });
    });
    productionEvent.on('24HoursUpdated', newRecord => {
        // io.to('broadcast').emit('hourlyproductionData', { data: newRecord });
        get._24HoursProduction()
            .then((result) => {
                io.to('broadcast').emit('hourlyproductionData', { data: result });
            }).catch((err) => {
                console.log(err);
            });
    });
    productionEvent.on('monthlyUpdated', monthlyRecord => {
        io.to('broadcast').emit('monthlyProductionDataUpdated', { data: monthlyRecord });
    });

    //#region Authorized user

    //#endregion

};
