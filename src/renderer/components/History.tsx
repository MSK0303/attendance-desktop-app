import React,{useState,useEffect} from 'react'
import {Grid} from '@material-ui/core';
import {ACTION_STATE, HISTORY_OBJECT,HISTORY_BUFFER} from '../../types';
import './History.css';

const History = (props:HISTORY_BUFFER) => {
    let is_new_day:boolean = true;
    let pre_day:string = "";
    let rend:JSX.Element[] = [];

    const createHistoryMessage = (time:string,action_type:ACTION_STATE) => {
        let message:string|null = "";
        console.log("time:"+time);
        switch(action_type)
        {
            case ACTION_STATE.COMMUTING:
                message = time + " 出勤しました";
                break;
            case ACTION_STATE.LEAVE_WORK:
                message = time + " 退勤しました";
                break;
            case ACTION_STATE.REST_START:
                message = time + " 休憩開始しました";
                break;
            case ACTION_STATE.REST_END:
                message = time + " 休憩終了しました";
                break;
            case ACTION_STATE.GO_OUT_START:
                message = time + " 外出開始しました";
                break;
            case ACTION_STATE.GO_OUT_END:
                message = time + " 外出終了しました";
                break;
            default:
                message = null;
                break;
        }
        return message;
    }

    console.log(props.buff);

    props.buff.map((value:HISTORY_OBJECT,key:number) => {
        const day:string = value.date.getFullYear() + "/" + ('0'+value.date.getMonth()).slice(-2) + "/" + ('0'+value.date.getDate()).slice(-2);
        const time:string = ('0'+value.date.getHours()).slice(-2) + ":" + ('0'+value.date.getMinutes()).slice(-2);
        
        console.log("day:"+day);
        console.log("time:"+time);

        if(pre_day!=day) rend.push(<div className="history_date">{day}</div>);
        const message = createHistoryMessage(time,value.action_type);
        if(message != null) rend.push(<div key={key} className="history_message">{message}</div>)
        pre_day = day;
    });

    return (
        <div className="history_top">
            {rend}
        </div>
    )
}

export default History;
