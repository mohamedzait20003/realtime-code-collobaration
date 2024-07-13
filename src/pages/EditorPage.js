import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast';

import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import { ACTIONS } from '../Actions';

function EditorPage() {
  const [clients, setClients] = useState([]);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    // cleanup
    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, [navigate, roomId, Location]);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const downloadCode = () => {
    const textToWrite = editorRef.current.getValue();
    const textToWriteBlob = new Blob([textToWrite], { type: "text/plain" });
    const fileNameToSaveAs = "my_script.js";

    const downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = window.URL.createObjectURL(textToWriteBlob);
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
  };

  const destroyClickedElement = (event) => {
    document.body.removeChild(event.target);
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`roomID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("unable to copy the room Id");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  return (
    <div className='container h-screen w-screen'>
      <div className='flex h-full w-full'>
        <div className='sm:w-1/3 lg:w-1/5 h-full flex flex-col bg-neutral-700 text-neutral-50 shadow-md'>
          <div className='w-full'>
            <div className='flex items-center justify-center mb-5 mt-3'>
              <img className='w-10 h-11 mx-2 block max-w-[100px]' src='/images/Logo.svg' alt='Logo'/>
              <h1 className='text-neutral-50 mx-1 text-xl font-bold'>ZCODE Rooms</h1>
            </div>
            <hr className='mt-[3px]'/>
            <div className='flex flex-col mt-3 w-full items-center justify-center'>
              <p className='text-neutral-50 text-lg font-semibold border-b-2'>Connected Users</p>
              <div className='mt-5 sm:flex sm:flex-col lg:grid lg:grid-cols-2 lg:gap-x-16 overflow-y-auto max-h-[500px]'>
              {clients.map((client) => (
                <Client
                  key={client.socketId} 
                  username={client.username} />
                ))}
              </div>
            </div>
          </div>
          <div className=' mt-auto'>
            <hr className='mb-3 border-white'/>
            <div className='flex flex-col items-center justify-center mb-4 w-full'>
              <button className='mt-3 w-[80%] bg-blue-500'onClick={downloadCode}>Download Code</button>
              <button className='mt-3 w-[80%] bg-green-500' onClick={copyRoomId}>Copy Room Id</button>
              <button className='mt-3 w-[80%] bg-red-500' onClick={leaveRoom}>Leave Room</button>
            </div>
          </div>
        </div>
        <div className='sm:w-2/3 lg:w-4/5 h-full'>
          <Editor socketRef={socketRef} roomId={roomId} editRef={editorRef}
            onCodeChange={(code) => {
              codeRef.current = code;}} />
        </div>
      </div>
    </div>
  )
}

export default EditorPage