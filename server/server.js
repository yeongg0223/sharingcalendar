const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.use(cors());
app.use(bodyParser.json());

// MySQL 데이터베이스 연결 설정
const db = mysql.createConnection({
  host: 'localhost',   
  user: 'root',        
  password: '1234',        
  database: 'shcalendar'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

app.get("/", (req, res) => {
  res.send("Chris!");
  console.log("My name is...");
});

app.post("/todos", (req, res) => {
  const { title, td_date, user_id } = req.body;

  // 입력값을 확인
  if (!title || !td_date || !user_id) {
    return res.status(400).json({ error: "All fields (title, td_date, user_id) are required" });
  }

  // TD_ID의 최대값을 구하는 쿼리문
  const maxQuery = 'SELECT MAX(CAST(TD_ID AS UNSIGNED)) AS max_id FROM TODOLIST';
  
  db.query(maxQuery, (err, result) => {
    if (err) {
      console.error('Error fetching max TD_ID:', err);
      return res.status(500).json({ error: "Failed to generate TD_ID" });
    }

    // max_id 값이 없다면 1부터 시작
    const nextId = result[0].max_id ? result[0].max_id + 1 : 1;

    // 6자리 문자열로 포맷
    const formattedId = nextId.toString().padStart(6, '0'); // '000001' 형식으로 변환

    // INSERT 쿼리문
    const query = 'INSERT INTO TODOLIST (TD_ID, TITLE, TD_DATE, USER_ID) VALUES (?, ?, ?, ?)';

    // 콘솔에 쿼리문과 파라미터 출력
    console.log('Executing query:', query);
    console.log('With values:', [formattedId, title, td_date, user_id]);

    // 데이터베이스에 INSERT 쿼리 실행
    db.query(query, [formattedId, title, td_date, user_id], (err, result) => {
      if (err) {
        console.error('Error inserting data into DB:', err);
        return res.status(500).json({ error: "Failed to save todo" });
      }

      // 성공적으로 저장된 경우
      res.status(200).json({ message: "Todo saved successfully", id: formattedId });
    });
  });
});


app.listen(5000, function () {
  console.log('listening on 5000');
});
