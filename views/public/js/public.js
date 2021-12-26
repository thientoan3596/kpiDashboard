import * as util from "./util.js";
let socket = io();
document.querySelector("#clearNotification").addEventListener('click', e => {
    e.preventDefault();
    let exist = false;
    document.querySelectorAll('.notification-message').forEach(i => {
        i.classList.remove('font-weight-bold');
        exist = true;
    });
    if (exist) {
        socket.emit('readAllNotifications');
        util.notificationUpdate();
    }
});
socket.on("systemOnline", r => {
    util.sendMsg('Manufacturing system has been turned on!');
    if (r.notification) {
        util.setNotification(r.notification.notificationID.msg + "<br> by " + r.notification.notificationID.by.username, r.notification.notificationID._time, r.notification.isRead, r.notification._id, socket);
    } else {
        util.setNotification('Manufacturing system has been turned on!', r.time);
    }
    util.notificationUpdate();
});
socket.on("systemOffline", r => {
    util.sendMsg('Manufacturing system has been turned off', 'warning');
    if (r.notification) {
        util.setNotification(r.notification.notificationID.msg + "<br> by " + r.notification.notificationID.by.username, r.notification.notificationID._time, r.notification.isRead, r.notification._id, socket);
    } else {
        util.setNotification('Manufacturing system has been turned off!', r.time);
    }
    util.notificationUpdate();

});

socket.on("notifications", data => {
    data.notifications.notifications.forEach(n => {
        if (n.notificationID.by !== null) {
            util.setNotification(n.notificationID.msg + "<br> by " + n.notificationID.by.username, n.notificationID._time, n.isRead, n._id, socket);
        } else {
            util.setNotification(n.notificationID.msg + "<br> by Admin", n.notificationID._time, n.isRead, n._id, socket);
        }
    });
    util.notificationUpdate();
});