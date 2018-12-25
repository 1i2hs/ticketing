import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Icon, Input, Button } from "antd";
import service from "../../util/service";
import "./AddTicketForm.css";

const FormItem = Form.Item;

const hasErrors = fieldsError => {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
};

class AddTicketForm extends Component {
  state = {
    loading: false
  };

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields();
  }

  toggleLoading = () => {
    this.setState((state, props) => ({ loading: !state.loading }));
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.toggleLoading();
        service.createTicket(values.username, values.contact)
          .then(response => {
            this.props.form.resetFields();
            this.props.onTicketAdded(response.data);
            this.props.form.validateFields();
          })
          .then(this.toggleLoading)
          .catch(error => {
            console.error(error.message);
            console.error(error.stack);
          });
      }
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;

    const { loading } = this.state;

    // Only show error after a field is touched.
    const usernameError =
      isFieldTouched("username") && getFieldError("username");
    const contactError = isFieldTouched("contact") && getFieldError("contact");
    return (
      <div className="AddTicketForm">
        <Form layout="inline" onSubmit={this.handleSubmit}>
          <FormItem
            validateStatus={usernameError ? "error" : ""}
            help={usernameError || ""}
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
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              disabled={hasErrors(getFieldsError())}
              loading={loading}
            >
              티켓 추가
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

AddTicketForm.propTypes = {
  onTicketAdded: PropTypes.func
};

export default Form.create()(AddTicketForm);
