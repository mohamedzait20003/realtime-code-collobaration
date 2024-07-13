import React, { useState, useEffect, useRef, useCallback } from 'react'
import { v4 as uuid } from 'uuid'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  const navigate = useNavigate();

  const firstInputRef = useRef(null);
  const secondInputRef = useRef(null);

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };
  
  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is requried");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("room is created");
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  const handleKeys = useCallback((e) => {
    if(e.key === 'Shift') {
      generateRoomId(e);
    }
    else if(e.key === 'ArrowUp' || e.key === 'ArrowDown')
    {
      if(document.activeElement === secondInputRef.current) {
        firstInputRef.current.focus();
      }
      else if(document.activeElement === firstInputRef.current) {
        secondInputRef.current.focus();
      }
    }
  }, [firstInputRef, secondInputRef]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeys);
    return () => {
      window.removeEventListener('keydown', handleKeys);
    }
  }, [handleKeys]);

  return (
    <div className='bg-[#1e1934] h-[100vh] flex items-center justify-center'>
      <div className='bg-[#282a36] p-5 rounded-xl w-[400px] max-w-[90%]'>
          <div className='flex flex-row items-center justify-center'>
            <img className='w-14 max-w-[150px]' src='/images/Logo.svg' alt='Logo' />
            <h1 className='text-3xl text-neutral-50 ml-5'>ZCODE Rooms</h1>
          </div>
          <div className='flex flex-col mt-5'>
            <input type='text' ref={firstInputRef}
              className='w-[100%] p-3 rounded-md outline-none border-none mb-4 bg-slate-100 placeholder-blue-700 font-bold text-blue-400 text-base cursor-text'
              placeholder=' Room ID '
              onChange={(e) => setRoomId(e.target.value)}
              value={roomId}
              onKeyUp={handleInputEnter}/>
            <input type='text' ref={secondInputRef}
              className='w-[100%] p-3 rounded-md outline-none border-none mb-4 bg-slate-100 placeholder-blue-700 font-bold text-blue-400 text-base cursor-text'
              placeholder=' UserName '
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              onKeyUp={handleInputEnter}/>
            <div>
              <button className='w-40 mr-[11%] bg-green-700 hover:bg-blue-400 border-none p-3 rounded-md text-base text-neutral-50 font-semibold cursor-pointer transition-all duration-300 ease-in-out'
              onClick={generateRoomId}>New Room</button>
              <button className='w-40 bg-gradient-to-r from-purple-400 to-rose-700 hover:from-blue-500 hover:to-blue-700 border-none p-3 rounded-md text-base text-neutral-50 font-semibold cursor-pointer transition-all duration-300 ease-in-out'
              onClick={joinRoom}>Join</button>
            </div>
          </div>
      </div>
    </div>
  )
}

export default Home