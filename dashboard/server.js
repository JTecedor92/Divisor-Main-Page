const express = require("express");
const path = require("path");
const WebSocket = require('ws');
const http = require("http");
const { Server } = require("socket.io");
let database;
let records;
const contestID = "5v5a4u9v5x98cfh";
const problems = [];
const textProblems = [];

(async () => {
    const PocketBaseModule = await import('pocketbase');
    const PocketBase = PocketBaseModule.default;
    database = new PocketBase(databaseEndpoint);
    records = await database.collection('contests').getOne(contestID, {});
    const problemsIDs = records.problems;
    for(const key in problemsIDs){
        if(problemsIDs.hasOwnProperty(key)){
            problem = await database.collection('temporary_problems').getOne(problemsIDs[key], {});

            problems.push(problem);
            casesJson = {};
            let count  = 0;
            for(let i = 1;; i++){
                if(problem.testcase_in[i+""] === undefined){
                    break;
                }
                if(problem.testcase_in[i+""].public === 'true'){
                    count++;
                    casesJson[count] = problem.testcase_in[i+""];
                    casesJson["out"+count] = problem.testcase_out[i+""];
                    // casesJson[count].public = undefined;
                }
            }
            textProblems.push({title: problem.title, text: problem.description, points: problem.point_value, testcases: casesJson})
        }
    }
    console.log(problems);
})();
const app = express();
const server = http.createServer(app);

const databaseEndpoint = 'http://127.0.0.1:8090';
const runnerEndpoint = "http://localhost:3080";



const io = new Server(server, {
    cors: {
        origin: "*", // Adjust as necessary
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
})

const javaBoiler = "import java.util.concurrent.TimeUnit;\n\nclass Main {\n\tpublic static void main(String[] args) throws InterruptedException{\n\t\tSystem.out.println(\"The bomb is ticking...\");\n\t\tfor(int i = 10; i > -1; i--){\n\t\t\tTimeUnit.SECONDS.sleep(1);\n\t\t\tSystem.out.println(i);\n\t\t}\n\t\tSystem.out.println(\"BOOM\");\n\t}\n}"

const privateTestcases = []
const publicTestcases = [];
const keys = [];

const teams = [];

const scores = [];
const publicStatuses = [];
const privateStatuses = [];


const pythonDocs = [];
const pythonChanges = [];
const javaDocs = [];
const javaChanges = [];
const cppDocs = [];
const cppChanges = [];

const users = [];





io.on('connection', (socket) =>{
    console.log("A user connected")
    socket.emit('problemsArray', textProblems);
    let username;

    socket.on('run', (msg) => {
        //props: msg.id, msg.language, msg.value, msg.number
        
        // const outputs = [];
        const problem = problems[msg.id.substring(msg.id.indexOf("\\")+1)-1];

        //Log Data about request
        console.log("Run request from: " + msg.id);
        console.log("Requesting to run:");
        console.log(msg.value);
        console.log("On problem: ");
        console.log(problem);

        
        // let value = msg.value;
        
        
        
        // console.log(msg.id.substring(msg.id.indexOf("\\")+1))
        
        

        if(msg.language === 'java'){

            console.log("Language: Java");

            const runObj = prepJava(msg.value, problem, "true");
            const runSyntax = runObj.syntax;
            const outCases = runObj.outputs




        //     for(let i = value.length - 1; i > -1; i--){
        //         if(value[i] === "}"){
        //             value = value.substring(0, i);
        //             break;
        //         }
        //     }

        //     let runSyntax = "public static void main(String[] args){\n";
        //     const declarationArr = [];
        //     const varNameArr = [];
        //     const outCases = [];
        //     for(const key in problem.inputs){
        //         varNameArr.push(key);
        //         declarationArr.push(problem.inputs[key].java)
        //     }
        //     for(let i = 1;; i++){
        //         const testcase = problem.testcase_in[(i+"")];
        //         if(testcase === undefined){
        //             break;
        //         }
        //         if(testcase.public === "true"){
        //             outCases.push(problem.testcase_out[(i+"")])

                
        //         let addLater = "";
        //         for(let j = 0; j < varNameArr.length; j++){
                    
        //             runSyntax += (declarationArr[j] + "" + i + " = " + testcase[varNameArr[j]] + ";\n")
                    
        //             addLater += (varNameArr[j] + "" + i + ", ");
        //         }
        //         addLater = addLater.substring(0, addLater.length - 2);
        //         runSyntax += (`System.out.println("&&$" + ${problem.method_name}(${addLater}));\n`);
        //     }
        // }
        //     runSyntax += "}\n}"
        //     runSyntax = value + runSyntax;
        //     console.log(runSyntax);

            const runnerSocket = new WebSocket(runnerEndpoint);
            
            runnerSocket.addEventListener('open', () => {
                console.log("Recieved an open port")
                
                let outputCount = 0;
                const publicStatus = publicStatuses[keys.indexOf(msg.id)];

                runnerSocket.send('java-' + runSyntax)

        
                runnerSocket.on('message', (msg2) => {
                    // io.emit("t-" + msg.id, {data: msg2.toString()});
                    console.log("Run data:");
                    console.log(msg2.toString());
                    console.log("End");
                    let message = msg2.toString();
                    
 
            
                    // message;
                    const outputs = [];
                    let currentLine = "";
                    for(let i = 0; i < message.length; i++){
                        if(message[i] === '\n'){
                            console.log(currentLine)
                            if(currentLine.substring(0, 3) === '&&$'){
                                outputs.push(currentLine.substring(3));
                                currentLine = "";
                            }
                        }else{
                            console.log(message[i]);
                            currentLine += message[i];
                        }
                    }
                    for(let i = 0; i < outputs.length && outputCount < outCases.length; i++){
                        if(outputs[i] === outCases[outputCount]){
                            publicStatus[outputCount].status = "check";
                        }else{
                            publicStatus[outputCount].status = "cross";
                        }
                        outputCount++;
                    }
                    console.log("Sending: ");
                    console.log(publicStatus);
                    io.emit('o-' + msg.id, {type: 'testcase', testcases: publicStatus});

                    


                    

                })
    
                runnerSocket.on('close', (msg2) => {
                    console.log("Socket Closed");
                    
                })
            })

// 
// 
// 

        }else if(msg.language === 'python'){
            console.log("Recieved request to run Pthon");
            console.log(msg.value);

            
            

            let runSyntax = "\n";
            const declarationArr = [];
            const varNameArr = [];
            console.log(problem.inputs);
            for(const key in problem.inputs){
                varNameArr.push(key);
                declarationArr.push(problem.inputs[key].python)
            }
            for(let i = 1;; i++){
                const testcase = problem.testcase_in[(i+"")];
                if(testcase === undefined){
                    break;
                }
                let addLater = "";
                for(let j = 0; j < varNameArr.length; j++){
                    
                    runSyntax += (declarationArr[j] + "" + i + " = " + testcase[varNameArr[j]] + "\n")
                    addLater += (varNameArr[j] + "" + i + ", ");
                }
                addLater = addLater.substring(0, addLater.length - 2);
                runSyntax += (`${problem.method_name}(${addLater})\n`);
            }
            console.log(value + runSyntax);
            runSyntax = value + runSyntax;

            const runnerSocket = new WebSocket(runnerEndpoint);
            runnerSocket.addEventListener('open', () => {
                console.log("Recieved an open port")
                
                runnerSocket.send('python-' + runSyntax)
                
                
        
                runnerSocket.on('message', (msg2) => {
                    io.emit("t-" + msg.id, {data: msg2.toString()});
                    console.log("Run data:");
                    console.log(msg2.toString());
                })
    
                runnerSocket.on('close', (msg2) => {
                    console.log("Socket Closed");
                })
            })

        }else if(msg.language == 'cpp'){
            console.log("Recieved request to run C++");
            console.log(msg.value);

            

            let runSyntax = "\nint main(){\n";
            const declarationArr = [];
            const varNameArr = [];
            for(const key in problem.inputs){
                varNameArr.push(key);
                declarationArr.push(problem.inputs[key].cpp)
            }
            for(let i = 1;; i++){
                const testcase = problem.testcase_in[(i+"")];
                if(testcase === undefined){
                    break;
                }
                let addLater = "";
                for(let j = 0; j < varNameArr.length; j++){
                    let dex = declarationArr[j].indexOf("[");
                    if(dex !== -1){
                        const declaration = declarationArr[j].substring(0, dex) + "" + i + declarationArr[j].substring(dex);
                        runSyntax += (declaration + " = " + testcase[varNameArr[j]] + ";\n")
                    }else{
                        runSyntax += (declarationArr[j] + "" + i + " = " + testcase[varNameArr[j]] + ";\n")
                    }
                    
                    addLater += (varNameArr[j] + "" + i + ", ");
                }
                addLater = addLater.substring(0, addLater.length - 2);
                runSyntax += (`${problem.method_name}(${addLater});\n`);
            }
            runSyntax += "return 0;\n}"
            runSyntax = value + runSyntax;

            const runnerSocket = new WebSocket(runnerEndpoint);
            runnerSocket.addEventListener('open', () => {
                console.log("Recieved an open port")
                
                runnerSocket.send('cpp-' + runSyntax)
                
                
        
                runnerSocket.on('message', (msg2) => {
                    io.emit("t-" + msg.id, {data: msg2.toString()});
                    console.log("Run data:");
                    console.log(msg2.toString());
                })
    
                runnerSocket.on('close', (msg2) => {
                    console.log("Socket Closed");
                })
            })


        }
    });


    socket.on('join', async (msg) =>{
        // createJavaCode(msg.id);
        let docs;
        let changes;
        let code;
        const team = msg.id.substring(0, msg.id.indexOf("\\"))
        const mid = msg.id.substring(msg.id.indexOf("\\")+1)
        switch(msg.language){
            case 'text/x-java': 
                code = createJavaCode(mid);
                
                docs = javaDocs;
                changes = javaChanges;
                break;
            case 'text/x-c++src':
                code = createCppCode(mid)
                docs = cppDocs;
                changes = cppChanges;
                break;
            case 'text/x-python':
                code = createPythonCode(mid)
                docs = pythonDocs;
                changes = pythonChanges;
                break;
        }

        
        let multiplayer = false;
        username = msg.username;
        let index2 = keys.indexOf(msg.id);
        if(index2 === -1){
            if(teams.indexOf(team) === -1){
              teams.push(team);
              scores.push(0);  
            }       
            keys.push(msg.id);
            publicStatuses.push([]);
            privateStatuses.push([]);
            console.log(problems)
            for(let i = 1;; i++){
                console.log("checking:");
                console.log(problems[mid-1].testcase_in);
                if(problems[mid-1].testcase_in[i+""] === undefined){
                    break;
                }else{ 
                    if(problems[mid-1].testcase_in[i+""].public === "true"){
                        
                        let inputString = "";
                        for(const key in problems[mid-1].testcase_in[i+""]){
                            if(key !== "public"){
                                inputString += key;
                                inputString += ": ";
                                console.log(inputString);
                                let toAdd = problems[mid-1].testcase_in[i+""][key];
                                for(let j = 0; j < toAdd.length; j++){
                                    if(toAdd[j] === "\\"){
                                        toAdd = toAdd.substring(0, j) + toAdd.substring(j+1);
                                        j--;
                                        
                                    }
                                }
                                
                                inputString += toAdd;
                                inputString += ", ";
                            }
                        }

                        //Remove last comma/space
                        inputString = inputString.substring(0, inputString.length-2);


                        publicStatuses[publicStatuses.length-1].push({status: "none", inputs: inputString, lastOutput: "", output: problems[mid-1].testcase_out[i+""]});
                        console.log("Created public status: " + JSON.stringify({status: "none", inputs: inputString, lastOutput: "", output: problems[mid-1].testcase_out[i+""]}))
                    }
                    privateStatuses[privateStatuses.length-1].push(false);
                }
            }
            
            console.log(mid);
            console.log(msg.id);
        }
        index2 = keys.indexOf(msg.id);
        
        if(docs[index2] === undefined){
            docs[index2] = code;
            changes[index2] = [];
        }
        console.log("Docs incoming...");
        console.log(docs);


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
        // console.log(publicStatuses);
        // console.log(publicStatuses[keys.indexOf(msg.id)]);
        // console.log(docs[keys.indexOf(msg.id)])
        
        console.log(`To ${msg.id}`)
        console.log({value: docs[keys.indexOf(msg.id)], cursorLocation: 0, join: true, language: msg.language})

        //Send current doc value and such
        io.emit(msg.id, {value: docs[keys.indexOf(msg.id)], cursorLocation: 0, join: true, language: msg.language})


        console.log({type: 'testcase', testcases: publicStatuses[keys.indexOf(msg.id)]})
        //Send current state of public testcases
        io.emit("o-"+msg.id, {type: 'testcase', testcases: publicStatuses[keys.indexOf(msg.id)]})


        console.log("After Join");
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
        
        let docs;
        let changes;
        switch(msg.language){
            case 'text/x-java':
                console.log("setting docs to javaDocs")
                docs = javaDocs;
                changes = javaChanges;
                break;
            case 'text/x-c++src':
                docs = cppDocs;
                changes = cppChanges
                break;
            case 'text/x-python':
                docs = pythonDocs;
                changes = pythonChanges;
                break;
        }
        
        const index = keys.indexOf(msg.id);
        if(index !== -1 && docs[index] !== undefined){
            let doc = docs[index];
            let changes2 = changes[index];

            console.log(msg.username + ":");
            console.log(msg.extraInfo);
            console.log("Current doc:");
            console.log(doc);


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



            if(msg.lastChange.username !== "initial" && changes2.length !== 0 && !(msg.lastChange.number === changes2[changes2.length - 1].number && msg.lastChange.username === changes2[changes2.length - 1].username)){
                for(let i = changes2.length - 1; i > -1; i--){
                    const change = changes2[i];
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
                console.log("Would have placed it at:")
                console.log(handleOtherUserAddition(doc, msg.text, msg.atChar));
                console.log("Placed it at:")
                console.log(handleOtherUserAddition(doc, msg.text, msg.atChar + offset));
            }



            //2. Apply the offset and make the change
            docs[index] = handleOtherUserAddition(doc, msg.text, msg.atChar + offset);
            console.log("Changed doc to:");
            console.log(docs[index]);

            //3. Send the change to all users on the document
            io.emit(msg.id, {type: 'add', atChar: msg.atChar+offset, text: msg.text, username: msg.username, number: msg.editNumber});


            //(Possibly) send the full text to users who missed it do to poor connection
            //4. (On user-end) Offset the recieved change by the offset of all changes user made that had not yet been recieved from server

            //type: true for addition, false for deletion
            console.log("Adding change: " + JSON.stringify({type: true, username: msg.username, number: msg.editNumber, atChar: msg.atChar+offset, text: msg.text}))
            changes2.push({type: true, username: msg.username, number: msg.editNumber, atChar: msg.atChar+offset, text: msg.text})
        }
    });
    socket.on('remove', (msg) =>{
        let docs;
        let changes;
        switch(msg.language){
            case 'text/x-java':
                docs = javaDocs;
                changes = javaChanges;
                break;
            case 'text/x-c++src':
                docs = cppDocs;
                changes = cppChanges
                break;
            case 'text/x-python':
                docs = pythonDocs;
                changes = pythonChanges;
                break;
        }


                //Identify working document
        const index = keys.indexOf(msg.id);
        if(index !== -1 && docs[index] !== undefined){
            let doc = docs[index];
            
            let changes2 = changes[index];
            
            //1. Calculate the character offset of every change that is after lastChange and was not made by the user
            //(lastChange is the last change that the user recieved from the server)
            //If before change- additions add characters, removals remove
            console.log(msg.username + ":");
            console.log(msg.extraInfo);
            console.log("Current doc:");
            console.log(doc);

            let offset = 0;


            if(msg.lastChange.username !== "initial" && changes2.length !== 0 && !(msg.lastChange.number === changes2[changes2.length - 1].number && msg.lastChange.username === changes2[changes2.length - 1].username)){
                console.log("Discrepancy found");
                for(let i = changes2.length - 1; i > -1; i--){
                    const change = changes2[i];
                    console.log("Comparing users change " + JSON.stringify(msg.lastChange))
                    console.log("with server's change " + JSON.stringify(change))
                    if(change.number === msg.lastChange.number && change.username === msg.lastChange.username){
                        
                        break;
                    }
                    if(change.username !== msg.username){
                        if(change.type){
                            //For additions
                
                            //Depending on behavior, <= may be a better choice
                            if(change.atChar < msg.atChar){
                                console.log("Offset by " + change.text.length);
                                offset += change.text.length;
                            }
                        }else{
                            //For deletions
                            if(change.endChar < msg.atChar){
                                console.log("Offset by " + (change.endChar - change.startChar))
                                offset -= (change.endChar - change.startChar);
                            }
                        }
                    }
                }
                console.log("Would have removed it at:")
                console.log(handleOtherUserRemoval(doc, msg.startChar+offset, msg.endChar));
                console.log("Removed it at:")
                console.log(handleOtherUserRemoval(doc, msg.startChar+offset, msg.endChar+offset));
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
            console.log("Changed doc to:");
            console.log(docs[index]);
            
            //3. Send the change to all users on the document
            io.emit(msg.id, {type: 'remove', startChar: msg.startChar, endChar: msg.endChar, username: msg.username, number: msg.editNumber});
            
            
            //(Possibly) send the full text to users who missed it do to poor connection
            //4. (On user-end) Offset the recieved change by the offset of all changes user made that had not yet been recieved from server
            


            //TODO: fix this bs
            console.log("Adding Change: " + JSON.stringify({type: false, username: msg.username, number: msg.editNumber, startChar: msg.startChar, endChar: msg.endChar}))
            changes2.push({type: false, username: msg.username, number: msg.editNumber, startChar: msg.startChar, endChar: msg.endChar})
        }
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

function createPythonCode(problemNumber){
    console.log('python called');
    const record = problems[problemNumber-1]

    console.log(record);

    let params = "";
    for (const key in record.inputs) {
        if (record.inputs.hasOwnProperty(key)) {
            params += record.inputs[key].python + ", ";
        }
    }
    params = params.substring(0, params.length-2);

    let code = `def ${record.method_name}(${params}):\n\t`
    console.log(code);
    return code;

}
function createCppCode(problemNumber){
    console.log('cpp called');
    const record = problems[problemNumber-1]

    console.log(record);

    let params = "";
    for (const key in record.inputs) {
        if (record.inputs.hasOwnProperty(key)) {
            params += record.inputs[key].cpp + ", ";
        }
    }
    params = params.substring(0, params.length-2);

    let code = `#include <iostream>\n#include <stdexcept>\n\n${record.return_type.cpp} ${record.method_name}(${params}){\n\t\n\t\n}`
    console.log(code);
    return code;

}
function createJavaCode(problemNumber){
    if(typeof problemNumber === "string" && problemNumber.indexOf("\\") !== -1){
        problemNumber = problemNumber.substring(problemNumber.indexOf("\\")+1);
    }
    console.log('java called');
    console.log(problemNumber);
    const record = problems[problemNumber-1]

    console.log(record);

    let params = "";
    for (const key in record.inputs) {
        if (record.inputs.hasOwnProperty(key)) {
            params += record.inputs[key].java + ", ";
        }
    }
    params = params.substring(0, params.length-2);

    let code = `class Main{\n\tpublic static ${record.return_type.java} ${record.method_name}(${params}){\n\t\t\n\t\t\n\t}\n}`
    console.log(code);
    return code;

}

function prepJava(value, problem, public){

    
    
    const declarationArr = [];
    const varNameArr = [];
    const outCases = [];

    let runSyntax = "public static void main(String[] args){\n";


    for(let i = value.length - 1; i > -1; i--){
        if(value[i] === "}"){
            value = value.substring(0, i);
            break;
        }
    }


    for(const key in problem.inputs){
        varNameArr.push(key);
        declarationArr.push(problem.inputs[key].java)
    }


    for(let i = 1;; i++){
        const testcase = problem.testcase_in[(i+"")];
        if(testcase === undefined){
            break;
        }
        if(testcase.public === public){
            outCases.push(problem.testcase_out[(i+"")])

        
            let addLater = "";
            for(let j = 0; j < varNameArr.length; j++){
                
                runSyntax += (declarationArr[j] + "" + i + " = " + testcase[varNameArr[j]] + ";\n")
                
                addLater += (varNameArr[j] + "" + i + ", ");
            }
            addLater = addLater.substring(0, addLater.length - 2);
            runSyntax += (`System.out.println("&&$" + ${problem.method_name}(${addLater}));\n`);
        }
    }

    runSyntax += "}\n}"
    runSyntax = value + runSyntax;


    console.log(runSyntax);
    console.log(outCases);
    return {syntax: runSyntax, outputs: outCases};
}