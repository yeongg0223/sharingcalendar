import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Calendar from 'react-calendar';
import '../node_modules/icheck-material/icheck-material.min.css';

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
  const [date, setDate] = useState(new Date()); // 날짜 상태 추가

  const onChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div class='main'>
      <div id='sidebar'>
        <div class='profile'>
          <img src='https://avatars.githubusercontent.com/u/144537092?v=4&size=64' class='profile-image' />
          <div class='profile-info'>
            <span class='name'>김영혜</span>
            <span class='state'>집에가고싶다</span>
          </div>
        </div>
        <hr/>
        <div class='todolist'>
          <h3>오늘할일</h3>
          <div class="icheck-material-green">
            <input type="checkbox" name='dinner' id='green' checked/>
            <label for='green'>저녁밥</label>
          </div>
          
          
        </div>
      </div>
      <div id='calendar'>
        <Calendar onChange={onChange} value={date} />
        {/* <p>Selected Date: {date.toDateString()}</p>  */}
      </div>
    </div>
  );
}

export default App;
