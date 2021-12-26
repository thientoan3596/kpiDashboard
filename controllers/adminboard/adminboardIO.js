
const { turnOffSystem, turnOnSystem } = require('../../manufacturing/simulators/downtime');
const { getLatestPriceList, insertPriceList } = require('../../manufacturing/simulators/price');
module.exports = function (io) {
    io.sockets.on('connection', (Socket) => {
        if (Socket.request.user) {
            Socket.on('turnOnSystem', reason => {
                turnOnSystem(Socket.request.user._id, reason)
                    .then((result) => {
                    }).catch((err) => {
                        console.log(err);
                    });
            });
            Socket.on('turnOffSystem', () => {
                turnOffSystem(Socket.request.user._id)
                    .then((result) => {
                    }).catch((err) => {
                        console.log(err);
                    });
            });
            Socket.on('pricelistDataUpdate', newPriceList => {
                insertPriceList(newPriceList)
                    .then((result) => {
                        Socket.emit('priceListChangedSuccessfully');
                    }).catch((err) => {


                    });
            });
            Socket.on('pricelistData', () => {
                getLatestPriceList()
                    .then((priceList) => {
                        Socket.emit('pricelistData', priceList);

                    }).catch((err) => {

                    });
            })
            Socket.on('pricelistDataUpdate', newPriceList => {
                insertPriceList(newPriceList);
            })
        }
    });
}