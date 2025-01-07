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

// 투두리스트 추가
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

      res.status(200).json({ message: "Todo saved successfully", id: formattedId });
    });
  });
});

// 로그인
app.post("/user/login", (req, res) => {
  const { user_id, user_pw } = req.body;

  if (!user_id || !user_pw) {
    return res.status(400).json({ error: "Both user_id and user_pw are required" });
  }

  // 아이디와 비밀번호로 사용자 조회
  const query = 'SELECT * FROM USERINFO WHERE USER_ID = ? AND USER_PW = ?';
  db.query(query, [user_id, user_pw], (err, result) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: "Error checking user credentials" });
    }
    console.log('Executing query:', query);

    if (result.length > 0) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// 회원가입
app.post("/user/signup", (req, res) => {
  const { user_nm, user_id, user_pw } = req.body;

  if (!user_nm || !user_id || !user_pw) {
    return res.status(400).json({ error: "All fields (user_nm, user_id, user_pw) are required" });
  }

  // 중복 아이디 확인
  const checkQuery = 'SELECT USER_ID FROM USERINFO WHERE USER_ID = ?';
  db.query(checkQuery, [user_id], (err, result) => {
    if (err) {
      console.error('Error checking duplicate user ID:', err);
      return res.status(500).json({ error: "Error checking user ID" }); 
    }

    if (result.length > 0) {
      return res.status(409).json({ error: "User ID already exists" });
    }

    // 유저 데이터 등록
    const query = 'INSERT INTO USERINFO (USER_NM, USER_ID, USER_PW) VALUES (?, ?, ?)';
    db.query(query, [user_nm, user_id, user_pw], (err, result) => {
      if (err) {
        console.error('Error inserting user data into DB:', err);
        return res.status(500).json({ error: "Failed to register user" });
      }
      console.log('Executing query:', query);
      res.status(200).json({ message: "User registered successfully" });
    });
  });
});

// 투두리스트 불러오기
app.get("/todos/:userId", (req, res) => {
  const { userId } = req.params;

  // 쿼리문과 파라미터 출력
  console.log("With parameter:", userId);
  const query = "SELECT * FROM TODOLIST WHERE USER_ID = ?";
  console.log("Executing query:", query);

  // 쿼리 실행
  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching todos:', err);
      return res.status(500).json({ message: "Failed to fetch todos", error: err.message });
    }

    // 결과 출력
    console.log("Query result:", result);

    if (result.length === 0) {
      return res.status(404).json({ message: "No todos found for the user." });
    }
    res.json(result);
  });
});

app.listen(5000, function () {
  console.log('listening on 5000');
});
