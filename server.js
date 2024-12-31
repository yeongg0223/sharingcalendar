// server.js
const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');  

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://shcalendar:qwer123!@sharingcalendar.67ag2.mongodb.net/')
  .then(() => console.log('MongoDB가 연결되었다...!'))
  .catch(() => console.log('failed'))

app.use(cors());
app.use(bodyParser.json());  // JSON 형식으로 요청 본문을 파싱할 수 있도록 설정

app.get("/", (req, res) => {
  res.send("Chris!");
  console.log("My name is...");
});

app.listen(5000, function () {
  console.log('listening on 5000');
});
