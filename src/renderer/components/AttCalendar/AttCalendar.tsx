import React,{useState,useEffect} from 'react'
import Calendar,{ViewCallbackProperties,DrillCallbackProperties} from 'react-calendar';
import './AttCalendar.css';

const AttCalendar = () => {

    const getStringDate = (date:Date) => {
        const day:string = date.getFullYear() + "/" + ('0'+date.getMonth()).slice(-2) + "/" + ('0'+date.getDate()).slice(-2);
        
        return day;
    }

    const onChange = (value: Date, event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("onChange");
    }
    const onViewChange = (props:ViewCallbackProperties) => {
        console.log("onViewChange");
    }

    const onClickDay = (value: Date, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("onClickDay");
        console.log("date : "+getStringDate(value));
    }





    return (
        <div className="calendar-top">
            <Calendar 
            locale="ja-JP"
            onChange={onChange}
            onViewChange={onViewChange}
            onClickDay={onClickDay}
            />
        </div>
    )
}

export default AttCalendar;
