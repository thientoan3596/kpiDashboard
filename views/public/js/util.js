export function parsingDefaultConfig(config, defaultConfig) {
    if (config !== defaultConfig) {
        for (let [key, val] of Object.entries(defaultConfig)) {
            if (!(key in config)) {
                config[key] = val;
            }
        }
    }
}
export function numberFormat(val, maxFraction, suffix = '', prevent = false) {
    if (prevent) {
        return (val).toLocaleString('en-US', { maximumFractionDigits: maxFraction }) + ` ${suffix}`;
    }
    if (val > 1000) {
        if (val > 1000000) {
            return (val / 1000000).toLocaleString('en-US', { maximumFractionDigits: maxFraction }) + `M ${suffix}`;
        } else {
            return (val / 1000).toLocaleString('en-US', { maximumFractionDigits: maxFraction }) + `K ${suffix}`;
        }
    } else {
        return (val).toLocaleString('en-US', { maximumFractionDigits: maxFraction }) + ` ${suffix}`;
    }
}
export function sendMsg(msg, msgType = 'info') {
    let cus_msg = document.createElement('div');
    document.querySelector('#content-wrapper').append(cus_msg);
    cus_msg.classList.add('custom-msg', 'alert', `alert-${msgType}`);
    cus_msg.innerHTML = `
    
        <span class="fas fa-exclamation-circle custom-msg-icon"></span>
        <span class="msg">${msg}</span>
    
    `
    cus_msg.classList.add("custom-msg", "show-animation", "showAlert");
    setTimeout(() => {
        cus_msg.classList.add('hide-animation');
        cus_msg.classList.remove('show-animation');
        setTimeout(() => cus_msg.remove(), 1000);
    }, 4000);

}
export function notificationUpdate() {
    let NotificationCounter = document.querySelector("#alertCounter");
    let notificationArea = document.querySelector("#notificationArea");
    let unreadNotificationCounter = notificationArea.querySelectorAll('.font-weight-bold').length;
    if (unreadNotificationCounter === 0) {
        NotificationCounter.innerText = "";
    } else if (unreadNotificationCounter <= 9) {
        NotificationCounter.innerText = unreadNotificationCounter;
    } else {
        NotificationCounter.innerText = "9+";
    }
}
export function setNotification(msg, time, isRead, id = '', socket = null) {
    let notificationCard = document.createElement('a');
    notificationCard.href = "#";
    notificationCard.id = id;
    notificationCard.addEventListener('click', e => {
        e.stopPropagation();
        let span = notificationCard.querySelector('span');
        if (span.classList.contains('font-weight-bold')) {
            if (socket) {
                span.classList.remove('font-weight-bold');
                socket.emit('readNotification', { id: notificationCard.id });
            } else {
                span.classList.remove('font-weight-bold');
            }
            notificationUpdate();
        }
    })
    notificationCard.classList.add("dropdown-item", "d-flex", "align-items-center");
    notificationCard.innerHTML = `
    <div>
        <div class="small text-gray-500">${time}</div>
        <span class="${isRead ? '' : 'font-weight-bold'} notification-message">${msg}</span>
    </div>
     `
    const notification = document.querySelector("#notificationArea");
    const header6 = notification.querySelector('h6');
    header6.after(notificationCard);
    if (notification.childNodes.length >= 6) {
        for (let counter = 5; counter < notification.childNodes.length - 1; counter++) {
            if (notification.childNodes[counter].id === "clearNotification") {
                break;
            }
            notification.childNodes[counter].remove();
        }
    }
}