import { Kafka, Producer } from "kafkajs";
import fs from "fs"
import path from "path";
import prismaClient from "./prisma";

const kafka = new Kafka({
    brokers: ["kafka-28466f90-ha03330224926-cf45.a.aivencloud.com:10475"],
    ssl: {
        ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")]
    },
    sasl: {
        username: "avnadmin",
        password: "AVNS_yA7Wkmo66K7hf80vtxL",
        mechanism: "plain"
    }
});

// so we don't want to create Producer at each and every time so we can cache it into a value ; Producer Function
let producer: null | Producer = null;

export async function createProducer(){
    if(producer) return producer;
    
    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return _producer;
}

export async function produceMessage(message: string){
    const producer = await createProducer();
    await producer.send({
        messages: [{key: `message-${Date.now()}`, value: message}],
        topic: "MESSAGES"
    });
    return true;
}

// Consumer Funcion
export async function startMessageConsumer(){
    console.log("Consumer is Running");
    const consumer = kafka.consumer({groupId: "default"});
    await consumer.connect();
    await consumer.subscribe({topic: "MESSAGES", fromBeginning: true});

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({message, pause}) => {
            if(!message.value) return;

            console.log("New Message Recieved ...");
            try {
                await prismaClient.message.create({
                    data:{
                        text: message.value?.toString()   // Converts the value of message.value to a string.
                    }
                })
            } catch (error: any) {
                // We are doing the error-handling in case any problem occur so the consumer will pause and they won't consume any other messages and will auto begin after 1 minute;

                console.log("Something is wrong", error);
                pause();   
                setTimeout(() => {
                    consumer.resume([{topic: "MESSAGES"}])
                }, 60 * 1000);   // 60 * 1000 = 60_000 ms means 1 minute 
            }
        }
    })
}

export default kafka;