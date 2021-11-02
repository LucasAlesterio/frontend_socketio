// import logo from "./logo.svg";
import { io } from "socket.io-client";
import "./App.css";
import { useEffect, useState } from "react";

const socket = io(process.env.REACT_APP_SOCKET_URL || "");
socket.on("connect", () => {
    console.log("connected");
    console.log(socket.id);
});
socket.on("disconnect", () => {
    console.log("disconnected");
});
socket.on("recnnect_attempt", (attemptNumber: any) => {
    console.log(attemptNumber);
});
socket.on("reconnect", (attemptNumber: any) => {
    console.log(attemptNumber);
});
socket.on("reconnect_error", (error: any) => {
    console.log(error);
});
socket.on("reconnect_failed", () => {
    console.log("reconnect_failed");
});
socket.on("error", (error: any) => {
    console.log(error);
});
socket.on("connect_error", () => {
    setTimeout(() => {
        socket.connect();
    }, 1000);
});
function App() {
    const [temp, setTemp] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [textRoom, setTextRoom] = useState("");
    const [servo, setServo] = useState("");
    useEffect(() => {
        function newNotification(message: string, title = "New notification!") {
            if (!("Notification" in window)) {
                alert("Este browser não suporta notificações de Desktop");
            } else if (Notification.permission === "granted") {
                new Notification(title, {
                    body: message,
                }).onclick = () => {
                    window.focus();
                };
            } else {
                Notification.requestPermission();
            }
        }

        socket.on("rele", (message: any) => {
            console.log(message);
            if (message.status) {
                newNotification("Rele On", "Rele");
            } else {
                newNotification("Rele Off", "Rele");
            }
        });

        socket.on("led", (message: any) => {
            console.log(message);
            if (message.status) {
                newNotification("Led On", "Led");
            } else {
                newNotification("Led Off", "Led");
            }
        });
        socket.on("temp", (message: any) => {
            console.log(message);
            setTemp(message.temperature);
            setHumidity(message.humidity);
            newNotification(`Temperatura: ${message.temperature}°C`);
        });
    }, []);

    function emitMessage(event: string, body?: any) {
        socket.emit(event, body);
    }

    useEffect(() => {
        Notification.requestPermission();
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                {/* <img src={logo} className="App-logo" alt="logo" /> */}
                <span>
                    <p>
                        Temperatura: <b>{temp || "-"}ºC</b>
                    </p>
                    <p>
                        Umidade: <b>{humidity || "-"}%</b>
                    </p>
                </span>
                <input
                    value={textRoom}
                    onChange={({ target }) => setTextRoom(target.value)}
                />
                <button onClick={() => emitMessage("create", textRoom)}>
                    Create room
                </button>
                <input
                    value={servo}
                    type="number"
                    onChange={({ target }) => setServo(target.value)}
                />
                <button onClick={() => emitMessage("servo", { angle: servo })}>
                    Move servo
                </button>
                <div>
                    <button
                        onClick={() => emitMessage("led", { status: true })}
                    >
                        Led On
                    </button>
                    <button
                        onClick={() => emitMessage("led", { status: false })}
                    >
                        Led Off
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => emitMessage("rele", { status: true })}
                    >
                        Rele On
                    </button>
                    <button
                        onClick={() => emitMessage("rele", { status: false })}
                    >
                        Rele Off
                    </button>
                </div>
                <div>
                    <button onClick={() => emitMessage("tempRequest")}>
                        Refresh temp
                    </button>
                </div>
            </header>
        </div>
    );
}

export default App;
