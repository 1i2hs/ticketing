import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Input, Icon } from "antd";
import { updateTicket } from "../../util/service";
import "./ModifyTicketModal.css";

const FormItem = Form.Item;

class ModifyTicketModal extends Component {
  state = {
    loading: false
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.ticket.id !== this.props.ticket.id)
      this.props.form.setFieldsValue({
        username: this.props.ticket.name,
        contact: this.props.ticket.contact
      });
  }

  handleModify = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.toggleLoading();
        updateTicket(
          this.props.ticket.id,
          values.username,
          values.contact,
          this.props.ticket.used
        )
          .then(response => {
            this.props.form.resetFields();
            this.props.afterModify();
          })
          .then(this.toggleLoading)
          .catch(error => {
            console.error(error.message);
            console.error(error.stack);
          });
      }
    });
  };

  toggleLoading = () => {
    this.setState((state, props) => ({ loading: !state.loading }));
  };

  render() {
    const { visible, onClose } = this.props;
    const { loading } = this.state;
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched
    } = this.props.form;
    // Only show error after a field is touched.
    const usernameError =
      isFieldTouched("username") && getFieldError("username");
    const contactError = isFieldTouched("contact") && getFieldError("contact");
    return (
      <Modal
        title="티켓 정보"
        visible={visible}
        onCancel={onClose}
        okText="변경"
        cancelText="취소"
        onOk={this.handleModify}
        confirmLoading={loading}
      >
        <Form layout="vertical">
          <FormItem
            validateStatus={usernameError ? "error" : ""}
            help={usernameError || ""}
            label="소유자명"
          >
            {getFieldDecorator("username", {
              rules: [
                { required: true, message: "티켓 소유자명을 입력해주세요!" }
              ]
            })(
              <Input
                prefix={
                  <Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder="티켓 소유자명"
              />
            )}
          </FormItem>
          <FormItem
            validateStatus={contactError ? "error" : ""}
            help={contactError || ""}
            label="연락처"
          >
            {getFieldDecorator("contact", {
              rules: [
                {
                  required: true,
                  message: "티켓 소유자의 연락처를 입력해주세요!"
                }
              ]
            })(
              <Input
                prefix={
                  <Icon type="mobile" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="text"
                placeholder="연락처"
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

ModifyTicketModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  afterModify: PropTypes.func,
  onClose: PropTypes.func,
  ticket: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    contact: PropTypes.string,
    svg: PropTypes.string,
    dateCreated: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    used: PropTypes.bool
  })
};

ModifyTicketModal.defaultProps = {
  ticket: {
    id: "",
    name: "",
    contact: "",
    svg: "",
    dateCreated: "",
    used: false
  }
};

export default Form.create()(ModifyTicketModal);
