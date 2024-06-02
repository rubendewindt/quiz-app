var writableStream = null;

document.addEventListener('DOMContentLoaded', () => {
    if ('serial' in navigator) {
        console.log("Serial is available.");
    } else {
        console.log('Serial is not available.');
    }

    document.querySelector("#btnRequestComPort").addEventListener('click', () => {
        navigator.serial.requestPort()
        .then(port => {
            port.addEventListener("disconnect", () => {
                console.log("COM-port disconnected.");
            });

            console.log("COM-port selected.");

            port.open({
                baudRate: 9600,
                dataBits: 8,
                stopBits: 1,
                parity: "none"
            })
            .then(() => {
                console.log("COM-port opened.");
                writableStream = port.writable.getWriter();
                writableStream.write(new Uint8Array([0]));
            })
            .catch(error => console.log(error));
        })
        .catch(error => console.log(error));
    });
});

function sendScoreToSerial(score) {
    if (writableStream != null) {
        const binaryValue = score & 0xFF;  // Ensure score fits in one byte
        writableStream.write(new Uint8Array([binaryValue]));
        console.log(`Data sent: ${binaryValue}`);  // Log the data being sent
    } else {
        console.log("Writable stream not available.");
    }
}


