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
const changes = [];

const users = [];


io.on('connection', (socket) =>{
    console.log("A user connected")

    let username;

    socket.on('join', (msg) =>{
        let multiplayer = false;
        username = msg.username;
        if(!keys.includes(msg.id)){       
            docs.push(javaBoiler);
            keys.push(msg.id);
        }

        const temporaryUsers = []; 
        console.log("Users");
        console.log(users);
        console.log(msg.id);

        // users.forEach((user) => {

        // });
        
        let index = -1;
        for(let i = 0; i < users.length; i++){
            if(users[i].user === username){
                index = i;
                break;
            }
        }
        console.log("Parsing ids...");
        for(let i = 0; i < users.length; i++){
            console.log(users[i].currentDoc);
            if(users[i].currentDoc === msg.id){
                multiplayer = true;
            }
        }
        if(index === -1){
            users.push({user: username, currentDoc: msg.id})
        }else{
            users[index].currentDoc = msg.id;
        }
        
        console.log(`To ${msg.id}` + JSON.stringify({value: docs[keys.indexOf(msg.id)], cursorLocation: 0, isMultiplayer: multiplayer}))
        io.emit(msg.id, {value: docs[keys.indexOf(msg.id)], cursorLocation: 0, join: true})
        console.log(users);
    });

    

    
    socket.on('disconnect', () => {
        if(username){
            for(let i = 0; i < users.length; i++){
                try{
                    console.log(i + ":");
                    console.log(user[i]);
                }catch(error){
                    console.log("no user at index " + i);
                }
            }

            let index = -1;
            for(let i =0; i < users.length; i++){
                
                if(users[i].user === username){
                    index = i;
                }
            }

            if(index !== -1){
                let user3 = users[index];

                const leftDoc = user3.currentDoc;

                console.log(users);
                delete users[index];
                console.log(users);
                for(let i = index+1; i < users.length; i++){
                    console.log(users[i-1]);
                    console.log(users[i]);
                    users[i-1] = users[i];
                }
                console.log(users);
                users.splice(users.length - 1, 1);
                console.log(users);

                const temporaryUsers = [];  
                for(let i =0; i < users.length; i++){
                    console.log("User: " + users[i]);
                    if(users[i] !== undefined && users[i].currentDoc === leftDoc){
                        temporaryUsers.push(users[i]);
                    }
                }

                if(temporaryUsers.length === 1){
                    io.emit(leftDoc, {isMultiplayer: false});
                }
            }
        }

        
    });

    //id, username, lastChange, atChar, text, editNumber

    socket.on('add', (msg) =>{
        //Identify working document
        const index = keys.indexOf(msg.id);
        let doc = docs[index];

        console.log("Recieved a request to add from ")


        //1. Calculate the character offset of every change that is after lastChange and was not made by the user
        //(lastChange is the last change that the user recieved from the server)
        //If before change- additions add characters, removals remove
        
        let offset = 0;

        //User 1 sends charcter add 1 char
        //Server recieves character
        //User 2 send char, last change it recieved
        //User 2 recieves char
        //Server recieve user 2 char
        //Server check its history, 



        if(changes.length !== 0 && !(msg.lastChange.number === changes[changes.length - 1].number && msg.lastChange.username === changes[changes.length - 1].username)){
            for(let i = changes.length - 2; i > -1; i--){
                const change = changes[i];
                if(change.number === msg.lastChange.number && change.username === msg.lastChange.username){
                    // index = i;
                    console.log("User's last recorded change: " + JSON.stringify(msg.lastChange));
                    console.log("Server's last recorded change: " + JSON.stringify(change));
                    
                    break;
                }
                if(change.username !== msg.username){
                    if(change.type){
                        //For additions
            
                        //Depending on behavior, <= may be a better choice
                        if(change.atChar < msg.atChar){
                            offset += change.text.length;
                        }
                    }else{
                        //For deletions
            
                        if(change.endChar < msg.atChar){
                            offset -= (change.endChar - change.startChar);
                        }
                    }
                }
            }
            console.log("Calculated an offset of: " + offset)
        }



        //2. Apply the offset and make the change
        docs[index] = handleOtherUserAddition(doc, msg.text, msg.atChar + offset);


        //3. Send the change to all users on the document
        io.emit(msg.id, {type: 'add', atChar: msg.atChar+offset, text: msg.text, username: msg.username, number: msg.editNumber});


        //(Possibly) send the full text to users who missed it do to poor connection
        //4. (On user-end) Offset the recieved change by the offset of all changes user made that had not yet been recieved from server

        //type: true for addition, false for deletion
        changes.push({type: true, username: msg.username, number: msg.editNumber, atChar: msg.atChar+offset, text: msg.text})

    });
    socket.on('remove', (msg) =>{

                //Identify working document
        const index = keys.indexOf(msg.id);
        console.log(docs);
        let doc = docs[index];
        
        
         //1. Calculate the character offset of every change that is after lastChange and was not made by the user
        //(lastChange is the last change that the user recieved from the server)
        //If before change- additions add characters, removals remove
        console.log(msg.lastChange);

        let offset = 0;


        if(changes.length !== 0 && !(msg.lastChange.number === changes[changes.length - 1].number && msg.lastChange.username === changes[changes.length - 1].username)){
            for(let i = changes.length - 2; i > -1; i--){
                const change = changes[i];
                if(change.number === msg.lastChange.number && change.username === msg.lastChange.username){
                    // index = i;
                    console.log("User's last recorded change: " + msg.lastChange);
                    console.log("Server's last recorded change: " + change);
                    
                    break;
                }
                if(change.username !== msg.username){
                    if(change.type){
                        //For additions
            
                        //Depending on behavior, <= may be a better choice
                        if(change.atChar < msg.atChar){
                            offset += change.text.length;
                        }
                    }else{
                        //For deletions
            
                        if(change.endChar < msg.atChar){
                            offset -= (change.endChar - change.startChar);
                        }
                    }
                }
            }
            console.log("Calculated an offset of: offset")
        }

            // console.log(changes);
            // console.log(index);
            // for(let i = changes.length - 1; i > index; i--){
            //     const change = changes[i];
            //     if(change.type){
            //         //For additions
        
            //         //Depending on behavior, <= may be a better choice
            //         if(change.atChar < msg.atChar){
            //             offset += change.text.length;
            //         }
            //     }else{
            //         //For deletions
        
            //         if(change.endChar < msg.atChar){
            //             offset -= (change.endChar - change.startChar);
            //         }
            //     }
            // }
        
        
        
        
        //2. Apply the offset and make the change
        
        docs[index] = handleOtherUserRemoval(doc, msg.startChar+offset, msg.endChar+offset);
        
        
        //3. Send the change to all users on the document
        io.emit(msg.id, {type: 'remove', startChar: msg.startChar, endChar: msg.endChar, username: msg.username, number: msg.editNumber});
        
        
        //(Possibly) send the full text to users who missed it do to poor connection
        //4. (On user-end) Offset the recieved change by the offset of all changes user made that had not yet been recieved from server
        


        //TODO: fix this bs
        changes.push({type: false, username: msg.username, number: msg.editNumber, startChar: msg.startChar, endChar: msg.endChar})
    });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log("Listening on 3k and 1");
});


//-------------------------------------------------------
//Editing methods
//-------------------------------------------------------


function handleOtherUserAddition(text, insert, atChar){
    text = text.substring(0, atChar) +  insert + text.substring(atChar);
    return text;
}
function handleOtherUserRemoval(text, fromChar, toChar){
    text = text.substring(0, fromChar) + text.substring(toChar);
    return text;
}



// function handleAddition(text, insert, atChar){
//     let offset = 0;

//     if(insert.includes("\n")){
//         let flag = false;
//         if(insert === "\n" && text.substring(atChar-1, atChar) === "{" && text.substring(atChar, atChar+1) === "}"){
//             insert = "\n\n";
//             flag = true;
//             offset++;
//         }
//         let temp = text.substring(0, atChar)
//         let unclosedParenthesisCount = 0;
//         for(let i = 0; i < temp.length; i++){
//             if(temp.substring(i, i+1) === '{' && (i === 0 || !(temp.substring(i-1, i) === "\\"))){
//                 unclosedParenthesisCount++;
//             }else if(temp.substring(i, i+1) === '}' && (i === 0 || (!temp.substring(i-1, i) === "\\"))){
//                 unclosedParenthesisCount--;
//             }
//         }

//         offset += unclosedParenthesisCount - 1;
//         let tabs = "";
//         if(unclosedParenthesisCount > 0){
//             for(let j = 0; j < unclosedParenthesisCount; j++){
                
//                tabs += "\t"
//             }
//             for(let i = 0; i < insert.length; i++){
//                 if(i === 0 || insert[i] === "\n"){
//                     insert = insert.substring(0, i+1) + tabs + insert.substring(i+1, insert.length);
//                     i += tabs.length;
                    
//                 }
//             }
//         }
//         if(flag && text.length > atChar && text.substring(atChar, atChar+1) === "}"){
//             insert = insert.substring(0, insert.length - 1);
//         }

//     }

//     text = text.substring(0, atChar) +  insert + text.substring(atChar);

//     if(insert === "\"\"" || insert === "\{\}" || insert === "\(\)" || insert === "\[\]" || insert === "\'\'"){
//         offset += 1;
//     }



//     const cursorPosition = charToLine(text, atChar+insert.length-offset);


//     return({newValue: text, cursorLine: cursorPosition.line, cursorCharacter: cursorPosition.char});
// }

// function handleRemoval(text, fromChar, toChar){
    
//     //Remove the requested region from text
//     console.log("Text: " + typeof text);
//     console.log(text);
//     text = text.substring(0, fromChar) + text.substring(toChar);

//     //Find the new cursor position
//     const cursorPosition = charToLine(text, fromChar);

//     //Return the new data
//     return({newValue: text, cursorLine: cursorPosition.line, cursorCharacter: cursorPosition.char})
// }

// function charToLine(text, char){
    
//     let lineToChar2 = [];
//     lineToChar2.push(0);
//     for(let i = 0; i < text.length;i++){
//         if(text[i] === '\n'){
//             lineToChar2.push(i+1);
//         }
//     }
//     let index = 0;
//     let distance = char - lineToChar2[0];
//     for(let i = 1; i <lineToChar2.length; i++){
//         if(char-lineToChar2[i] < distance && char >= lineToChar2[i]){
//             index = i;
//             distance = char - lineToChar2[i];
//         }
//     }

//     return({line: index, char: char-lineToChar2[index]})
// }

function lineToChar(text, line, char){
    let lineToChar2 = [];

    lineToChar2.push(0);

    for(let i = 0; i < text.length; i++){
        if(text[i] === '\n'){
            lineToChar2.push(i+1);
        }
    }



    return lineToChar2[line]+char;
}

function dataToString(text){
    let text2 = "";

    if(text.length > 1 && text[0] === "" && text[1] === ""){
        text2 = "\n";
    }else{
        
        //If one of a certain group of characters are typed, automatically close them
        if(text.length === 1){
            if(text[0] === "\{"){
                text[0] = "{}";
            }else if(text[0] === "\(" ){
                text[0] = "()";
            }else if(text[0] === '\['){
                text[0] = "[]";
            }if(text[0] === "\"" || text[0] === "\'"){
                text[0] += text[0];
            }
        }

        //For multi-line additions, add line breaks at the end of each line
        text2 = "";
        for(let i = 0; i <text.length;i++){
            text2 += text[i];
            if(i !== text.length - 1){
                text2 += '\n';
            }
        }
    }

    return(text2);
}

