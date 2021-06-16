import React,{useState,useEffect} from 'react'
import Calendar from 'react-calendar';
import './AttCalendar.css';

const AttCalendar = () => {
    return (
        <div className="calendar-top">
            <Calendar className="calendar-comp"/>
        </div>
    )
}

export default AttCalendar;
