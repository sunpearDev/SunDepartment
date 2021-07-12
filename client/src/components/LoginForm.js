import React, { Component } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd';
import axios from 'axios'
import cookies from 'react-cookies'

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

export default class LoginForm extends Component {
    onFinish = (values) => {
        if (values.username != '' && values.password != '') {
            const host = 'https://' + window.location.hostname
            axios.post(host + ':5000/account/login', values).then(res => {
                if (res.data.status) {
                    message.success("Login successful!")
                    cookies.save('jwt', res.data.token)
                    cookies.save('username', res.data.username)
                    setTimeout(() => {
                        window.location.reload()
                        window.location = '/dashboard'
                    }, 1000)
                }
                else message.error(res.data.message)
            }).catch(err => {
                message.error(`${err}`)
            })
        }
    };
    render() {
        return (
            <Form
                {...layout}
                name="basic"
                initialValues={{ remember: true }}
                onFinish={this.onFinish}
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item {...tailLayout} name="remember" valuePropName="checked">
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item {...tailLayout} name="forget" >
                    Liên hệ bộ phận nhân sự nếu quên thông tin tài khoản
                </Form.Item>

                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        )
    }
}
