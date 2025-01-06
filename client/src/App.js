import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Calendar from 'react-calendar';
import '../node_modules/icheck-material/icheck-material.min.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false); 
    localStorage.removeItem('isLoggedIn'); 
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

function Home({ isLoggedIn, onLogout }) {
  const [date, setDate] = useState(new Date());
  const [isPopupVisible, setIsPopupVisible] = useState(false); 
  const [todoDate, setTodoDate] = useState(""); 
  const [todoTitle, setTodoTitle] = useState(""); 
  const calendarRef = useRef(null);

  const onChange = (newDate) => setDate(newDate);
  const formatDay = (locale, date) => date.getDate();
  const formatMonthYear = (locale, date) => moment(date).format('MMMM, YYYY'); // 예: "December, 2024"

  useEffect(() => {
    const adjustCalendarHeight = () => {
      if (calendarRef.current) {
        const calendarElement = calendarRef.current;
        const navigationHeight =
          calendarElement.querySelector('.react-calendar__navigation')?.offsetHeight || 0;
        const weekdaysHeight =
          calendarElement.querySelector('.react-calendar__month-view__weekdays')?.offsetHeight || 0;

        const daysContainer = calendarElement.querySelector('.react-calendar__month-view__days');
        if (daysContainer) {
          const calendarHeight = calendarElement.offsetHeight;
          const rows = 6;
          const daysHeight = calendarHeight - navigationHeight - weekdaysHeight;
          const rowHeight = Math.floor(daysHeight / rows);

          daysContainer.style.height = `${daysHeight}px`;
          Array.from(daysContainer.children).forEach((day) => {
            day.style.height = `${rowHeight}px`;
          });
        }
      }
    };

    adjustCalendarHeight();
    window.addEventListener('resize', adjustCalendarHeight);

    return () => {
      window.removeEventListener('resize', adjustCalendarHeight);
    };
  }, []); // 빈 배열로 한 번만 호출되도록 설정

  

  // 팝업 표시/숨김 토글 함수
  const togglePopup = () => {
    setIsPopupVisible((prevState) => {
      const newState = !prevState;
      if (!newState) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        setTodoDate(formattedDate);
      }
      return newState;
    });
  };

  // 날짜 변경 핸들러
  const handleDateChange = (event) => {
    setTodoDate(event.target.value);
  };

  // 제목 변경 핸들러
  const handleTitleChange = (event) => {
    setTodoTitle(event.target.value);
  };

  // 할 일 저장 함수
  const saveTodo = async () => {
    const todo = {
      title: todoTitle,
      td_date: todoDate,
      user_id: 'admin' 
    };

    try {
      const response = await fetch('http://localhost:5000/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo),
      });

      if (response.ok) {
        alert('Todo saved successfully');
        setTodoTitle('');
        setTodoDate('');
        togglePopup(); // 팝업 닫기
      } else {
        alert('Failed to save todo');
      }
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('Error saving todo');
    }
  };

  return (
    <div className="main">
      <div id="sidebar">
        <div className="login-print">
          {isLoggedIn ? (
            <button onClick={onLogout}>로그아웃</button>  
          ) : (
            <>
              <a href='/login'>로그인</a> 후 이용하세요
            </>
          )}
        </div>
        <div className="profile">
          <img
            src="https://avatars.githubusercontent.com/u/144537092?v=4&size=64"
            className="profile-image"
            alt="Profile"
          />
          <div className="profile-info">
            <span className="name">김영혜</span>
            <span className="state">집에가고싶다</span>
          </div>
        </div>
        <hr />
        <div className="todolist">
          <h3>오늘할일<button onClick={togglePopup}>+</button></h3>
          <div className="icheck-material-green">
            <input type="checkbox" id="green" defaultChecked />
            <label htmlFor="green">#tododata</label>
          </div>
        </div>
      </div>

      {/* 팝업 */}
      {isPopupVisible && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h4>To-do</h4>
            <label htmlFor="todo-title">제목 </label>
            <input
              type="text"
              id="todo-title"
              value={todoTitle}
              onChange={handleTitleChange}
              placeholder="할 일을 입력하세요"
            />
            <br />
            <label htmlFor="todo-date">날짜 </label>
            <input
              type="date"
              id="todo-date"
              value={todoDate}
              onChange={handleDateChange}
            />
            <br />
            <button onClick={saveTodo}>저장</button>
            &nbsp;
            <button onClick={togglePopup}>닫기</button>
          </div>
        </div>
      )}

      <div id="calendar" ref={calendarRef}>
        <Calendar
          onChange={onChange}
          value={date}
          formatDay={formatDay}
          formatMonthYear={formatMonthYear}
        />
      </div>
    </div>
  );
}

function Login({ onLoginSuccess }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!id || !password) {
      setError('아이디와 비밀번호를 입력하세요');
      return;
    }

    const user = {
      user_id: id,
      user_pw: password,
    };

    try {
      const response = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      
      if (response.ok) {
        // alert(data.message); 
        onLoginSuccess();
        navigate('/');
      } else {
        alert(data.message);  // 로그인 실패 메시지
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <label>
          아이디:
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </label>
        <br />
        <label>
          비밀번호:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">로그인</button>
        <a href="/signup"><button type="button">회원가입</button></a>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}


function SignUp() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();

    // 필수 입력 항목 개별 검증
    if (!name) {
      alert('이름은 필수 입력 항목입니다!');
      return;
    }
    if (!id) {
      alert('아이디는 필수 입력 항목입니다!');
      return;
    }
    if (!password) {
      alert('비밀번호는 필수 입력 항목입니다!');
      return;
    }

    const user = {
      user_nm: name,
      user_id: id,
      user_pw: password,
    };

    try {
      const response = await fetch('http://localhost:5000/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        setName('');
        setId('');
        setPassword('');
      } else {
        const errorData = await response.json();
        alert(`회원가입 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="signup">
      <h2>회원가입</h2>
      <form onSubmit={handleSignUp}>
        <label>
          이름:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <br />
        <label>
          아이디:
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </label>
        <br />
        <label>
          비밀번호:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}



export default App;
