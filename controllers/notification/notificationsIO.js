const get = require('../../manufacturing/getData');
const moment = require('moment');
const { eventObj: downtimeEvent } = require('../../manufacturing/simulators/downtime'); //sytemOnline systemOffline  +time) statusChange
const { eventObj: productionEvent } = require('../../manufacturing/simulators/production'); // eventObj.emit('dailyUpdated', dailyRecord);  eventObj.emit('24HoursUpdated', newRecord); eventObj.emit('monthlyUpdated', monthlyRecord);
const { eventObj: priceEvent } = require('../../manufacturing/simulators/price'); //eventObj.emit('newPrice', newPriceList);
// const UserSchema = require('../../models/Schema/Users');
const mongoose = require('mongoose');
const Notification = mongoose.model("Notification", require('../../models/Schema/Notification'));

module.exports = function (io) {
    io.sockets.on('connection', (Socket) => {
        if (Socket.request.user) {
            Socket.join('users_broadcast');
            User.findOne(Socket.request.user).select("notifications").populate({ path: 'notifications.notificationID', model: Notification, strictPopulate: false, select: { "_id": 0, "__v": 0 }, populate: { path: 'by', model: User, strictPopulate: false, select: { "username": 1, "_id": 0 } } }).select("-_id")
                .then((r) => {
                    Socket.emit('notifications', { notifications: r });
                }).catch((err) => {
                    console.log(err);
                });
        } else {
            Socket.join('guest_broadcast');
        }
        console.log(Socket.id, ' Connected.');
        Socket.on('disconnect', () => {
            if (Socket.request.user) {
                Socket.leave('users_broadcast');
            } else {
                Socket.leave('guest_broadcast');
            }
        });
        Socket.on('readNotification', data => {
            if (Socket.request.user) {
                User.updateOne({ _id: Socket.request.user._id, "notifications._id": data.id }, {
                    $set: {
                        "notifications.$.isRead": true,
                    }
                }).then((result) => {
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
        Socket.on('readAllNotifications', () => {
            if (Socket.request.user) {
                User.updateOne(Socket.request.user, {
                    $set: {
                        "notifications.$[].isRead": true,
                    }
                }).then((result) => {
                }).catch((err) => {
                    console.log(err);
                });
            }
        });
    })
    downtimeEvent.on('statusChange', () => {
        io.to('guest_broadcast').emit('statusChange', get.systemStatus());
    });
    downtimeEvent.on('systemOnline', time => {
        const systemStatus = get.systemStatus();
        io.to('guest_broadcast').emit('systemOnline', { systemStatus, time });
        io.in("users_broadcast").fetchSockets()
            .then((sockets) => {
                for (const socket of sockets) {
                    User.findOne({ _id: socket.request.user._id }, { "notifications": { $slice: -1 } }).populate({ path: 'notifications.notificationID', model: Notification, strictPopulate: false, select: { "_id": 0, "__v": 0 }, populate: { path: 'by', model: User, strictPopulate: false, select: { "username": 1, "_id": 0 } } }).select("-_id")
                        .then((r) => {
                            socket.emit('systemOnline', { systemStatus, notification: r["notifications"][0] });
                        }).catch((err) => {
                            console.log(err);
                        });
                }
            }).catch((err) => {
                console.log(err);
            });
    });
    downtimeEvent.on('systemOffline', time => {
        const systemStatus = get.systemStatus()
        io.to('guest_broadcast').emit('systemOffline', { systemStatus, time });
        io.in("users_broadcast").fetchSockets()
            .then((sockets) => {
                for (const socket of sockets) {

                    User.findOne({ _id: socket.request.user._id },
                        { "notifications": { $slice: -1 } })
                        .populate({
                            path: 'notifications.notificationID',
                            model: Notification,
                            strictPopulate: false,
                            select: {
                                "_id": 0,
                                "__v": 0
                            },
                            populate:
                            {
                                path: 'by',
                                model: User,
                                strictPopulate: false,
                                select:
                                {
                                    "username": 1,
                                    "_id": 0
                                }
                            }
                        }).select("-_id")
                        .then((r) => {
                            socket.emit('systemOffline', { systemStatus, notification: r["notifications"][0] });
                        }).catch((err) => {
                            console.log(err);
                        });
                }
            }).catch((err) => {
                console.log(err);
            });
        // const clients = io.sockets.adapter.rooms.get('users_broadcast').clients;
        // for (const clientId of clients) {
        //     const clientSocket = io.sockets.sockets.get(clientId);
        //     console.log(client.request.user);
        // }
    });


    //#region Authorized user

    //#endregion

};
