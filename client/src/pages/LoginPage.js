import React, { Component } from 'react'
import { Col, Row } from "antd";
import LoginForm from '../components/LoginForm';
import '../css/LoginPage.css';


export default class LoginPage extends Component {
    render() {
        return (
            <Row className="login-container">
                <Col offset={8} className="login-form-wrapper" span={8}>
                    <h1>LOGIN</h1>
                    <LoginForm />
                </Col>
            </Row>
        )
    }
}
