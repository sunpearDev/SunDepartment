import React, { useState, useEffect } from 'react'
import { Row, Col, Input, Button, message } from 'antd';
import axios from 'axios';
import cookies from 'react-cookies';
const host = 'http://' + window.location.hostname

const { Search } = Input;


const SearchBox = (props) => {
  const [value, setValue] = useState(undefined)
  const onChange = (e) => {
    let temp
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      temp = value.pop()
      setValue(temp)
    }
    else if (e.nativeEvent.inputType === "insertText") {
      temp = value.push(e.nativeEvent.data)
      setValue(temp)
    }
  }
  useEffect(async ()=>{
    await setValue('')
    setValue(undefined)
  })
  const onSearch = value => {
    setValue(console.log(value))
    if (value !== '') {
      axios.post(`${host}:5000/${props.manage}/find`, { jwt: cookies.load('jwt'), findText: value }).then(response => {
        console.log(response)
        if (response.data.status) {
          message.success("Thêm thành công")
          props.searchResult(response.data.list)
        } else {
          message.error(response.data.message)
          props.searchResult(undefined)
        }
      }).catch(err => {
        message.error(err)
      })
    }
    else {
      props.searchResult(undefined)
    }
  }
  return (
    <Row>

      <Col span={24}>
        <Search
          value={value}
          placeholder="input search text"
          allowClear
          enterButton="Search"
          size="large"
          onSearch={onSearch}
        />
      </Col>
    </Row>
  )

}
export default SearchBox
