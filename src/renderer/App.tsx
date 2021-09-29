/**
 * @file App.tsx
 * @brief アプリのメイン処理
 * @author Kazuya Yoshihara
 * @date 2021/09/10
 */
import React,{useState,useEffect} from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'
import {ACTION_STATE, BUTTONS_PARAM, HISTORY_BUFFER, HISTORY_OBJECT,DATABASE_FORMAT,START_END_TIMES} from '../types';
import History from "./components/History/History";
import Buttons from './components/Buttons/Buttons';
import AttCalendar from './components/AttCalendar/AttCalendar';
import AttDetail from './components/AttDetail/AttDetail';
import {Grid} from '@material-ui/core';

import db from './datastore';
import history_db from './historyds';
import Nedb from "nedb";

/**
 * App
 * @brief メイン処理を記述するComponent
 * @returns JSX
 */
const App: React.FC = () => {
  /** 休憩ボタンの文字 */
  const [restBtnText,setRestBtnText] = useState("休憩開始");
  /** 外出ボタンの文字 */
  const [GoOutBtnText,setGoOutBtnText] = useState("外出開始");
  /** 履歴30件の情報 */
  const [history_buff,setHistoryBuff] = useState<HISTORY_BUFFER>({buff:[]});
  /** 選択している出退勤の情報 */
  const [att_db_data,setAttDbData] = useState<DATABASE_FORMAT>({date:"",rest_times:null,go_out_times:null,commuting:null,leave_work:null});
  /** 曜日文字の配列 */
  const STR_DAY_OF_WEEK_ARRAY = [ "日", "月", "火", "水", "木", "金", "土" ];

  /**************************************************************************************************
  *関数群
  **************************************************************************************************/
  //database access
  /**
   * getDateInfo
   * @brief 引数の日付の勤怠情報を取得します
   * @param str_date 勤怠情報を取得したい日付。ex. "2021/6/21"
   * @returns Promise<DATABASE_FORMAT>
   */
  const getDateInfo = (str_date:string) => {
    return new Promise<DATABASE_FORMAT>((resolve,reject) => {
      db.find({date:str_date},(err:Error|null,doc:any[]) => {
        if(err)
        {
          console.log("db.find error occured");
          reject(err);
        }
        else
        {
          if(doc.length > 0)
          {
            const data:DATABASE_FORMAT = doc[0];
            resolve(data);
          }
          else
          {
            reject("empty docs");
          }
        }
      })
    } )
  }
  //create
  /**
   * createAttInfo
   * @brief 出勤ボタンを押すときに呼ばれる。出勤情報のみをセットしてデータベースに新規保存
   */
  const createAttInfo = () => {
    if(att_db_data.commuting == null)
    {
      const str_now_time = getStrNowTime();
      let update_data : DATABASE_FORMAT;
      update_data = {...att_db_data};
      update_data.commuting = str_now_time;
      db.insert(update_data,(error:Error|null,doc:DATABASE_FORMAT) => {
        if(error == null)
        {
          updateHistoryDB(new Date(),ACTION_STATE.COMMUTING).then((value:boolean) => {
          });
          setAttDbData(update_data);
        }
        else
        {
          console.log(error);
        }
      });
    }
    else
    {
      console.log("already set commuting");
    }
  }
  //update
  /**
   * updateCommuting
   * @brief 出勤情報の更新
   */
  const updateCommuting = () => {
    if(att_db_data.commuting != null)
    {
      const str_now_time = getStrNowTime();
      //次のように新しい変数に更新情報を入れて、setAttDbDataでセットしないと再レンダリングされない
      let update_data : DATABASE_FORMAT;
      update_data = {...att_db_data};
      update_data.commuting = str_now_time;
      const options = {};
      db.update({date:update_data.date},update_data,options,(error:Error|null,num_of_docs:number,upsert:boolean) => {
        if(error==null)
        {
          setAttDbData(update_data);
        }
        else
        {
          console.log("updateCommuting failed : "+error);
        }
      });
    }
    else
    {
      console.log("nothing commuting date");
    }
  }
  /**
   * updateLeaveWork
   * @brief 退勤時間を追加して更新
   * @param is_force 強制的に上書きするかどうか
   * @returns Promise<boolean>
   */
  const updateLeaveWork = (is_force:boolean) => {
    return new Promise<boolean>((resolve,reject) => {
      //出勤している記録がないと退勤をさせない
      if(att_db_data.commuting != null)
      {
        const str_now_time = getStrNowTime();
        let update_data : DATABASE_FORMAT;
        update_data = {...att_db_data};
        //退勤処理がされてない、または強制的に書き変える場合はupdate
        if( (att_db_data.leave_work == null) || is_force)
        {
          update_data.leave_work = str_now_time;
          const options = {};
          db.update({date:update_data.date},update_data,options,(error:Error|null,num_of_docs:number,upsert:boolean) => {
            if(error==null)
            {
              updateHistoryDB(new Date(),ACTION_STATE.LEAVE_WORK).then((value:boolean) => {
                resolve(true);
              });
              setAttDbData(update_data);
            }
            else
            {
              console.log("updateLeaveWork failed : "+error);
              reject("db.update failed");
            }
          });
        }
        else
        {
          console.log("already exists leave time & is_force = false");
          resolve(false);
        }
      }
      else
      {
        reject("commuting time does not exist");
      }
    });
  }
  /**
   * updateRestStartTime
   * @brief 休憩スタートの時間を追加して更新
   * @param str_now_time 現在時刻の文字列
   * @returns Promise<boolean>
   */
  const updateRestStartTime = (str_now_time:string) => {
    return new Promise<boolean>((resolve,reject) => {
      let update_data : DATABASE_FORMAT;
      update_data = {...att_db_data};
      //この場合、新規にSTART_END_TIMES要素を作成
      const add_rest_time:START_END_TIMES = {start:str_now_time,end:null};
      let update_rest_times:START_END_TIMES[] = [];
      //休憩が１個もない場合もあるので、ある場合とない場合で処理を変更
      if(update_data.rest_times != null)
      {
        //update_rest_times = [...update_data.rest_times]; //下はこの行みたいに書けるのでは？
        update_data.rest_times.map((item) => {
          update_rest_times.push(item);
        })
        update_rest_times.push(add_rest_time);
      }
      else
      {
        update_rest_times = [add_rest_time];
      }
      update_data.rest_times = update_rest_times;
      db.update({date:update_data.date},update_data,{},(error:Error|null,num_of_docs:number,upsert:boolean) => {
        if(error==null)
        {
          updateHistoryDB(new Date(),ACTION_STATE.REST_START).then((value:boolean) => {
            resolve(true);
          });
          setAttDbData(update_data);
        }
        else
        {
          console.log("updateRestStartTime failed : "+error);
          reject("db.update failed");
        }
      });
    });
  }
  /**
   * updateRestEndTime
   * @brief 休憩終了の時間を追加して更新
   * @param str_now_time 現在時刻の文字列
   * @returns Promise<boolean>
   */
  const updateRestEndTime = (str_now_time:string) => {
    return new Promise<boolean>((resolve,reject) => {
      let update_data : DATABASE_FORMAT;
      update_data = {...att_db_data};
      if(update_data.rest_times != null)
      {
        if(update_data.rest_times[update_data.rest_times.length-1].end == null)
        {
          //今の時間を追加
          update_data.rest_times[update_data.rest_times.length-1].end = str_now_time;
          db.update({date:update_data.date},update_data,{},(error:Error|null,num_of_docs:number,upsert:boolean) => {
            if(error==null)
            {
              updateHistoryDB(new Date(),ACTION_STATE.REST_END).then((value:boolean) => {
                resolve(true);
              });
              setAttDbData(update_data);
            }
            else
            {
              console.log("updateRestEndTime failed : "+error);
              reject("db.update failed");
            }
          });
        }
        else
        {
          reject("corresponding rest start time not exist");
        }
      }
      else
      {
        reject("rest times array is null");
      }
    });
  }
  /**
   * updateRestTimes
   * @brief 休憩時間を更新
   * @param state REST_STARTまたはREST_ENDのみ有効 休憩開始か終了か
   * @returns Promise<boolean>
   */
  const updateRestTimes = (state:ACTION_STATE) => {
    return new Promise<boolean>((resolve,reject) => {
      //出勤している記録がないと休憩をさせない
      //かつ、退勤前
      if( (att_db_data.commuting != null) && (att_db_data.leave_work == null) )
      {
        const str_now_time = getStrNowTime();
        //休憩開始か終了か
        if(state == ACTION_STATE.REST_START)
        {
          updateRestStartTime(str_now_time).then((val:boolean) => {
            resolve(val);
          },(reason:string) => {
            reject(reason);
          })
        }
        else if(state == ACTION_STATE.REST_END)
        {
          updateRestEndTime(str_now_time).then((val:boolean) => {
            resolve(val);
          },(reason:string) => {
            reject(reason);
          })
        }
        else
        {
          reject("updateRestTimes state failed");
        }
      }
      else
      {
        reject("commuting time does not exist|leave work time already exist");
      }
    });
  }
  /**
   * updateGoOutStartTime
   * @brief 外出スタートの時間を追加して更新
   * @param str_now_time 現在時刻の文字列
   * @returns Promise<boolean>
   */
  const updateGoOutStartTime = (str_now_time:string) => {
    return new Promise<boolean>((resolve,reject) => {
      let update_data : DATABASE_FORMAT;
      update_data = {...att_db_data};
      //新規にSTART_END_TIMES要素を作成
      const add_go_out_time:START_END_TIMES = {start:str_now_time,end:null};
      let update_go_out_times:START_END_TIMES[] = [];
      //外出が１つもない場合もあるので、ある場合とない場合で処理を変更
      if(update_data.go_out_times != null)
      {
        //update_go_out_times = {...update_data.go_out_times};
        update_data.go_out_times.map((item) => {
          update_go_out_times.push(item);
        })
        update_go_out_times.push(add_go_out_time);
      }
      else
      {
        update_go_out_times = [add_go_out_time];
      }
      update_data.go_out_times = update_go_out_times;
      db.update({date:update_data.date},update_data,{},(error:Error|null,num_of_docs:number,upsert:boolean) => {
        if(error==null)
        {
          updateHistoryDB(new Date(),ACTION_STATE.GO_OUT_START).then((value:boolean) => {
            resolve(true);
          });
          setAttDbData(update_data);
        }
        else
        {
          console.log("updateGoOutStartTime failed : "+error);
          reject("db.update failed");
        }
      });
    });
  }
  /**
   * updateGoOutEndTime
   * @brief 外出時間を更新
   * @param str_now_time 
   * @returns Promise<boolean>
   */
  const updateGoOutEndTime = (str_now_time:string) => {
    return new Promise<boolean>((resolve,reject) => {
      let update_data : DATABASE_FORMAT;
      update_data = {...att_db_data};
      if(update_data.go_out_times != null)
      {
        if(update_data.go_out_times[update_data.go_out_times.length-1].end == null)
        {
          //今の時間を追加
          update_data.go_out_times[update_data.go_out_times.length-1].end = str_now_time;
          db.update({date:update_data.date},update_data,{},(error:Error|null,num_of_docs:number,upsert:boolean) => {
            if(error==null)
            {
              updateHistoryDB(new Date(),ACTION_STATE.GO_OUT_END).then((value:boolean) => {
                resolve(true);
              });
              setAttDbData(update_data);
            }
            else
            {
              console.log("updateGoOutEndTime failed : "+error);
              reject("db.update failed");
            }
          });
        }
        else
        {
          reject("corresponding rest start time not exist");
        }
      }
      else
      {
        reject("go out times array is null");
      }
    });
  }
  /**
   * updateGoOutTIme
   * @brief 外出時間を記録
   * @param state GO_OUT_STARTまたはGO_OUT_ENDのみ有効　外出開始か終了か
   * @returns Promise<boolean>
   */
  const updateGoOutTIme = (state:ACTION_STATE) => {
    return new Promise<boolean>((resolve,reject) => {
      //出勤後、退勤前なら外出を記録可能
      if((att_db_data.commuting != null) && (att_db_data.leave_work == null))
      {
          const str_now_time = getStrNowTime();
          if(state==ACTION_STATE.GO_OUT_START)
          {
            updateGoOutStartTime(str_now_time).then((val:boolean) => {
              resolve(val);
            },(reason:string) => {
              reject(reason);
            })
          }
          else if(state==ACTION_STATE.GO_OUT_END)
          {
            updateGoOutEndTime(str_now_time).then((val:boolean) => {
              resolve(val);
            },(reason:string) => {
              reject(reason);
            })
          }
          else
          {
            reject("updateGoOutTIme state failed");
          }
      }
      else
      {
        reject("commuting time does not exist|leave work time already exist");
      }
    });
  }
  //delete


  //History Database
  //get
  const getHistoryDB = () => {
    return new Promise<HISTORY_BUFFER>((resolve,reject) => {
      history_db.find({}).sort({date:1}).exec((err:Error|null,doc:any[]) => {
        if(err)
        {
          console.log("history db.find error");
          reject(err);
        }
        else
        {
          if(doc.length > 0)
          {
            if(doc != null)
            {
              const ret_db:HISTORY_BUFFER = {buff:[]};
              doc.map((item) => {
                ret_db.buff.push(item);
              });
              resolve(ret_db);
            }
            else
            {
              console.log("empty history");
              reject("empty history");
            }
          }
        }
      });
    });
  }
  //update
  const updateHistoryDB = (date:Date,type:ACTION_STATE) => {
    return new Promise<boolean>((resolve,reject) => {
      const new_hist_buff:HISTORY_BUFFER = {buff:[]};
      //30件以上なら最初の１件を削除
      if(history_buff.buff.length >= 30)
      {
        console.log("history length over 30");
        history_db.remove({date:history_buff.buff[0].date},{},(error:Error|null,n:number) => {
          if(error == null)
          {
            console.log("history db first element delete");
            history_buff.buff.map((item,index) => {
              if(index != 0)
              {
                new_hist_buff.buff.push(item);
              }
            });
          }
          else
          {
            reject(error);
          }
        });
      }
      else
      {
        //30件ないなら変更用のバッファに今までのhistoryを入れる
        history_buff.buff.map((item) => {
          new_hist_buff.buff.push(item);
        });
      }
      //追加
      const new_history:HISTORY_OBJECT = {date:date,action_type:type};
      history_db.insert(new_history,(error:Error|null,doc:HISTORY_OBJECT) => {
        if(error == null)
        {
          new_hist_buff.buff.push(new_history);
          setHistoryBuff(new_hist_buff);
        }
        else
        {
          reject(error);
          console.log(error);
        }
      });
      
    });
  }
  //utility
  /**
   * getNumTimeFromStrTime
   * @brief 文字列の時間から、0時を0としての総分数を計算
   * @param str_time 文字列の時間
   * @returns 総分数
   */
  const getNumTimeFromStrTime = (str_time:string) : number => {
    const ary = str_time.split(':');
    const time = parseInt(ary[0],10)*60 + parseInt(ary[1],10);
    return time;
  }
  /**
   * getStrTimeFromNumTime
   * @brief 総分数から時間を計算
   * @param num_time  総分数
   * @returns 文字列の時間
   */
  const getStrTimeFromNumTime = (num_time:number) : string => {
    const hour = Math.floor(num_time/60);
    const min = num_time % 60;
    const str_time = hour + ":" + min;
    return str_time;
  }
  /**
   * calcTotalRestTime
   * @brief 総休憩時間を計算
   * @returns 総休憩時間
   */
  const calcTotalRestTime = () : number => {
    let total_rest_time : number = 0;
    if(att_db_data.rest_times != null)
    {
      for (var item of att_db_data.rest_times)
      {
        if((item.start != null) && (item.end != null))
        {
          total_rest_time += (getNumTimeFromStrTime(item.end) - getNumTimeFromStrTime(item.start));
        }
      }
    }
    return total_rest_time;
  }
  /**
   * calcTotalGoOutTime
   * @brief 総外出時間を計算
   * @returns 総外出時間
   */
  const calcTotalGoOutTime = () : number => {
    let total_go_out_time : number = 0;
    if(att_db_data.go_out_times!=null)
    {
      for (var item of att_db_data.go_out_times)
      {
        if((item.start != null) && (item.end != null))
        {
          total_go_out_time += (getNumTimeFromStrTime(item.end) - getNumTimeFromStrTime(item.start));
        }
      }
    }
    return total_go_out_time;
  }
  /**
   * calcTotalWorkTime
   * @brief 総勤務時間の計算
   * @returns 総勤務時間
   */
  const calcTotalWorkTime = () : number => {
    let total_work_time : number = 0;
    if((att_db_data.commuting != null) && (att_db_data.leave_work != null))
    {
      total_work_time = (getNumTimeFromStrTime(att_db_data.leave_work) - getNumTimeFromStrTime(att_db_data.commuting)) - calcTotalRestTime() - calcTotalGoOutTime();
    }
    return total_work_time;
  }
  /**
   * getStrDate
   * @brief 指定した日付を文字列で返却
   * @param date 文字列にしたいDate変数
   * @returns 変換した文字列日付
   */
  const getStrDate = (date:Date) : string => {
    return date.getFullYear() + "/" + ('0'+(date.getMonth()+1)).slice(-2) + "/" + ('0'+date.getDate()).slice(-2);// + "(" + STR_DAY_OF_WEEK_ARRAY[date.getDay()] + ")";
  }
  /**
   * getStrTodayDate
   * @brief 文字列で今日の日付を返却
   * @returns 今日の日付
   */
  const getStrTodayDate = () : string => {
    const current_date = new Date();
    const str_current_date =  current_date.getFullYear() + "/" + ('0'+(current_date.getMonth()+1)).slice(-2) + "/" + ('0'+current_date.getDate()).slice(-2);
    return str_current_date;
  }
  /**
   * getStrNowTime
   * @brief 現在の時分を文字列として返却
   * @returns 今の時分の文字列
   */
  const getStrNowTime = () : string => {
    const current_date = new Date();
    return ('0' + current_date.getHours()).slice(-2) + ":" + ('0' + current_date.getMinutes()).slice(-2);
  }
  /**
   * determineRestBtn
   * @brief 休憩ボタンの文字列を決定
   * @param att 出退勤の情報
   */
  const determineRestBtn = (att:DATABASE_FORMAT) => {
    if(att.rest_times != null)
    {
      if((att.rest_times[att.rest_times.length-1].start!=null)&&(att.rest_times[att.rest_times.length-1].end == null))
      {
        setRestBtnText("休憩終了");
      }
      else
      {
        setRestBtnText("休憩開始");
      }
    }
    else
    {
      setRestBtnText("休憩開始");
    }
  }
  /**
   * determineGoOutBtn
   * @brief 外出ボタンの文字列を決定
   * @param att 出退勤の情報
   */
  const determineGoOutBtn = (att:DATABASE_FORMAT) => {
    if(att.go_out_times != null)
    {
      if((att.go_out_times[att.go_out_times.length-1].start!=null)&&(att.go_out_times[att.go_out_times.length-1].end == null))
      {
        setGoOutBtnText("外出終了");
      }
      else
      {
        setGoOutBtnText("外出開始");
      }
    }
    else
    {
      setGoOutBtnText("外出開始");
    }
  }
  /**************************************************************************************************
  *useEffect
  **************************************************************************************************/
  //history関係
  useEffect(() => {
    getHistoryDB().then((value:HISTORY_BUFFER) => {
      console.log("Success History");
      setHistoryBuff(value);
    },(reason) => {
      console.log(reason);
      //ここでポップアップしたりしてエラーを通知
    });
  },[]);
  //出退勤データ関係
  useEffect(() => {
    const str_current_date =  getStrTodayDate();
    console.log("search "+str_current_date);
    getDateInfo(str_current_date).then((value:DATABASE_FORMAT) => {
      setAttDbData(value);
      determineRestBtn(value);
      determineGoOutBtn(value);
      console.log(att_db_data);
    },(reason) => {
      console.log("att info nothing");
      const value:DATABASE_FORMAT = {date:str_current_date,rest_times:null,go_out_times:null,commuting:null,leave_work:null}
      setAttDbData(value);
    });
  },[]);
  /**************************************************************************************************
  *ui handler
  **************************************************************************************************/
  /**
   * click_commuting_btn
   * @brief 出勤ボタンをクリック
   * @param e マウスイベント
   */
  const click_commuting_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_commuting_btn");
    createAttInfo();
  }
  /**
   * click_leave_work_btn
   * @brief 退勤ボタンをクリック
   * @param e マウスイベント
   */
  const click_leave_work_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_leave_work_btn");
    updateLeaveWork(false).then((value:boolean) => {
      if(!value)
      {
        //すでに退勤情報が存在している場合
        console.log("leave work time already exists!. Message box show");
      }
    },(reason) => {

    });
  }
  /**
   * click_rest_btn
   * @brief 休憩ボタンをクリック
   * @param e マウスイベント
   */
  const click_rest_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_rest_btn");
    if(restBtnText=="休憩開始")
    {
      updateRestTimes(ACTION_STATE.REST_START);
      setRestBtnText("休憩終了");
    }
    else
    {
      updateRestTimes(ACTION_STATE.REST_END);
      setRestBtnText("休憩開始");
    }
  }
  /**
   * click_go_out_btn
   * @brief 外出ボタンをクリック
   * @param e マウスイベント
   */
  const click_go_out_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_go_out_btn");
    if(GoOutBtnText=="外出開始")
    {
      updateGoOutTIme(ACTION_STATE.GO_OUT_START);
      setGoOutBtnText("外出終了");
    }
    else
    {
      updateGoOutTIme(ACTION_STATE.GO_OUT_END);
      setGoOutBtnText("外出開始");
    }
  }

  const click_att_cal_day = (date:Date) => {
    console.log("click_att_cal_day");
    console.log(date);
    const str_current_date =  getStrDate(date);
    console.log("search "+str_current_date);
    getDateInfo(str_current_date).then((value:DATABASE_FORMAT) => {
      setAttDbData(value);
      console.log(att_db_data);
    },(reason) => {
      console.log("att info nothing");
      const value:DATABASE_FORMAT = {date:str_current_date,rest_times:null,go_out_times:null,commuting:null,leave_work:null}
      setAttDbData(value);
    });
  }
  /**************************************************************************************************
  *JSX
  **************************************************************************************************/

  return (
    <div className="main-view">
      <Grid container className="grid-top">
        {/*左側の画面 */}
        <Grid item xs={6} className="grid-calendar">
          {/*左上側　Calender表示  */}
          <Grid container className="grid-calendar-top">
            <AttCalendar click_day_cb={click_att_cal_day}/>
          </Grid>
          {/*左下側　詳細画面表示  */}
          <Grid container className="grid-calendar-bottom">
            <AttDetail date={att_db_data.date} commuting_time={att_db_data.commuting != null ? att_db_data.commuting : ""} leave_work_time={att_db_data.leave_work != null ? att_db_data.leave_work : ""} rest_time={getStrTimeFromNumTime(calcTotalRestTime())} go_out_time={getStrTimeFromNumTime(calcTotalGoOutTime())} total_work_time={getStrTimeFromNumTime(calcTotalWorkTime())}/>
          </Grid>
        </Grid>
        {/*右側の画面　上にボタン　下に履歴を表示 */}
        <Grid item xs={6} className="grid-contents">
          {/*ボタンの上の編集しようとしている日付の表示*/}
          <Grid container className="grid-date-line" justify="center" alignItems="center">
            {getStrTodayDate()}
          </Grid>
          {/*ボタンのレイアウト */}
            <Buttons rest_text={restBtnText} go_out_text={GoOutBtnText}
              commuting_cb={click_commuting_btn} leave_work_cb={click_leave_work_btn}
              rest_cb={click_rest_btn} go_out_cb={click_go_out_btn} />
          {/*履歴の上のヘッダ */}
          <Grid container className="grid-note-header" justify="center" alignItems="center">
            履歴
          </Grid>
          {/*履歴画面 */}
          <Grid container className="grid-note">
            {history_buff.buff != undefined ? <History buff={history_buff.buff} /> : <History buff={[]} />}
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default hot(App)
