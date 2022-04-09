const express = require('express');
const app = express();
var cors = require('cors')
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
var bodyParser = require('body-parser')
const firebase = require('firebase');
const FCM = require('fcm-node')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

require('dotenv').config();
dotenv.config();

var serverKey = require('./privateKey.json')
var fcm = new FCM(serverKey);

mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log('Connected to MongoDB');
    },
);

app.use(cors());

const messageRoute = require('./api/routes/message.route.js');

app.use("/v1/api/message", messageRoute);


const db = firebase.initializeApp({
    apiKey: "AIzaSyDO92qWJUY0DN1_4pVU3Ws6bVRD3ovMiQY",
    authDomain: "esp32-realtime-813e1.firebaseapp.com",
    databaseURL: "https://esp32-realtime-813e1-default-rtdb.firebaseio.com",
    projectId: "esp32-realtime-813e1",
    storageBucket: "esp32-realtime-813e1.appspot.com",
    messagingSenderId: "376650722360",
    appId: "1:376650722360:web:8ce81f4e3e5b10fa6fcacd",
});

var databaseDB = db.database();
// databaseDB.ref("notification/status").set("yes");

const sendMessage = (token, title, body) => {
    var message = {
        to: token,
        // collapse_key: '...',

        notification: {
            title: title,
            body: body
        },

        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    }

    fcm.send(message, function (err, response) {
        if (err) {
            console.log("Something has gone wrong!")
        } else {

            console.log("Successfully sent with response: ", response)
            const add_notification = new Notification({
                token: req.body.token,
                title: req.body.title,
                content: req.body.body
            })

        }
    })
}
setInterval(() => {
    databaseDB.ref('ESP32_Device/notification/status').once('value')
        .then(function (snapshot) {
            if (snapshot.val() == "yes") {
                databaseDB.ref('fcm-token/token').once('value')
                    .then(function (snapshot_in) {
                        const token = snapshot_in.val();
                        console.log(token);
                        sendMessage(token, 'Warning', "Có cái đầu buồi vào nhà bạn");
                        databaseDB.ref("ESP32_Device/notification/status").set("no");
                    })
            } else {
                console.log("no")
            }
        })
}, 1000);


app.listen(PORT, () => console.log(`server started ${PORT}`))