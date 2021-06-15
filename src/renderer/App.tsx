import React,{useState,useEffect} from 'react'
import './App.css'
import { hot } from 'react-hot-loader/root'
import { remote } from 'electron'

//react
import {Grid,Button} from '@material-ui/core';

const App: React.FC = () => {
  const [currentDate,setCurrentDate] = useState("2021/6/11(金)");
  const [restBtnText,setRestBtnText] = useState("休憩開始");
  const [GoOutBtnText,setGoOutBtnText] = useState("外出開始");

  return (
    <div className="main-view">
      <Grid container className="grid-top">
        <Grid item xs={6} className="grid-calender">
          Calender
        </Grid>
        <Grid item xs={6} className="grid-contents">
          <Grid container className="grid-date-line" justify="center" alignItems="center">
            {currentDate}
          </Grid>
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
          <Grid container className="grid-note-header" justify="center" alignItems="center">
            履歴
          </Grid>
          <Grid container className="grid-note">
            Pre
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

export default hot(App)
