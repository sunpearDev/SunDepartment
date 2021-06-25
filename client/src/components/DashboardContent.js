import React, { useState, useEffect } from 'react'
import EditAbleTable from './EditAbleTable'
import { Row, Col, message } from 'antd'
import Modal from './OpenModal';
import SearchBox from './SearchBox'
import axios from 'axios'
import cookies from 'react-cookies'
const host = 'http://' + window.location.hostname


const DashboardContent = (props) => {
    const [categorys, setCategory] = useState([])
    const [finished, setFinished] = useState(false)
    const [searchResults, setSearchResults] = useState(undefined)
    const [transition, setTransition] = useState(undefined)
    const receiveFinished = async (value) => {
        setFinished(value)
        if (value) await setTimeout(() => { setFinished(false) }, 1000)
    }
    const receiveSearchResult = (value) => {
        setSearchResults(value)
    }
    const receiveAction = (path, value) => {
        if (path !== undefined && value !== undefined) {
            axios.put(`${host}:5000${path}`, { jwt: cookies.load('jwt') }).then(async response => {
                console.log(response)
                if (response.data.status) {
                    setFinished(true)
                    await setTimeout(() => { setFinished(false) }, 1000)
                } else message.error(response.data.message)
            })
        }

    }
    const receiveTransition = async (transit) => {
        if (transit !== undefined) {
            setTransition(transit)
            await setTimeout(() => { setTransition(undefined) }, 2000)
        }

    }

    useEffect(() => {
        if (cookies.load('jwt') !== undefined)
            switch (props.menu) {
                case 'account':
                    axios.post(host + ':5000/account_category', { jwt: cookies.load('jwt') }).then(response => {
                        if (response.data.status) {
                            let temp = []
                            response.data.categorys.map(item => {
                                temp.push({ key: item.category_ID, value: item.category_name })
                            })
                            setCategory(temp)
                        } else message.error(response.data.message)
                    })
                    break
                case 'customer':
                case 'room':
                    axios.post(host + ':5000/room_category/getAll', { jwt: cookies.load('jwt') }).then(response => {
                        if (response.data.status) {
                            let temp = []
                            response.data.list.map(item => {
                                temp.push({ key: item.room_category_ID, value: item.room_category_name, max: item.available })
                            })
                            setCategory(temp)
                        } else message.error(response.data.message)
                    })
                    break
                case 'order':
                    axios.post(host + ':5000/customer/getAll', { jwt: cookies.load('jwt') }).then(response => {
                        if (response.data.status) {
                            let temp = []
                            response.data.list.map(item => {
                                temp.push({ key: item.customer_ID, value: item.customer_name })
                            })
                            setCategory(temp)
                        } else message.error(response.data.message)
                    })
                    break
                case 'service':
                    axios.post(host + ':5000/account/find', { jwt: cookies.load('jwt'), findText: 'dichvu' }).then(response => {
                        if (response.data.status) {
                            let temp = []
                            response.data.list.map(item => {
                                temp.push({ key: item.account_ID, value: item.username })
                            })
                            setCategory(temp)
                        } else message.error(response.data.message)
                    })
                    break
                case 'order_detail':
                case 'service_detail':
                    axios.post(host + ':5000/service/getAll', { jwt: cookies.load('jwt') }).then(response => {
                        if (response.data.status) {
                            let temp = []
                            response.data.list.map(item => {
                                if (props.menu === 'order_detail') {
                                    if (item.state === 'availabled')
                                        temp.push({ key: item.service_ID, value: item.service_name })
                                }
                                else
                                    temp.push({ key: item.service_ID, value: item.service_name })
                            })
                            setCategory(temp)

                        } else message.error(response.data.message)
                    })
                    break
                default:
            }
    });

    if (props.menu !== '') {
        let result = [];
        switch (props.menu) {
            case 'account':
                result.push(<Row>
                    <Col span={8}>
                        <Modal title="Thêm tài khoản" manage={props.menu} categorys={categorys} finished={receiveFinished} />
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'customer':
                result.push(<Row>
                    <Col span={8}>
                        <Modal title="Thêm khách hàng" manage={props.menu} finished={receiveFinished} />
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'room_category':
                if (props.category !== 'letan')
                    result.push(<Row>
                        <Col span={8}>
                            <Modal title="Thêm loại phòng" manage={props.menu} finished={receiveFinished} />
                        </Col>
                        <Col span={8} offset={8}>
                            <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                        </Col>
                    </Row>)
                break
            case 'room':
                result.push(<Row>
                    <Col span={8}>
                        <Modal title="Thêm phòng" manage={props.menu} transition={transition} categorys={categorys} finished={receiveFinished} />
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'order':
                result.push(<Row>
                    <Col span={8}>
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'order_detail':
                result.push(<Row>
                    <Col span={8}>
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'service':
                result.push(<Row>
                    <Col span={8}>
                        {
                            props.category === 'admin' ? <Modal title="Thêm dịch vụ" categorys={categorys} manage={props.menu} finished={receiveFinished} /> : ''
                        }
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'service_detail':
                result.push(<Row>
                    <Col span={8}>

                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            default:
        }
        result.push(<EditAbleTable categorys={categorys} manage={props.menu} accountCategory={props.category} finished={finished} search={searchResults} action={receiveAction} transition={receiveTransition} />)
        return result
    }
    else return ''


}
export default DashboardContent
