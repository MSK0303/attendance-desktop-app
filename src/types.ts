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