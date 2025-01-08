import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Calendar from "react-calendar";
import "icheck-material/icheck-material.min.css";
import moment from "moment";

function App() {
  const [user, setUser] = useState({ isLoggedIn: false, userId: "" });

  useEffect(() => {
    const savedLoginState = localStorage.getItem("isLoggedIn");
    const savedUserId = localStorage.getItem("userId");
    setUser({
      isLoggedIn: savedLoginState === "true",
      userId: savedUserId || "",
    });
  }, []);

  const handleLoginSuccess = (userId) => {
    setUser({ isLoggedIn: true, userId: userId });
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userId", userId);
  };

  const handleLogout = () => {
    setUser({ isLoggedIn: false, userId: "" });
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    window.location.reload(); // 페이지 새로고침
  };
  

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Home user={user} onLogout={handleLogout} />}
        />
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

function Home({ user, onLogout }) {
  const [date, setDate] = useState(new Date());
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [todoDate, setTodoDate] = useState(moment().format("YYYY-MM-DD"));
  const [todoTitle, setTodoTitle] = useState("");
  const calendarRef = useRef(null);
  const navigate = useNavigate();

  // 달력 높이를 조정하는 함수
  const adjustCalendarHeight = () => {
    if (calendarRef.current) {
      const calendarElement = calendarRef.current;
      const navigationHeight =
        calendarElement.querySelector(".react-calendar__navigation")
          ?.offsetHeight || 0;
      const weekdaysHeight =
        calendarElement.querySelector(".react-calendar__month-view__weekdays")
          ?.offsetHeight || 0;
      const daysContainer = calendarElement.querySelector(
        ".react-calendar__month-view__days"
      );

      if (daysContainer) {
        const calendarHeight = calendarElement.offsetHeight;
        const daysHeight = calendarHeight - navigationHeight - weekdaysHeight;
        console.log(daysHeight);

        daysContainer.style.height = `${daysHeight}px`;
      }
    }
  };

  useEffect(() => {
    adjustCalendarHeight();
    window.addEventListener("resize", adjustCalendarHeight);

    return () => {
      window.removeEventListener("resize", adjustCalendarHeight);
    };
  }, [date]);

  const handleActiveStartDateChange = ({ activeStartDate }) => {
    adjustCalendarHeight();
  };

  const handleMonthClick = (month) => {
    console.log("Clicked month:", month);
    setTimeout(() => {
      adjustCalendarHeight();
    }, 0);
  };

  const togglePopup = () => {
    if (user.isLoggedIn) {
      setIsPopupVisible(!isPopupVisible); 
    } else {
      alert('먼저 로그인을 해주세요.');
      navigate('/login');
    };
  };

  const saveTodo = async () => {
    const todo = { title: todoTitle, td_date: todoDate, user_id: user.userId };
    try {
      const response = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
      });

      if (response.ok) {
        alert("Todo saved successfully");
        setTodoTitle("");
        togglePopup();
      } else {
        alert("Failed to save todo");
      }
    } catch (error) {
      console.error("Error saving todo:", error);
      alert("Error saving todo");
    }
  };

  return (
    <div className="main">
      <Sidebar user={user} onLogout={onLogout} togglePopup={togglePopup} />

      {isPopupVisible && (
        <Popup
          todoTitle={todoTitle}
          todoDate={todoDate}
          setTodoTitle={setTodoTitle}
          setTodoDate={setTodoDate}
          saveTodo={saveTodo}
          togglePopup={togglePopup}
        />
      )}

      <div id="calendar" ref={calendarRef}>
        <Calendar
          onChange={setDate}
          value={date}
          formatDay={(locale, date) => date.getDate()}
          formatMonthYear={(locale, date) => moment(date).format("MMMM, YYYY")}
          calendarType="gregory"
          onActiveStartDateChange={handleActiveStartDateChange}
          onClickMonth={handleMonthClick}
        />
      </div>
    </div>
  );
}

function Sidebar({ user, onLogout, togglePopup }) {
  const [todos, setTodos] = useState([]);

  const fetchTodos = useCallback(async () => {
    try {
      console.log(`Fetching todos for user: ${user.userId}`);
      const response = await fetch(
        `http://localhost:5000/todos/${user.userId}`
      );
      console.log("Response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched todos:", data);
        setTodos(data);
      } else {
        console.error("Failed to fetch todos with status:", response.status);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  }, [user.userId]); // `user.userId`를 의존성에 추가
  

  const handleCheckboxChange = async (todo) => {
    const updatedCK_YN = todo.CK_YN === "Y" ? "N" : "Y";
  
    const updatedTodos = todos.map((t) =>
      t.TD_ID === todo.TD_ID ? { ...t, CK_YN: updatedCK_YN } : t
    );
    setTodos(updatedTodos);
  
    try {
      const response = await fetch(`http://localhost:5000/todos/${todo.TD_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CK_YN: updatedCK_YN }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update CK_YN on the server");
      }
  
      console.log(`Todo ${todo.TD_ID} updated successfully`);
    } catch (error) {
      console.error("Error updating CK_YN:", error);
  
      setTodos(todos);
    }
  };

  useEffect(() => {
    if (user.isLoggedIn) {
      fetchTodos();
    }
  }, [user.isLoggedIn, fetchTodos]);
  

  return (
    <div id="sidebar">
      <div className="login-print">
        {user.isLoggedIn ? (
          <>
            <span className="loginid">{user.userId}</span>
            <button onClick={onLogout}>로그아웃</button>
          </>
        ) : (
          <a href="/login">로그인</a>
        )}
      </div>
      <div className="profile">
        <img
          src="https://avatars.githubusercontent.com/u/144537092?v=4&size=64"
          alt="Profile"
          className="profile-image"
        />
        <div className="profile-info">
          <span className="name">김영혜</span>
          <span className="state">집에가고싶다</span>
        </div>
      </div>
      <hr />
      <div className="todolist">
        <h3>
          오늘할일 <button onClick={togglePopup}>+</button>
        </h3>
      <div className="todoset">
        <ul>
          {todos.map((todo) => (
            <li key={todo.TD_ID}>
              <input
                type="checkbox"
                checked={todo.CK_YN === "Y"} // CK_YN 값이 'Y'일 경우 체크
                onChange={() => handleCheckboxChange(todo)} // 상태 변경 핸들러
              />
              <span>{todo.TITLE}</span>
            </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
  );
}

function Popup({
  todoTitle,
  todoDate,
  setTodoTitle,
  setTodoDate,
  saveTodo,
  togglePopup,
}) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h4>To-do</h4>
        <label htmlFor="todo-title">제목 </label>
        <input
          type="text"
          id="todo-title"
          value={todoTitle}
          onChange={(e) => setTodoTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
        />
        <br />
        <label htmlFor="todo-date">날짜 </label>
        <input
          type="date"
          id="todo-date"
          value={todoDate}
          onChange={(e) => setTodoDate(e.target.value)}
        />
        <br />
        <button onClick={saveTodo}>저장</button>
        <button onClick={togglePopup}>닫기</button>
      </div>
    </div>
  );
}

function Login({ onLoginSuccess }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!id || !password) return alert("아이디와 비밀번호를 입력하세요");

    try {
      const response = await fetch("http://localhost:5000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: id, user_pw: password }),
      });
      const data = await response.json();

      if (response.ok) {
        onLoginSuccess(id);
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="login">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <label>
          아이디:{" "}
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </label>
        <label>
          비밀번호:{" "}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">로그인</button>
        <a href="/signup">
          <button type="button">회원가입</button>
        </a>
      </form>
    </div>
  );
}

function SignUp() {
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!name || !id || !password) return alert("모든 필드를 입력해주세요");

    try {
      const response = await fetch("http://localhost:5000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_nm: name, user_id: id, user_pw: password }),
      });

      if (response.ok) {
        alert("회원가입 완료");
        setName("");
        setId("");
        setPassword("");
      } else {
        const errorData = await response.json();
        alert(`회원가입 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="signup">
      <h2>회원가입</h2>
      <form onSubmit={handleSignUp}>
        <label>
          이름:{" "}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          아이디:{" "}
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </label>
        <label>
          비밀번호:{" "}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default App;