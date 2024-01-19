"use client";

import React, { useState } from 'react'
import classes from  "./page.module.css"
import { useSocket } from './context/SocketProvider';

const page = () => {
  const {sendMessage, messages} = useSocket();
  const [message, setMessage] = useState("");

  return (
    <div>
      <div className={classes["box"]}>
        <input 
        onChange={(e) => setMessage(e.target.value)}
        className={classes["chat-input"]}
        placeholder='Message...' 
        />

        <button 
        onClick={() => sendMessage(message)}
        className={classes["button"]}
        >Send</button>
      </div>

      <div>
        <h1 style={{marginTop: "15px", marginBottom: "15px"}}>All Messages Appeared Here</h1>
        {messages.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </div>
    </div>
  )
}

export default page;