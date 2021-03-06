import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Arc from './Arc/Arc'
import Track from './Track/Track'
import Thumb from './Thumb/Thumb'
import './CircularSlider'

import {
    toDeg,
    toRad,
    getRelativeAngle,
    toMin,
    toStringTime,
    startEndDiff
} from './utils'
import ClockFace from './ClockFace/ClockFace';

class CircularSlider extends Component {

    static propTypes = {
        r: PropTypes.number,
        initialAngle: PropTypes.number,
        value: PropTypes.number,
        trackWidth: PropTypes.number,
        trackColor: PropTypes.string,
        arcColor: PropTypes.string,
        thumbWidth: PropTypes.number,
        thumbColor: PropTypes.string,
        thumbBorderWidth: PropTypes.number,
        thumbBorderColor: PropTypes.string,
        onChange: PropTypes.func,
        onChangeThumbStart: PropTypes.func,
        onChangeThumbEnd: PropTypes.func
    }

    static defaultProps = {
        r: 100,
        initialAngle: 90,
        value: undefined,
        trackWidth: 30,
        trackColor: '#f5f5dc',
        arcColor: '#7985f1',
        thumbWidth: 20,
        thumbColor: 'white',
        thumbBorderWidth: 5,
        thumbBorderColor: '#7985f1',
        onChange: value => { },
        onChangeThumbStart: value => { },
        onChangeThumbEnd: value => { }
    }

    constructor(props) {
        super(props)
        document.addEventListener('touchend', this.thumbLeave);
        document.addEventListener('mouseup', this.thumbLeave);

        this.handleStart = 0
        this.handleEnd = 0
        this.timeRangeStr = '00h 00m'
    }

    componentDidMount() {
        this.offsets = this.refs.circularSlider.getBoundingClientRect()
        this.setState({ offsets: this.offsets })
    }

    angleEnd = () => {
        // here we give a % of 

        const ang = getRelativeAngle((this.props.thumbEnd / 100) * 360, this.props.initialAngle)
            || this.state.angle
            || this.props.initialAngle
        return ang
    }

    angleStart = () => {
        // here we give a % of 
        const ang = getRelativeAngle((this.props.thumbStart / 100) * 360, this.props.initialAngle)
            || this.state.angle
            || this.props.initialAngle
        return ang
    }

    thumbSelect = (e) => {
        if (e.target.className === "handleEnd") {
            document.addEventListener('touchmove', this.moveThumbEnd)
            document.addEventListener('mousemove', this.moveThumbEnd)
        }

        if (e.target.className === "handleStart") {
            document.addEventListener('touchmove', this.moveThumbStart)
            document.addEventListener('mousemove', this.moveThumbStart)
        }
    }

    thumbLeave = (e) => {
        document.removeEventListener('touchmove', this.moveThumbEnd)
        document.removeEventListener('mousemove', this.moveThumbEnd)
        document.removeEventListener('touchmove', this.moveThumbStart)
        document.removeEventListener('mousemove', this.moveThumbStart)
    }

    moveThumbEnd = evt => {
        const event = evt.changedTouches
            ? evt.changedTouches[0]
            : evt

        // the next line will limit the slider to a max of 360 degree
        // const angle = pipe(this.calculateAngle(event.clientX, event.clientY),this.limitAngleVariation)
        const angle = this.calculateAngle(event.clientX, event.clientY)

        // not sure if this check is neccessary
        if (!this.props.thumbEnd) this.setState({ angle })
        this.handleChangeThumbEnd(angle)
    }

    moveThumbStart = evt => {
        const event = evt.changedTouches
            ? evt.changedTouches[0]
            : evt

        // the next line will limit the slider to a max of 360 degree
        // const angle = pipe(this.calculateAngle(event.clientX, event.clientY),this.limitAngleVariation)
        const angle = this.calculateAngle(event.clientX, event.clientY)

        // not sure if this check is neccessary
        if (!this.props.thumbStart) this.setState({ angle })
        this.handleChangeThumbStart(angle)
    }

    calculateAngle = (mouseX, mouseY) => {
        const x = mouseX - this.props.r - this.offsets.left
        const y = -mouseY + this.props.r + this.offsets.top
        const angle = toDeg(Math.atan(y / x))
            + ((x < 0) ? 180 : 0)
            + ((x >= 0 && y < 0) ? 360 : 0)
        return angle
    }

    // this limits the slider to not go over 360 degree
    limitAngleVariation = angle => {
        const nextRelativeAngle = getRelativeAngle(angle, this.props.initialAngle)
        const currentRelativeAngle = getRelativeAngle(this.angle(), this.props.initialAngle)

        const ang = (
            (nextRelativeAngle < currentRelativeAngle + this.limitAngleFactor) &&
            (nextRelativeAngle > currentRelativeAngle - this.limitAngleFactor)
        )
            ? angle
            : this.angle()

        return ang
    }

    calculateThumbPosition = angle => {
        const { r, trackWidth } = this.props

        const x = (Math.cos(toRad(angle))
            * (r + (trackWidth / 2))
            + r + trackWidth) - (trackWidth / 1.5)

        const y = (-Math.sin(toRad(angle))
            * (r + (trackWidth / 2))
            + r + trackWidth) - (trackWidth / 1.5)

        // added the border diff
        return { x, y }
    }

    handleChangeThumbEnd = angle => {
        const percent = (getRelativeAngle(angle, this.props.initialAngle) / 360) * 100
        this.props.onChangeThumbEnd(percent > 100 ? percent + 100 : percent)
    }

    handleChangeThumbStart = angle => {
        let percent = (getRelativeAngle(angle, this.props.initialAngle) / 360) * 100
        this.props.onChangeThumbStart(percent > 100 ? percent + 100 : percent)
    }

    limitAngleFactor = 0
    ref = React.createRef()
    state = {
        angle: undefined,
        offsets: {
            bottom: 300, height: 160, left: 80, right: 240, top: 140, width: 160, x: 80, y: 140
        }
    }

    render() {
        return (
            <div id="circular-slider"
                style={{
                    width: this.props.r * 2,
                    height: this.props.r * 2,
                    position: 'relative',
                    margin: '30px auto'
                }}
                ref="circularSlider"
            >
                <ClockFace
                    borderOffSet={this.props.trackWidth}
                    radius={this.props.r}
                    parentBounds={this.state.offsets}
                ></ClockFace>

                <Track
                    width={this.props.trackWidth}
                    color={this.props.trackColor}
                />

                <Arc
                    r={this.props.r}
                    angle={this.angleEnd()}
                    initialAngle={this.angleStart()}
                    width={this.props.trackWidth}
                    color={this.props.arcColor}
                />
                <Thumb
                    handleType="handleEnd"
                    diameter={this.props.thumbWidth}
                    color={this.props.thumbColor}
                    borderWidth={this.props.thumbBorderWidth}
                    borderColor={this.props.thumbBorderColor}
                    position={this.calculateThumbPosition(this.angleEnd())}
                    handleSelect={this.thumbSelect}
                />

                <Thumb
                    handleType="handleStart"
                    diameter={this.props.thumbWidth}
                    color={this.props.thumbColor}
                    borderWidth={this.props.thumbBorderWidth}
                    borderColor={this.props.thumbBorderColor}
                    position={this.calculateThumbPosition(this.angleStart())}
                    handleSelect={this.thumbSelect}
                />
            </div>
        )
    }
}

export default CircularSlider

export {
    pipe,
    toDeg,
    toRad,
    getRelativeAngle
} from './utils'
