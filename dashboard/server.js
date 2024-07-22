const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust as necessary
        methods: ["GET", "POST"]
    }
})

const javaBoiler = "import java.util.concurrent.TimeUnit;\n\nclass Main {\n\tpublic static void main(String[] args){\n\t\tSystem.out.println(\"The bomb is ticking...\");\n\t\tfor(int i = 10; i > -1; i++){\n\t\t\tTimeUnit.SECONDS.sleep(1);\n\t\t\tSystem.out.println(i);\n\t\t}\n\t\tSystem.out.println(\"BOOM\");\n\t}\n}"


const keys = [];
const docs = [];
const docUpdates = [];
const userInfo = [];

app.use(express.static(path.join(__dirname, 'build')));


app.get("*", (req, res) =>{
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
//id, type, fromChar, toChar

io.on('connection', (socket) =>{
    console.log("A user connected")
    socket.on('create', (msg) =>{
        if(!keys.includes(msg.id)){       
            docs.push(javaBoiler);
            keys.push(msg.id);
            docUpdates.push([]);
        }
        userInfo.push([msg.username, 0]);
        io.emit(msg.id, {value: docs[keys.indexOf(msg.id)], creation: true})
    });

    socket.on('delete', (msg) =>{
        const index = keys.indexOf(msg.id);
        if(index !== -1){
            keys.splice(index);
            docs.splice(index);
        }
    });

    socket.on('add', (msg) =>{

        let dex = keys.indexOf(msg.id);
        let doc = docs[dex];

        //Gets an array storing updates to a given document
        let docUpdate = docUpdates[dex];

        let text = msg.text;


        if(text.includes("\n")){
            if(text === "\n" && doc.substring(msg.atChar-1, msg.atChar) === "{" && doc.substring(msg.atChar, msg.atChar+1) === "}"){
                text = "\n\t\n";
            }

            let temp = doc.substring(0, msg.atChar)
            let unclosedParenthesisCount = 0;
            for(let i = 0; i < temp.length; i++){
                console.log("Searching: " + temp.substring(i, i+1) + ": " + (temp.substring(i, i+1) === '{').toString());
                console.log(!(temp.substring(i-1, i) === "\\"))
                if(temp.substring(i, i+1) === '{' && (i === 0 || !(temp.substring(i-1, i) === "\\"))){
                    unclosedParenthesisCount++;
                }else if(temp.substring(i, i+1) === '}' && (i === 0 || (!temp.substring(i-1, i) === "\\"))){
                    unclosedParenthesisCount--;
                }
            }
            console.log("Parenthecount" + unclosedParenthesisCount);
            if(unclosedParenthesisCount > 0){
                for(let i = 0; i < text.length; i++){
                    console.log("I is looping");
                    if(i === 0 || text[i] === "\n"){
                        for(let j = 0; j < unclosedParenthesisCount; j++){
                            console.log("J is looping");
                            text = text.substring(0, i) + "\t" + text.substring(i, text.length);
                        }
                    }
                }
            }

        }


        
 
        try{
            doc = doc.substring(0, msg.atChar) +  text + doc.substring(msg.atChar);
            docUpdate.unshift(['add', msg.atChar, text]);
        }catch(error){}

        docs[dex] = doc;
        let offset1 = 0;
        if(text === "\"\"" || text === "\{\}" || text === "\(\)" || text === "\[\]" || text === "\'\'"){
            offset1 = 1;
        }

        console.log("Returning the document: " + doc)
        io.emit(msg.id, {value: docs[dex], username: msg.username, cursorLocation: (msg.atChar+text.length-offset1)})
    });
    socket.on('remove', (msg) =>{
        console.log('ID: ' + msg.id);
        console.log('From Character: ' + msg.fromChar);
        console.log('To Character: ' + msg.toChar);
        let dex = keys.indexOf(msg.id);
        let doc = docs[dex];
        //Gets an array storing updates to a given document
        let docUpdate = docUpdates[dex];
        docUpdate.unshift(['remove', msg.username, msg.fromChar, msg.toChar]);
        try{
            doc = doc.substring(0, msg.fromChar) + doc.substring(msg.toChar);
        }catch(error){

        }
        docs[dex] = doc;

        io.emit(msg.id, {value: docs[dex]})
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log("Listening on 3k and 1");
});