import React, { useState, useEffect } from 'react'
import EditAbleTable from './EditAbleTable'
import { Row, Col, message } from 'antd'
import Modal from './OpenModal';
import SearchBox from './SearchBox'
import axios from 'axios'
import cookies from 'react-cookies'
const host = 'https://' + window.location.hostname


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
    const receiveAction = (data) => {
        if (data.path !== undefined) {
            if (data.action === undefined)
                axios.put(`${host}${data.path}`, { jwt: cookies.load('jwt') }).then(async response => {
                    if (response.data.status) {
                        setFinished(true)
                        await setTimeout(() => { setFinished(false) }, 1000)
                    } else message.error(response.data.message)
                })
            else if (data.action === 'post') {
                axios.post(`${host}${data.path}`, { amount: data.value }).then(async response => {
                    if (response.data.status) {
                        setFinished(true)
                        await setTimeout(() => { setFinished(false) }, 1000)
                        if (data.path === '/payment') {
                            window.location = response.data.order_url
                        }
                    } else message.error(response.data.message)
                })
            }
        }

    }
    const receiveTransition = async (transit) => {
        if (transit !== undefined) {
            setTransition(transit)
            await setTimeout(() => { setTransition(undefined) }, 2000)
        }

    }

    useEffect(async () => {
        if (cookies.load('jwt') !== undefined)
            switch (props.menu) {
                case 'account':
                    axios.post(host + '/account_category', { jwt: cookies.load('jwt') }).then(response => {
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
                    axios.post(host + '/room_category/getAll', { jwt: cookies.load('jwt') }).then(response => {
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
                    axios.post(host + '/customer/getAll', { jwt: cookies.load('jwt') }).then(response => {
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
                    axios.post(host + '/account/find', { jwt: cookies.load('jwt'), findText: 'dichvu' }).then(response => {
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
                    axios.post(host + '/service/getAll', { jwt: cookies.load('jwt') }).then(response => {
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
                case 'room_supply':
                    if (props.category === 'ketoan');
                    else {
                        let doubleCategory = []
                        axios.post(host + '/room/getAll', { jwt: cookies.load('jwt') }).then(async response => {
                            if (response.data.status) {
                                let temp = []
                                response.data.list.map(item => {
                                    temp.push({ key: `${item.room_category_ID}.${item.room_number}`, value: `${item.room_category_name} ${item.room_number}` })
                                })
                                doubleCategory.push(temp)
                                await axios.post(host + '/supply_category/getAll', { jwt: cookies.load('jwt') }).then(response => {
                                    if (response.data.status) {
                                        let temp = []
                                        response.data.list.map(item => {
                                            if (item.supply_type === 'room')
                                                temp.push({ key: item.supply_category_ID, value: item.supply_category_name })
                                        })
                                        doubleCategory.push(temp)

                                    } else message.error(response.data.message)
                                })
                                setCategory(doubleCategory)
                            } else message.error(response.data.message)
                        })

                    }

                    break
                case 'department_supply':
                    axios.post(host + '/supply_category/getAll', { jwt: cookies.load('jwt') }).then(response => {
                        if (response.data.status) {
                            let temp = []
                            response.data.list.map(item => {
                                if (item.supply_type === 'department')
                                    temp.push({ key: item.supply_category_ID, value: item.supply_category_name })
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
            case 'service_detail':
                result.push(<Row>
                    <Col span={8}>

                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'supply_category':
                result.push(<Row>
                    <Col span={8}>
                        {
                            props.category === 'admin' ? <Modal title="Thêm loại tài sản" manage={props.menu} finished={receiveFinished} /> : ''
                        }
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'room_supply':
                result.push(<Row>
                    <Col span={8}>
                        {
                            props.category === 'ketoan' ? '' : <Modal title="Thêm tài sản phòng" categorys={categorys} manage={props.menu} finished={receiveFinished} />
                        }
                    </Col>
                    <Col span={8} offset={8}>
                        <SearchBox manage={props.menu} transition={transition} searchResult={receiveSearchResult} />
                    </Col>
                </Row>)
                break
            case 'department_supply':
                result.push(<Row>
                    <Col span={8}>
                        {
                            props.category === 'admin' ? <Modal title="Thêm tài sản khách sạn" categorys={categorys} manage={props.menu} finished={receiveFinished} /> : ''
                        }
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
