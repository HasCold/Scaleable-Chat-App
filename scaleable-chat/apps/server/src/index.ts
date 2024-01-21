import http from "http";
import SocketService from './services/socket';
import { startMessageConsumer } from "./services/kafka";

async function init(){
    startMessageConsumer();  // kafka consumer function is envoke
    const socketService = new SocketService(); 

    const httpServer = http.createServer();
    const PORT = process.env.PORT ? process.env.PORT : 5000;

    socketService.io.attach(httpServer);
    socketService.initListener();

    httpServer.listen(PORT, () => {
        console.log(`HTTP Server started at PORT: ${PORT}`)
    }); 

}

init();