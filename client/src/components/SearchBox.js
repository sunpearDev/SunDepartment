import React, { Component } from 'react'
import { Row, Col, Input, Button, message } from 'antd';
import axios from 'axios';
import cookies from 'react-cookies';
const host = 'http://' + window.location.hostname

const { Search } = Input;


export default class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this)
    this.onSearch = this.onSearch.bind(this)
    this.detail = this.detail.bind(this)
    this.state = {
      value: undefined
    }
  }
  async componentDidUpdate(prevProps) {
    if (this.props.transition !== prevProps.transition && this.props.transition !== undefined) {
      cookies.save('value', this.props.transition.value)
      await document.getElementsByClassName(this.props.transition.manage + '-menu')[0].click()
      this.onSearch(cookies.load('value'))
      this.setState({ value: '' })
      cookies.remove('value')
    }
    else
      if (this.props.manage !== prevProps.manage && this.props.transition === undefined) {
        await this.setState({ value: '' })
        this.setState({ value: undefined })
        //this.onSearch('')
      }
  }

  onChange = () => {
    if (this.state.value !== undefined) {
      this.setState({ value: undefined })
      this.onSearch('')
    }
  }
  detail = value => {
    if (value !== '') {
      axios.post(`${host}:5000/${this.props.manage}/detail`, { jwt: cookies.load('jwt'), value: value }).then(response => {
        if (response.data.status) {
          message.success("Tìm thành công")
          this.props.searchResult(response.data.list)
        } else {
          message.error(response.data.message)
          this.props.searchResult(undefined)
        }
      }).catch(err => {
        message.error(err)
        this.props.searchResult(undefined)
      })
    }
    else {
      this.props.searchResult(undefined)
    }
  }

  onSearch = value => {
    if (value !== '') {
      axios.post(`${host}:5000/${this.props.manage}/find`, { jwt: cookies.load('jwt'), findText: value }).then(response => {
        if (response.data.status) {
          message.success("Tìm thành công")
          this.props.searchResult(response.data.list)
        } else {
          message.error(response.data.message)
          this.props.searchResult(undefined)
        }
      }).catch(err => {
        message.error(err)
        this.props.searchResult(undefined)
      })
    }
    else {
      this.props.searchResult(undefined)
    }
  }
  render() {
    return (
      <Row>

        <Col span={24}>
          <Search
            value={this.state.value}
            placeholder="input search text"
            allowClear
            enterButton="Search"
            size="large"
            onChange={this.onChange}
            onSearch={this.onSearch}
          />
        </Col>
      </Row>
    )
  }
}

