import { sendMsg } from "./util.js"
let socket = io();

document.querySelector('#btn-update-price-list-modal-open').addEventListener('click', e => {
    socket.emit('pricelistData');
})
document.querySelector('#btn-turn-on-system').addEventListener('click', e => {
    socket.emit('turnOnSystem', document.querySelector("input[name=reason]:checked").value);
    [...document.querySelectorAll("input[name=reason]:checked")].forEach(i => i.checked = false);
    setTimeout(() => e.target.disabled = true, 0);
});
Array.from(document.querySelectorAll("input[name=reason]")).forEach(elmnt => elmnt.addEventListener('change', e => {
    document.querySelector('#btn-turn-on-system').disabled = false;
}));
document.querySelector('#btn-turn-off-system').addEventListener('click', () => { socket.emit('turnOffSystem'); });
socket.on('pricelistData', data => {
    console.log(data);
    document.querySelector('#material').placeholder = data.material;
    document.querySelector('#paint').placeholder = data.paint;
    document.querySelector('#box').placeholder = data.box;
    document.querySelector('#toolReplace').placeholder = data.toolReplace;
    document.querySelector('#labour').placeholder = data.labour;
    document.querySelector("#timeSync").innerText = Date(Date.now());
});
function checkPriceListValid() {
    let val1 = document.querySelector('#material').value;
    let val2 = document.querySelector('#paint').value;
    let val3 = document.querySelector('#box').value;
    let val4 = document.querySelector('#toolReplace').value;
    let val5 = document.querySelector('#labour').value;
    if (val1 !== '' || val2 !== '' || val3 !== '' || val4 !== '' || val5 !== '') {
        document.querySelector("#btn-update-price-list").disabled = false;
    }
    if (val1 === '' && val2 === '' && val3 === '' && val4 === '' && val5 === '')
        document.querySelector("#btn-update-price-list").disabled = true;
}

[...document.querySelectorAll("input[name=priceList]")].forEach(elm => {
    elm.addEventListener('input', e => checkPriceListValid());
});
document.querySelector("#btn-update-price-list").addEventListener('click', (e) => {
    socket.emit("pricelistDataUpdate",
        {
            date: moment().format('yyyy-MM-DD'),
            material: document.querySelector('#material').value,
            paint: document.querySelector('#paint').value,
            box: document.querySelector('#box').value,
            toolReplace: document.querySelector('#toolReplace').value,
            labour: document.querySelector('#labour').value,
        }
    )

});
socket.on("priceListChangedSuccessfully", () => {
    sendMsg("Price has been updated successfully!");
});