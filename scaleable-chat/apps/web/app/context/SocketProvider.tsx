"use client";

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {io, Socket} from "socket.io-client";

interface SocketProviderProps {
    children: React.ReactNode
}

interface ISocketContext {
    sendMessage: (msg: string) => void;
    messages: string[];
}

const SocketContext = createContext<ISocketContext | null>(null);

const SocketProvider: React.FC<SocketProviderProps> = ({children}) => {

    const [socket, setSocket] = useState<Socket>()
    const [messages, setMessages] = useState<string[]>([]);

    const sendMessage: ISocketContext["sendMessage"] = useCallback((msg) => {
        console.log("Send Message :-", msg);
        if(socket){
            socket.emit("event:message", {message: msg});
        }
    }, [socket]);

    const onMessageRec = useCallback((msg: string) => {
        console.log("From Server Message Recieved :", msg);

        const {message} = JSON.parse(msg) as {message: string}
        setMessages((prev) => [...prev, message]);
    }, [])

    useEffect(() => {
        const _socket = io("http://localhost:5000");   // This socket is connected with our backend port so they can listen or emit any events very easily 
        _socket.on("message", onMessageRec)
        setSocket(_socket);

        return () => {   // This is cleanup function when the components unmounts or user reconnect so it will go through 
            _socket.disconnect();
            _socket.off("message", onMessageRec); // we have to off this message for this particular event
            setSocket(undefined);
        }
    }, [])

    return(
        <SocketContext.Provider value={{sendMessage, messages}}>
        {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider

export const useSocket = () => {
    const state = useContext(SocketContext);
    if(!state) throw new Error("state is undefined");

    return state;
}