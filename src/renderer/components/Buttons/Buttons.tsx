/**
 * @file Buttons.tsx
 * @brief ボタンの処理
 * @author Kazuya Yoshihara
 * @date 2021/09/10
 */
import React,{useState} from 'react'
import {Grid,Button} from '@material-ui/core';
import './Buttons.css'
import { BUTTONS_PARAM } from 'src/types';
/**
 * Buttons
 * @brief ボタン処理を記述するComponent
 * @param props ボタンに関するパラメータ
 * @returns JSX
 */
const Buttons = (props:BUTTONS_PARAM) => {
    console.log("button disabled? "+props.disabled);
    return (
        <Grid container className="grid-buttons">
            <Grid container justify="center">
            <Button className="grid-button-commuting" onClick={props.commuting_cb} disabled={props.disabled}>
                出勤
            </Button>
            <Button className="grid-button-leave-work" onClick={props.leave_work_cb} disabled={props.disabled}>
                退勤
            </Button>
            </Grid>
            <Grid container justify="center">
            <Button className="grid-button-rest" onClick={props.rest_cb} disabled={props.disabled}>
                {props.rest_text}
            </Button>
            <Button className="grid-button-go-out" onClick={props.go_out_cb} disabled={props.disabled}>
                {props.go_out_text}
            </Button>
            </Grid>
        </Grid>
    )
}

export default Buttons
