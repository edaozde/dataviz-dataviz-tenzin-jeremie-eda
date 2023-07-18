//gestion du bouton 

const boutonGet = document.querySelector(".btn-get")

boutonGet.addEventListener("click", async function() {
const countrycode = "FR"
const reponse = await fetch("http://de1.api.radio-browser.info/json/stations/bycountrycodeexact/" + countrycode);
const radioFR = await reponse.json()
console.log(radioFR)
});
