import React, { useState } from 'react';
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

  const onChange = (newDate) => {
    setDate(newDate);
  };

  const formatDay = (locale, date) => {
    return date.getDate(); 
  };

  const formatMonthYear = (locale, date) => {
    return moment(date).format("MMMM, YYYY"); // 예: "December, 2024"
  };

  return (
    <div className="main">
      <div id="sidebar">
        <div className="profile">
          <img src="https://avatars.githubusercontent.com/u/144537092?v=4&size=64" className="profile-image" />
          <div className="profile-info">
            <span className="name">김영혜</span>
            <span className="state">집에가고싶다</span>
          </div>
        </div>
        <hr />
        <div className="todolist">
          <h3>오늘할일</h3>
          <div className="icheck-material-green">
            <input type="checkbox" name="dinner" id="green" checked />
            <label htmlFor="green">저녁밥</label>
          </div>
        </div>
      </div>
      <div id="calendar">
      <Calendar
          onChange={onChange}
          value={date}
          formatDay={formatDay}
          formatMonthYear={formatMonthYear} // 여기서 월/년 형식을 변경
        />
        {/* <p>Selected Date: {date.toDateString()}</p>  */}
      </div>
    </div>
  );
}

export default App;
