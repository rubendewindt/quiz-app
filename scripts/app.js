// Bekijk of de pagina geladen is. Zoja, registreer de service worker.
window.addEventListener("load", function(){
    console.log("Service worker registration started...");

    // Kunnen we met een SW werken in deze browser?
    if("serviceWorker" in this.navigator)
    {
        // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
        this.navigator.serviceWorker.register("scripts/service-worker.js")
        .then((registration) => console.log("Registered: ", registration))
        .catch((error) => console.log("Error: ", error));
    }
    else
        console.log("No service worker supported...");


        //navigeer button 

        document.getElementById('NaarQuizButton').addEventListener('click', function() {
            window.location.href = 'offline.html';
        });
});

