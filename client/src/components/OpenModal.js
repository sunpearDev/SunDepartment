import React, { useEffect } from 'react';
import { Modal, Button, message, Avatar } from 'antd';
import CustomForm from './CustomForm';


const OpenModal = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [finished, setFinished] = React.useState(undefined);


  const showModal = () => {
    setVisible(true);
  };
  const receiveFinished = (value) => {
    setFinished(value);
  }


  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(async () => {
      await document.getElementsByClassName('submit')[0].click()
    }, 2000);
  };

  const handleCancel = () => {
    setVisible(false);
  };
  useEffect(() => {
    if (finished === true) {
      setVisible(false);
      setConfirmLoading(false);
      props.finished(true)
      setFinished(undefined);
    }
    else if (finished === false) {
      setConfirmLoading(false)
      props.finished(false)
      setFinished(undefined);
    }

  })
  const showContent = () => {
    var inputs
    var initialValues
    switch (props.manage) {
      case 'account':
        inputs = [
          {
            label: "Tên tài khoản",
            name: "username",
            rules: [{ required: true, message: 'Xin nhập tên tài khoản!' }],
            type: 'normal'
          },
          {
            label: "Email",
            name: "email",
            rules: [{ required: true, message: 'Xin nhập email!' }],
            type: 'normal'
          },
          {
            label: "Loại tài khoản",
            name: "category_ID",
            type: "select",
            values: props.categorys,
            rules: [{ required: true, message: 'Xin nhập chọn loại tài khoản!' }],
          }
        ]
        break
      case 'customer':
        inputs = [
          {
            label: "Tên khách hàng",
            name: "customer_name",
            type: 'normal',
            rules: [{ required: true, message: 'Xin nhập tên tài khoản!' }]
          },
          {
            label: 'Số điện thoại',
            name: 'phone_number',
            type: 'normal',
            rules: [{ required: true, message: 'Xin nhập số điện thoại!' },
            { min: 10, message: "Xin nhập tối thiểu 10 số" }]
          },
          {
            label: 'Tuổi',
            name: 'age',
            type: 'normal',
            rules: [{ required: true, message: 'Xin nhập tuổi!' }]
          }
          , {
            label: "Giới tính",
            name: "gender",
            type: "select",
            values: [
              { key: "nam", value: "Nam" },
              { key: "Nữ", value: "Nữ" },
            ],
            rules: [{ required: true, message: 'Xin nhập chọn giới tính!' }],
          }, {
            label: 'Số CMND',
            name: 'identify_number',
            type: 'normal',
            rules: [
              { required: true, message: 'Xin nhập số CMND!' },
              { min: 10, message: "Xin nhập tối thiểu 10 số" }
            ]
          }
        ]
        break
      case 'room_category':
        inputs = [
          {
            label: "Tên loại phòng",
            name: "room_category_name",
            type: 'normal',
            rules: [{ required: true, message: 'Xin nhập tên loại phòng!' }]
          },
          {
            label: 'Giường đơn',
            name: 'single_bed',
            type: 'normal',
            rules: [{ required: true, message: 'Xin nhập số giường đơn!' }]
          },
          {
            label: 'Giường đôi',
            name: 'double_bed',
            type: 'normal',
            rules: [{ required: true, message: 'Xin nhập số giường đôi' }]
          }
          , {
            label: 'Diện tích (m2)',
            name: 'area',
            type: 'normal',
            rules: [
              { required: true, message: 'Xin nhập diện tích!' }
            ]
          },
          {
            label: 'Mô tả',
            name: 'description',
            type: 'normal',
          }, {
            label: 'Giá một ngày',
            name: 'price_on_day',
            type: 'normal',
            rules: [
              { required: true, message: 'Xin nhập mô tả!' }
            ]
          }
        ]
        break
      case 'room':
        inputs = [
          {
            label: "Loại phòng",
            name: "room_category_ID",
            type: "select",
            values: props.categorys,
            rules: [{ required: true, message: 'Xin nhập chọn loại phòng!' }],
          }
        ]
        break
      case 'order':
        inputs = [{
          label: 'ID khách hàng',
          name: 'customer_ID',
          defaultValue: props.customer,
          type: 'disable'
        },
        {
          label: "Thời gian lưu trú",
          name: "lenghtOfStay",
          type: "rangepicker",
          rules: [{ required: true, message: 'Xin nhập thời gian lưu trú!' }]
        },
        {
          label: "Số người lớn",
          name: "adults",
          type: 'number',
          rules: [{ required: true, message: 'Xin nhập số người lớn!' }],
          min: 1,
          defaultValue: 1,
          max: 10
        },
        {
          label: "Số trẻ em",
          name: "childrens",
          type: 'number',
          rules: [{ required: true, message: 'Xin nhập số trẻ em!' }],
          min: 0,
          defaultValue: 0,
          max: 10
        },
        {
          label: "Yêu cầu đặc biệt",
          name: "customer_required",
          type: "textarea",
          rows: 4
        }
        ]
        initialValues = { customer_ID: props.customer, adults: 1, childrens: 0 }
        if (Array.isArray(props.categorys)) {
          props.categorys.forEach(item => {
            initialValues[item.key] = 0
            inputs.push({
              label: item.value,
              name: item.key,
              type: 'number',
              min: 0,
              defaultValue: 0,
              max: item.max
            })
          })
        }

        break
      case 'service':
        inputs = [
          {
            label: "Tên dịch vụ",
            name: "service_name",
            type: 'normal',
            rules: [{ required: true, message: 'Xin nhập tên dịch vụ!' }]
          },
          {
            label: "Tên nhân viên",
            name: "account_ID",
            type: "select",
            values: props.categorys,
            rules: [{ required: true, message: 'Xin nhập chọn nhân viên!' }],
          },
          {
            label: 'Mô tả',
            name: 'description',
            type: 'normal',
          }, {
            label: 'Giá dịch vụ',
            name: 'price',
            type: 'normal',
            rules: [
              { required: true, message: 'Xin nhập giá dịch vụ!' },
              { min: 4, message: 'Xin nhập ít nhập 1000 VNĐ' }
            ]
          }
        ]
        break
      case 'service_detail':
        initialValues = { order_detail_ID: props.order_detail, quantity: 1 }
        inputs = [{
          label: 'ID chi tiết đơn',
          name: 'order_detail_ID',
          defaultValue: props.order_detail,
          type: 'disable'
        },
        {
          label: "Loại dịch vụ",
          name: "service_ID",
          type: "select",
          values: props.categorys,
          rules: [{ required: true, message: 'Xin nhập chọn loại dịch vụ!' }],
        },
        {
          label: 'Số lượng',
          name: 'quantity',
          type: 'normal',
          rules: [
            { required: true, message: 'Xin nhập số lượng!' },
          ],
          min: 1,
          defaultValue: 1,
        }
        ]
        break
      case 'supply_category':
        inputs = [{
          label: 'Tên loại tài sản',
          name: 'supply_category_name',
          type: 'normal',
          rules: [
            { required: true, message: 'Xin nhập tên loại tài sản!' },
          ],
        }, {
          label: "Loại sở hữu",
          name: "supply_type",
          type: "select",
          values: [
            { key: "room", value: "Phòng" },
            { key: "department", value: "Khách sạn" },
          ],
          rules: [{ required: true, message: 'Xin nhập loại sở hữu!' }],
        }]
        break
      case 'room_supply':

        inputs = [{
          label: 'Tên tài sản',
          name: 'supply_name',
          type: 'normal',
        },
        {
          label: "Chọn phòng",
          name: "room_code",
          type: "select",
          values: props.categorys[0],
          rules: [{ required: true, message: 'Xin nhập phòng!' }],
        },
        {
          label: "Loại tài sản",
          name: "supply_category_ID",
          type: "select",
          values: props.categorys[1],
          rules: [{ required: true, message: 'Xin nhập loại sở hữu!' }],
        }]
        break
      case 'department_supply':
        inputs = [{
          label: 'Tên tài sản',
          name: 'supply_name',
          type: 'normal',
        },
        {
          label: "Loại tài sản",
          name: "supply_category_ID",
          type: "select",
          values: props.categorys,
          rules: [{ required: true, message: 'Xin nhập loại sở hữu!' }],
        }]
        break
      default:

    }


    return <CustomForm manage={props.manage} inputs={inputs} finished={receiveFinished} action={props.action === undefined ? "add" : props.action} initialValues={initialValues} />
  }


  return (
    <>
      <Button type="primary" onClick={showModal}>
        {props.title}
      </Button>
      <Modal
        title={props.title}
        visible={visible}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
      >
        {showContent()}
      </Modal>
    </>
  );
};

export default OpenModal