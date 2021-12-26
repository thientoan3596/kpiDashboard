// Logout 

document.querySelector('#btn-logout').addEventListener('click', e => {
    fetch("/users/logout?_method=DELETE", {
        method: "POST",
    }).then(res => {
        if (res.redirected) {
            window.location = res.url;
        }
    });
})