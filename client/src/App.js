import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Calendar from 'react-calendar';
import '../node_modules/icheck-material/icheck-material.min.css';
import moment from 'moment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

function Home() {
  const [date, setDate] = useState(new Date());
  const [isPopupVisible, setIsPopupVisible] = useState(false); // 팝업의 표시 여부
  const [todoDate, setTodoDate] = useState(""); // 날짜 상태
  const [todoTitle, setTodoTitle] = useState(""); // 제목 상태
  const calendarRef = useRef(null);

  // 날짜 변경 핸들러
  const onChange = (newDate) => setDate(newDate);

  // 날짜 포맷
  const formatDay = (locale, date) => date.getDate();
  const formatMonthYear = (locale, date) => moment(date).format('MMMM, YYYY'); // 예: "December, 2024"

  // 캘린더 높이 조정
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
            <input type="checkbox" name="dinner" id="green" defaultChecked />
            <label htmlFor="green">저녁밥</label>
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

export default App;
