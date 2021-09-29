/**
 * @file AttCalendar.tsx
 * @brief 出退勤のカレンダー処理
 * @author Kazuya Yoshihara
 * @date 2021/09/10
 */
import React,{useState,useEffect} from 'react'
import Calendar,{ViewCallbackProperties,DrillCallbackProperties} from 'react-calendar';
import './AttCalendar.css';

import {ATT_CALENDAR_PARAM} from '../../../types'

/**
 * AttCalendar
 * @brief カレンダー処理を記述するComponent
 * @returns JSX
 */
const AttCalendar = (props:ATT_CALENDAR_PARAM) => {
    /**
     * getStringDate
     * @brief Dateオブジェクトから日付文字列
     * @param date 日付
     * @returns 日付文字列
     */
    const getStringDate = (date:Date) => {
        const day:string = date.getFullYear() + "/" + ('0'+date.getMonth()).slice(-2) + "/" + ('0'+date.getDate()).slice(-2);
        return day;
    }
    /**
     * onChange
     * @brief CalendarオブジェクトのonChangeイベントをハンドリング
     * @param value 日付
     * @param event イベント
     */
    const onChange = (value: Date, event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("onChange");
    }
    /**
     * onViewChange
     * @brief CalendarオブジェクトのonViewChangeイベントをハンドリング
     * @param props 
     */
    const onViewChange = (props:ViewCallbackProperties) => {
        console.log("onViewChange");
    }
    /**
     * onClickDay
     * @brief CalendarオブジェクトのonClickDayイベントをハンドリング
     * @param value 日付
     * @param event イベント
     */
    const onClickDay = (value: Date, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log("onClickDay");
        console.log("date : "+getStringDate(value));
        props.click_day_cb(value);
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
