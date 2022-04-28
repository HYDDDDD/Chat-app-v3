import "./css/App.css";
import { io } from "socket.io-client";
import { useState } from "react";
import Chat from "./components/Chat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io.connect("http://localhost:3001", {
  transports: ["websocket", "polling", "flashsocket"],
});

function App() {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const joinRoom = async () => {
    if (handleValidation() === true) {
      const newUser = {
        userName: userName,
        room: room,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("join_room", newUser);
      setShowChat(true);
    }
  };

  const handleValidation = () => {
    if (userName === "" && room === "") {
      toast.error("Please enter your name and room id.", toastOptions);
      return false;
    }

    if (userName === "") {
      toast.error("Please enter your name.", toastOptions);
      return false;
    } else if (room === "") {
      toast.error("Please enter room id.", toastOptions);
      return false;
    }

    if (userName.length > 6) {
      toast.error("Please enter your name less than 6 characters.", toastOptions);
      return false;
    }

    return true;
  };

  return (
    <div>
      {!showChat ? (
        <>
          <div className="flex flex-col items-center justify-center min-h-screen space-y-8 bg-orange-50">
            <h1 className="text-6xl">Join A Chat</h1>
            <input
              type="text"
              placeholder="User Name"
              className="bg-transparent appearance-none border-2 border-gray-200 rounded py-2 px-4 text-black leading-tight focus:outline-none  focus:border-blue-700"
              onChange={(event) => {
                setUserName(event.target.value);
              }}
            />
            <input
              type="text"
              placeholder="Room ID"
              className="bg-transparent appearance-none border-2 border-gray-200 rounded py-2 px-4 text-black leading-tight focus:outline-none  focus:border-blue-700"
              onChange={(event) => {
                setRoom(event.target.value);
              }}
              onKeyPress={(event) => {
                event.key === "Enter" && joinRoom();
              }}
            />
            <button
              className="bg-amber-500 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={joinRoom}
            >
              Join A Room
            </button>
          </div>
          <ToastContainer />
        </>
      ) : (
        <Chat socket={socket} userName={userName} room={room} />
      )}
    </div>
  );
}

export default App;
