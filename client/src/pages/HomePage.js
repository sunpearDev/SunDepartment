import React, { Component } from 'react'
import '../css/HomePage.css'
const host = 'http://' + window.location.hostname

export default class HomePage extends Component {
    render() {
        return (
            <div className="landingview" style={{ backgroundImage: `url(${host}/images/view.jpg)` }}>
                <div className="h1-slider-caption">
                    <h1 data-animation="fadeInUp" data-delay=".4s" className style={{ animationDelay: '0.4s' }}>sun department</h1>
                    <h3 data-animation="fadeInDown" data-delay=".4s" className style={{ animationDelay: '0.4s' }}>The Best Hotel &amp; Resourt</h3>
                </div>
            </div>
        )
    }
}
