import React,{useState,useEffect} from 'react'
import Calendar,{ViewCallbackProperties,DrillCallbackProperties} from 'react-calendar';
import './AttCalendar.css';

const AttCalendar = () => {

    const getStringDate = (date:Date) => {
        const day:string = date.getFullYear() + "/" + ('0'+date.getMonth()).slice(-2) + "/" + ('0'+date.getDate()).slice(-2);
        
        return day;
    }

    const getStringTime = (date:Date) => {
        const time:string = ('0'+date.getHours()).slice(-2) + ":" + ('0'+date.getMinutes()).slice(-2);
        return time;
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
        console.log("time : "+getStringTime(value));
    }

    const onClickDecade = (value: Date, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("onClickDecade");
    }

    const onClickMonth = (value: Date, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("onClickMonth");
    }

    const onClickWeekNumber = (weekNumber: number, date: Date, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("onClickWeekNumber");
    }

    const onClickYear = (value: Date, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("onClickYear");
    }

    const onDrillUp = (props: DrillCallbackProperties) => {
        console.log("onDrillUp");
    }
    const onDrillDown = (props: DrillCallbackProperties) => {
        console.log("onDrillDown");
    }



    return (
        <div className="calendar-top">
            <Calendar 
            locale="ja-JP"
            onChange={onChange}
            onViewChange={onViewChange}
            onClickDay={onClickDay}
            onClickDecade={onClickDecade}
            onClickMonth={onClickMonth}
            onClickWeekNumber={onClickWeekNumber}
            onClickYear={onClickYear}
            onDrillUp={onDrillUp}
            onDrillDown={onDrillDown}
            />
        </div>
    )
}

export default AttCalendar;
