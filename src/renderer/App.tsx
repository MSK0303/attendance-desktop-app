import React,{useState,useEffect} from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'
import {ACTION_STATE, HISTORY_BUFFER, HISTORY_OBJECT} from '../types';
import History from "./components/History";

//react
import {Grid,Button} from '@material-ui/core';

const App: React.FC = () => {
  const [currentDate,setCurrentDate] = useState("2021/6/11(金)");
  const [restBtnText,setRestBtnText] = useState("休憩開始");
  const [GoOutBtnText,setGoOutBtnText] = useState("外出開始");
  const [history_buff,setHistoryBuff] = useState<HISTORY_OBJECT[]>([]);

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
    console.log(history_buff);
  },[]);

  

  return (
    <div className="main-view">
      <Grid container className="grid-top">
        {/*左側の画面 Calender表示 */}
        <Grid item xs={6} className="grid-calender">
          Calender
        </Grid>
        {/*右側の画面　上にボタン　下に履歴を表示 */}
        <Grid item xs={6} className="grid-contents">
          {/*ボタンの上の編集しようとしている日付の表示*/}
          <Grid container className="grid-date-line" justify="center" alignItems="center">
            {currentDate}
          </Grid>
          {/*ボタンのレイアウト */}
          <Grid container className="grid-buttons">
            <Grid container justify="center">
              <Button className="grid-button-commuting">
                出勤
              </Button>
              <Button className="grid-button-leave-work">
                退勤
              </Button>
            </Grid>
            <Grid container justify="center">
              <Button className="grid-button-rest">
                {restBtnText}
              </Button>
              <Button className="grid-button-go-out">
                {GoOutBtnText}
              </Button>
            </Grid>
          </Grid>
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
