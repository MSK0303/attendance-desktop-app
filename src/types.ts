import React from "react";

export enum ACTION_STATE {
    COMMUTING,      //出勤
    LEAVE_WORK,     //退勤
    REST_START,     //休憩開始
    REST_END,       //休憩終了
    GO_OUT_START,   //外出開始
    GO_OUT_END,     //外出終了
}

export interface HISTORY_OBJECT {
    date: Date,
    action_type:ACTION_STATE,
};

export interface HISTORY_BUFFER {
    buff: HISTORY_OBJECT[],
}

export interface BUTTONS_PARAM {
    rest_text:string,
    go_out_text:string,
    commuting_cb:React.MouseEventHandler<HTMLButtonElement>,
    leave_work_cb:React.MouseEventHandler<HTMLButtonElement>,
    rest_cb:React.MouseEventHandler<HTMLButtonElement>,
    go_out_cb:React.MouseEventHandler<HTMLButtonElement>,
}

type AttCalendarDayClickHandler = (date:Date) => void;

export interface CALENDAR_PARAM {
    click_day_cb:AttCalendarDayClickHandler,
}

export interface ATT_DETAIL_PARAM {
    date: string,
    commuting_time: string|undefined,
    leave_work_time: string|undefined,
    rest_time: string|undefined,
    go_out_time: string|undefined,
    total_work_time: string|undefined,
}

export interface START_END_TIMES {
    start:string|null,
    end:string|null,
}

export interface DATABASE_FORMAT {
    date:string,
    commuting:string|null,
    leave_work:string|null,
    rest_times:[START_END_TIMES]|null,
    go_out_times:[START_END_TIMES]|null,
}