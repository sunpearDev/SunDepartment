import React, { Component } from 'react'
import { Col, Row } from "antd";
import ActiveAccountForm from '../components/ActiveAccountForm';

export default class ActiveAccountPage extends Component {
    render() {
        return (
            <Row className="login-container">
            <Col offset={8} className="login-form-wrapper" span={8}>
                <h1>ACIVE ACCOUNT</h1>
                <ActiveAccountForm />
            </Col>
        </Row>
        )
    }
}
