import React from "react";

/**
 * ACTION_STATE
 * 出退勤の状態
 */
export enum ACTION_STATE {
    COMMUTING,      //出勤
    LEAVE_WORK,     //退勤
    REST_START,     //休憩開始
    REST_END,       //休憩終了
    GO_OUT_START,   //外出開始
    GO_OUT_END,     //外出終了
}
/**
 * HISTORY_OBJECT
 * 履歴情報
 */
export interface HISTORY_OBJECT {
    date: Date,
    action_type:ACTION_STATE,
};
/**
 * HISTORY_BUFFER
 * 履歴情報のバッファ
 */
export interface HISTORY_BUFFER {
    buff: HISTORY_OBJECT[],
}
/**
 * BUTTONS_PARAM
 * Buttonコンポーネントに渡す情報
 */
export interface BUTTONS_PARAM {
    rest_text:string,
    go_out_text:string,
    commuting_cb:React.MouseEventHandler<HTMLButtonElement>,
    leave_work_cb:React.MouseEventHandler<HTMLButtonElement>,
    rest_cb:React.MouseEventHandler<HTMLButtonElement>,
    go_out_cb:React.MouseEventHandler<HTMLButtonElement>,
    disabled:boolean,
}

export type ClickDayCallback = (date:Date) => void;
export interface ATT_CALENDAR_PARAM {
    click_day_cb:ClickDayCallback,
};
/**
 * ATT_DETAIL_PARAM
 * 出退勤詳細コンポーネントに渡す情報
 */
export interface ATT_DETAIL_PARAM {
    date: string,
    commuting_time: string|undefined,
    leave_work_time: string|undefined,
    rest_time: string|undefined,
    go_out_time: string|undefined,
    total_work_time: string|undefined,
}
/**
 * START_END_TIMES
 * 開始と終了を記録するオブジェクト
 */
export interface START_END_TIMES {
    start:string|null,
    end:string|null,
}

/**
 * DATABASE_FORMAT
 * データベースのワンレコード
 */
export interface DATABASE_FORMAT {
    date:string,
    commuting:string|null,
    leave_work:string|null,
    rest_times:START_END_TIMES[]|null,
    go_out_times:START_END_TIMES[]|null,
}
