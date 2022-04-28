import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { v4 as uuidv4 } from "uuid";
import Picker from "emoji-picker-react";

// font awesome
import {
  faFaceLaughSquint,
  faPaperPlane,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Chat({ socket, userName, room }) {
  const [showPicker, setShowPicker] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showUser, setShowUser] = useState([]);
  const [outputRoomName, setOutputRoomName] = useState("");
  const [showMenuUsers, setShowMenuUsers] = useState(false);

  const onEmojiClick = (event, emojiObject) => {
    setCurrentMessage((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: userName,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.off("roomUsers").on("roomUsers", (data) => {
      setOutputRoomName(data.room);
      setShowUser(data.users);
    });

    socket.off("receive_message").on("receive_message", (msg) => {
      setMessageList((list) => [...list, msg]);
    });

    socket.off("message").on("message", (msgBot) => {
      setMessageList((list) => [...list, msgBot]);
    });
  }, [socket]);

  return (
    <div className="bg-orange-50">
      <h1 className="ml-2">Chat App</h1>
      <div className="flex mt-5 h-screen">
        {!showMenuUsers && (
          <div className="bg-amber-500 float-right w-40 h-screen py-4 px-3 overflow-y-hidden dark:bg-gray-800">
            <h3 className="text-center">Users</h3>
            <p className="text-sm font-semibold text-center">
              Room ID : {outputRoomName}
            </p>
            <ScrollToBottom className="w-full h-full overflow-x-hidden text-center">
              {showUser.map((currentUsers) => {
                return (
                  <div key={uuidv4()}>
                    {/* className="p-3 bg-zinc-100 border-2 border-black mt-2 rounded-md" */}
                    <div >
                      <p className="text-blue-800">{currentUsers.username}</p>
                    </div>
                  </div>
                );
              })}
            </ScrollToBottom>
          </div>
        )}

        <div className="flex flex-col w-full h-screen ">
          <div className="bg-slate-200 w-full mr-auto">
            <button onClick={() => setShowMenuUsers((val) => !val)}>
              <FontAwesomeIcon icon={faBars} className="p-2" />
            </button>
          </div>
          <ScrollToBottom className="w-full h-full overflow-x-hidden">
            {messageList.map((messageContent) => {
              return (
                // 450px max-width: calc(100% - 710px);
                <div
                  className="flex space-x-2 mt-4 pr-3 rounded-xl w-16"
                  id={
                    userName === messageContent.author
                      ? "you"
                      : "robot" === messageContent.id
                      ? "robot"
                      : "other"
                  }
                  key={uuidv4()}
                >
                  <div className="text-sm font-semibold p-1">
                    <p>{messageContent.author}</p>
                  </div>
                  <div className="text-base text-white px-2">
                    <p className="break-all">{messageContent.message}</p>
                    <span className="text-xs">{messageContent.time}</span>
                    <p>{messageContent.text}</p>
                    <span className="text-xs">{messageContent.timebot}</span>
                  </div>
                </div>
              );
            })}
          </ScrollToBottom>
          <div className="w-full bg-green-200 flex bottom-0 mt-1">
            <button
              className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              onClick={() => setShowPicker((val) => !val)}
            >
              <FontAwesomeIcon icon={faFaceLaughSquint} />
            </button>
            <input
              type="text"
              value={currentMessage}
              placeholder="Hey..."
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500 "
              onChange={(event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyPress={(event) => {
                event.key === "Enter" && sendMessage();
              }}
            />
            <button
              className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              onClick={sendMessage}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
          {showPicker && (
            <Picker
              pickerStyle={{ width: "100%", height: "500px" }}
              onEmojiClick={onEmojiClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
