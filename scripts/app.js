window.addEventListener("load", function(){
    if("serviceWorker" in this.navigator)
    {
        this.navigator.serviceWorker.register("service-worker.js")
        .then((registration) => {
            console.log("Registered: ", registration);
        })
        .catch((error) => console.log("Error: ", error));
    }
    else
        console.log("No service worker support in this browser.");
});