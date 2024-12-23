import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Calendar from 'react-calendar';
// import '../node_modules/react-calendar/dist/Calendar.css';

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
