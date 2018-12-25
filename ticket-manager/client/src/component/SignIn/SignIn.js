import React, { Component } from "react";
import { Form, Icon, Input, Button, Modal, message } from "antd";
import "./SignIn.css";
import logo from "../../logo.png";
import firebase from "firebase/app";
import "firebase/auth";

const FormItem = Form.Item;

class SignIn extends Component {
  message = message;
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { email, password } = values;
        firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then(() => {
            this.message.destroy();
            return this.message
              .success("로그인이 완료되었습니다.", 2.5)
              .then(() => {
                this.props.history.push("/");
              });
          })
          .catch(error => {
            this.message.destroy();
            switch (error.code) {
              case "auth/user-disabled":
                this.popErrorModal(
                  "로그인 에러",
                  "비활성화된 이메일 계정입니다."
                );
                break;
              case "auth/invalid-email":
                this.popErrorModal(
                  "로그인 에러",
                  "잘못된 형식의 이메일 계정입니다."
                );
                break;
              case "auth/user-not-found":
                this.popErrorModal("로그인 에러", "등록된 사용자가 없습니다.");
                break;
              case "auth/wrong-password":
                this.popErrorModal(
                  "로그인 에러",
                  "잘못된 이메일 또는 비밀번호입니다."
                );
                break;
              default:
                break;
            }
          });
        this.message.loading("로그인중...");
      }
    });
  };

  popErrorModal = (title, message) => {
    Modal.error({
      title,
      content: message
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="SignIn-container">
        <Form onSubmit={this.handleSubmit} className="SignIn-form">
          <FormItem>
            <div className="SignIn-title">
              <img src={logo} width={64} height={64} />
              <h1 style={{ marginBottom: 0 }}>Ticketing</h1>
            </div>
          </FormItem>
          <FormItem>
            {getFieldDecorator("email", {
              rules: [
                {
                  type: "email",
                  message: "형식이 맞지 않는 이메일 주소입니다."
                },
                { required: true, message: "이메일 주소를 입력해주세요." }
              ]
            })(
              <Input
                prefix={
                  <Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder="아이디"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator("password", {
              rules: [{ required: true, message: "비밀번호를 입력해주세요!" }]
            })(
              <Input
                prefix={
                  <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                type="password"
                placeholder="패스워드"
              />
            )}
          </FormItem>
          <FormItem>
            {/* {getFieldDecorator("remember", {
              valuePropName: "checked",
              initialValue: true
            })(<Checkbox>아이디/패스워드 기억하기</Checkbox>)} */}
            {/* <a className="SignIn-form-forgot" href="">
              패스워드 찾기
            </a> */}
            <Button
              type="primary"
              htmlType="submit"
              className="SignIn-form-button"
            >
              로그인
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create()(SignIn);
