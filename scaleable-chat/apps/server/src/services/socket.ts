import { Redis } from "ioredis";
import { Server } from "socket.io";

const pub = new Redis({  // Publisher
    host: "redis-28439b0c-ha03330224926-cf45.a.aivencloud.com",
    port: 10462,
    username: "default",
    password: "AVNS_Hs7-sfSNeKawCkOP5DD"
});

const sub = new Redis({   // Subscriber
    host: "redis-28439b0c-ha03330224926-cf45.a.aivencloud.com",
    port: 10462,
    username: "default",
    password: "AVNS_Hs7-sfSNeKawCkOP5DD"
});

class SocketService{
    private _io: Server;
    constructor(){
        console.log("Init Socket Server ...");
        this._io = new Server({
            cors: {
                allowedHeaders: ["*"],   // Access Allow from everything
                origin: "*"
            }
        });

        sub.subscribe("MESSAGES");
    }

    public initListener(){
        const io = this.io;
        console.log("Init Socket Listeners...");
        io.on("connection", (socket) => {   // Listen the event from client side
            console.log("New socket connected :- ", socket.id);   // Each socket has its unique id

            socket.on("event:message", async ({message}: {message: string}) => {
                console.log("New message recieved: ", message);

                // Publish this message to Redis
                await pub.publish("MESSAGES", JSON.stringify({message})); 
            });

            socket.on("disconnect", () => {
                console.log(`${socket.id} is disconnected`);
            })
        });

        sub.on("message", (channel, message) => {
            if(channel === "MESSAGES"){
                console.log("New message from Redis :", message);  // If you want to run another server and test whther the message will recieve on both server you can run this command into new terminal :- export PORT=8000 && npm start

                io.emit("message", message);
            }
        })
    }

    get io(){
        return this._io;
    }
}

export default SocketService;