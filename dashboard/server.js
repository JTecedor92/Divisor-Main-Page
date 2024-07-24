const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust as necessary
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
})

const javaBoiler = "import java.util.concurrent.TimeUnit;\n\nclass Main {\n\tpublic static void main(String[] args){\n\t\tSystem.out.println(\"The bomb is ticking...\");\n\t\tfor(int i = 10; i > -1; i++){\n\t\t\tTimeUnit.SECONDS.sleep(1);\n\t\t\tSystem.out.println(i);\n\t\t}\n\t\tSystem.out.println(\"BOOM\");\n\t}\n}"


const keys = [];
const docs = [];
const docUpdates = [];
const userInfo = [];

// app.use(express.static(path.join(__dirname, 'build')));


// app.get("*", (req, res) =>{
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });
//id, type, fromChar, toChar

function charToLine(char, value){
    let lineToChar2 = [];
    lineToChar2.push(0);
    for(let i = 0; i < value.length;i++){
        if(value[i] === '\n'){
            lineToChar2.push(i+1);
        }
    }
    let index = 0;
    let distance = char - lineToChar2[0];
    for(let i = 1; i <lineToChar2.length; i++){
        if(char-lineToChar2[i] < distance && char > lineToChar2[i]){
            index = i;
            distance = char - lineToChar2[i];
        }
    }

    return({line: index, char: char-lineToChar2[index]})
}

function lineToChar(line, char, value){
    let lineToChar2 = [];

    lineToChar2.push(0);

    for(let i = 0; i < value.length; i++){
        if(value[i] === '\n'){
            lineToChar2.push(i+1);
        }
    }

    console.log(lineToChar2);

    return lineToChar2[line]+char;
}

io.on('connection', (socket) =>{
    console.log("A user connected")
    socket.on('create', (msg) =>{
        if(!keys.includes(msg.id)){       
            docs.push("hiiiii");
            keys.push(msg.id);
            docUpdates.push([]);
        }
        console.log("Message: " + JSON.stringify(msg));
        userInfo.push([msg.username, 0]);
        console.log("Value:");
        console.log(docs[keys.indexOf(msg.id)]);
        io.emit(msg.id, {value: docs[keys.indexOf(msg.id)], creation: true, cursorLocation: 1})
    });

    socket.on('delete', (msg) =>{
        const index = keys.indexOf(msg.id);
        if(index !== -1){
            keys.splice(index);
            docs.splice(index);
        }
    });

    socket.on('add', (msg) =>{

        console.log(JSON.stringify(msg));

        let dex = keys.indexOf(msg.id);
        let doc = docs[dex];

        //Gets an array storing updates to a given document
        let docUpdate = docUpdates[dex];

        let text = msg.text;
        
        let offset = 0;

        if(text.includes("\n")){
            let flag = false;
            if(text === "\n" && doc.substring(msg.atChar-1, msg.atChar) === "{" && doc.substring(msg.atChar, msg.atChar+1) === "}"){
                text = "\n\n";
                flag = true;
            }
            let temp = doc.substring(0, msg.atChar)
            let unclosedParenthesisCount = 0;
            for(let i = 0; i < temp.length; i++){
                if(temp.substring(i, i+1) === '{' && (i === 0 || !(temp.substring(i-1, i) === "\\"))){
                    unclosedParenthesisCount++;
                }else if(temp.substring(i, i+1) === '}' && (i === 0 || (!temp.substring(i-1, i) === "\\"))){
                    unclosedParenthesisCount--;
                }
            }
            console.log("Parenthecount" + unclosedParenthesisCount);
            offset += unclosedParenthesisCount;
            let temp2 = "";
            if(unclosedParenthesisCount > 0){
                for(let j = 0; j < unclosedParenthesisCount; j++){
                    
                   temp2 += "\t"
                }
                console.log(`${temp2.length} tabs`)
                for(let i = 0; i < text.length; i++){
                    if(i === 0 || text[i] === "\n"){
                        text = text.substring(0, i+1) + temp2 + text.substring(i+1, text.length);
                        i+= temp2.length;
                        
                    }
                }
            }
            if(flag && doc.length > msg.atChar && doc.substring(msg.atChar, msg.atChar+1) === "}"){
                text = text.substring(0, text.length - 1);
            }

        }


        
 
        try{
            doc = doc.substring(0, msg.atChar) +  text + doc.substring(msg.atChar);
            docUpdate.unshift(['add', msg.atChar, text]);
            
        }catch(error){}

        docs[dex] = doc;
        if(text === "\"\"" || text === "\{\}" || text === "\(\)" || text === "\[\]" || text === "\'\'"){
            offset += 1;
        }

        console.log("Returning the document: " + doc)
        console.log((msg.atChar+text.length-offset))
        io.emit(msg.id, {value: docs[dex], username: msg.username, cursorLocation: charToLine(msg.atChar+text.length-offset, docs[dex])})
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
        
        io.emit(msg.id, {value: docs[dex], cursorLocation: charToLine(msg.fromChar, docs[dex])})
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log("Listening on 3k and 1");
});

//This is a test message
