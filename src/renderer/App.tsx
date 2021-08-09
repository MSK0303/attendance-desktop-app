import React,{useState,useEffect} from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'
import {ACTION_STATE, BUTTONS_PARAM, HISTORY_BUFFER, HISTORY_OBJECT,DATABASE_FORMAT,START_END_TIMES} from '../types';
import History from "./components/History/History";
import Buttons from './components/Buttons/Buttons';
import AttCalendar from './components/AttCalendar/AttCalendar';
import AttDetail from './components/AttDetail/AttDetail';

//react
import {Grid,Button} from '@material-ui/core';

//import {getSampleData,setSampleData} from "../data/DatabaseManager";
import db from './datastore';
import Nedb from "nedb";

const App: React.FC = () => {
  const [restBtnText,setRestBtnText] = useState("休憩開始");
  const [GoOutBtnText,setGoOutBtnText] = useState("外出開始");
  const [history_buff,setHistoryBuff] = useState<HISTORY_OBJECT[]>([]);
  const [att_db_data,setAttDbData] = useState<DATABASE_FORMAT>({date:"",rest_times:null,go_out_times:null,commuting:null,leave_work:null});
  //const [datastore,setDataStore] = useState(db); //もしかしたら必要になるかも
  const STR_DAY_OF_WEEK_ARRAY = [ "日", "月", "火", "水", "木", "金", "土" ];

  /**************************************************************************************************
  *関数群
  **************************************************************************************************/
  //database access
  /**
   * 引数の日付の勤怠情報を取得します
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
            console.log(doc[0]);
            //DEBUG
            console.log("db.find:"+doc.length);
            if(data != null)
            {
              console.log(data);
              console.log("date : "+data.date);
              console.log("commuting : "+data.commuting);
              console.log("leave_work : "+data.leave_work);
              if(data.rest_times != null)
              {
                for (var item of data.rest_times){
                  console.log("rest start:"+item.start+","+"rest end:"+item.end);
                }
              }
              if(data.go_out_times != null)
              {
                for (var item of data.go_out_times){
                  console.log("go out start:"+item.start+","+"go out end:"+item.end);
                }
              }
            }
            //DEBUG ここまで
            resolve(data);
          }
          else
          {
            console.log("empty docs");
            reject("empty docs");
          }
        }
      })
    } )
  }
  //create
  /**
   * 出勤ボタンを押すときに呼ばれる。出勤情報のみをセットしてデータベースに新規保存
   */
  const createAttInfo = () => {
    if(att_db_data.commuting == null)
    {
      const str_now_time = getStrNowTime();
      let update_data : DATABASE_FORMAT;
      update_data = {...att_db_data};
      update_data.commuting = str_now_time;
      console.log("createAttInfo:"+update_data);
      db.insert(update_data,(error:Error|null,doc:DATABASE_FORMAT) => {
        if(error == null)
        {
          console.log("db.insert:");
          console.log(update_data);
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
   * 出勤情報の更新
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
          console.log("updateCommuting success");
          console.log(update_data);
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

  const updateLeaveWork = (is_force:boolean) => {
    return new Promise<boolean>((resolve,reject) => {
      //出勤している記録がないと退勤を
      if(att_db_data.commuting != null)
      {
        const str_now_time = getStrNowTime();
        let update_data : DATABASE_FORMAT;
        update_data = {...att_db_data};
        if( (att_db_data.leave_work == null) || is_force)
        {
          update_data.leave_work = str_now_time;
          const options = {};
          db.update({date:update_data.date},update_data,options,(error:Error|null,num_of_docs:number,upsert:boolean) => {
            if(error==null)
            {
              console.log("updateLeaveWork Success");
              console.log(update_data);
              setAttDbData(update_data);
              resolve(true);
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

  //delete

  //utility
  const getNumTimeFromStrTime = (str_time:string) : number => {
    const ary = str_time.split(':');
    const time = parseInt(ary[0],10)*60 + parseInt(ary[1],10);
    console.log("from "+str_time+" to "+time);
    return time;
  }

  const getStrTimeFromNumTime = (num_time:number) : string => {
    const hour = Math.floor(num_time/60);
    const min = num_time % 60;
    const str_time = hour + ":" + min;
    return str_time;
  }

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
  const calcTotalWorkTime = () : number => {
    let total_work_time : number = 0;
    if((att_db_data.commuting != null) && (att_db_data.leave_work != null))
    {
      total_work_time = (getNumTimeFromStrTime(att_db_data.leave_work) - getNumTimeFromStrTime(att_db_data.commuting)) - calcTotalRestTime() - calcTotalGoOutTime();
    }
    return total_work_time;
  }
  const getStrDate = () => {
    const date = new Date();
    return date.getFullYear() + "/" + ('0'+(date.getMonth()+1)).slice(-2) + "/" + ('0'+date.getDate()).slice(-2) + "(" + STR_DAY_OF_WEEK_ARRAY[date.getDay()] + ")";
  }

  const getStrTodayDate = () : string => {
    const current_date = new Date();
    const str_current_date =  current_date.getFullYear() + "/" + ('0'+(current_date.getMonth()+1)).slice(-2) + "/" + ('0'+current_date.getDate()).slice(-2);
    return str_current_date;
  }

  const getStrNowTime = () : string => {
    const current_date = new Date();
    return ('0' + current_date.getHours()).slice(-2) + ":" + ('0' + current_date.getMinutes()).slice(-2);
  }
  /**************************************************************************************************
  *useEffect
  **************************************************************************************************/

  //history関係
  useEffect(() => {
    //test
    const test_histories:HISTORY_OBJECT[] = [
      {
        date: new Date(2011,6,10,9,0,0),
        action_type: ACTION_STATE.COMMUTING
      },
      {
        date: new Date(2011,6,10,18,0,0),
        action_type: ACTION_STATE.LEAVE_WORK
      },
      {
        date: new Date(2011,6,11,9,0,0),
        action_type: ACTION_STATE.COMMUTING
      },
      {
        date: new Date(2011,6,11,18,0,0),
        action_type: ACTION_STATE.LEAVE_WORK
      }
    ];
    setHistoryBuff(test_histories);
  },[]);
  //出退勤データ関係
  useEffect(() => {
    const str_current_date =  getStrTodayDate();
    console.log("search "+str_current_date);
    getDateInfo(str_current_date).then((value:DATABASE_FORMAT) => {
      setAttDbData(value);
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

  const click_commuting_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_commuting_btn");
    createAttInfo();
  }
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
  const click_rest_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_rest_btn");
    if(restBtnText=="休憩開始")
    {
      setRestBtnText("休憩終了");
    }
    else
    {
      setRestBtnText("休憩開始");
    }
  }
  const click_go_out_btn = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    console.log("click_go_out_btn");
    if(GoOutBtnText=="外出開始")
    {
      setGoOutBtnText("外出終了");
    }
    else
    {
      setGoOutBtnText("外出開始");
    }
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
            <AttCalendar />
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
            {getStrDate()}
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
            <History buff={history_buff} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default hot(App)
