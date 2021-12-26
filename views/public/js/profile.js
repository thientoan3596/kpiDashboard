document.querySelector('#btn-change-username').addEventListener('click', e => {
    e.preventDefault();
    e.target.style = "display:none;"
    document.querySelector('#form-username-change').style = "display:block;";
    document.querySelector("#btn-change-password").disabled = true;
});
document.querySelector('#btn-cancel-username').addEventListener("click", e => {
    e.preventDefault();
    // console.log(e.target.parentNode.parentNode.parentNode.parentNode);
    e.target.parentNode.parentNode.parentNode.style = "display:none";
    document.querySelector("#btn-change-password").disabled = false;
    document.querySelector('#btn-change-username').style = "display:true;"
})

document.querySelector('#btn-change-password').addEventListener('click', e => {
    document.querySelector('#form-password-change').style = "display:block;";
    e.target.style = "display:none;"
    document.querySelector('#btn-change-username').style = "display:none;";

})
document.querySelector('#btn-cancel-password').addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('#form-password-change').style = "display:none;"
    document.querySelector('#btn-change-password').style = "display:inline-block;"
    document.querySelector('#btn-change-username').style = "display:block;";
});