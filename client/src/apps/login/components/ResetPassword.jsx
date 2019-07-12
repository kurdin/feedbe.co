/* globals $ */
/*eslint camelcase: 0*/

import React, { Component } from 'react';
import cn from 'classnames';
import Animate from 'animate.css-react';
import { Link } from 'react-router-dom';
import { emailRegex } from 'shared/utils';
import { setUrl } from 'shared/utils';

import './css/Login.css';
import '@zendeskgarden/react-grid/dist/styles.css';

const _getCSRF = () => typeof window !== 'undefined' && window.datashared && window.datashared.csrfToken;

class LoginBox extends Component {
  componentWillEnter(done) {
    setTimeout(done, 20);
  }

  componentWillLeave(done) {
    setTimeout(done, 20);
  }

  render() {
    const { children } = this.props;
    return (
      <div class="box m-b-sm" ref={c => (this.container = c)}>
        {children}
      </div>
    );
  }
}

export default class ResetPassword extends Component {
  static displayName = 'Reset Password';
  email = null;

  constructor(props) {
    super(props);
    this.origin = props.origin;
    this.state = {
      success: false,
      sending: false,
      error: null
    };
  }

  handleInputEmail = e => {
    this.email = e.currentTarget.value.trim();

    if (this.state.error && ((this.email && this.email.match(emailRegex)) || this.email === '')) {
      this.setState({
        error: null
      });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    let email = this.inputEmail.value.trim() || '';
    if (!email.match(emailRegex)) {
      this.setState({
        error: 'This email is invalid'
      });
    } else {
      this.email = email;
      this.setState({
        error: null,
        sending: true
      });
      $.ajax({
        url: '/login',
        dataType: 'json',
        type: 'POST',
        data: { email: this.email, origin: this.origin, _csrf: _getCSRF() },
        success: data => {
          this.setState({ success: true }, () => {
            setUrl('/login/success', 'replaceState');
            setTimeout(this.checkLoginSuccess, 180000);
          });
        },
        error: (xhr, status, err) => {
          console.error(this.props.url, status, err.toString());
        }
      });
    }
  };

  goBack = e => {
    if (typeof this.origin !== 'undefined') return;
    else {
      e.preventDefault();
      window.history.back();
    }
  };

  render() {
    const { origin } = this.props;
    const { usePassword } = this.state;
    const { handleUsePasswordToggle, handleInputEmail, handleInputPassword } = this;

    return (
      <section class="hero is-dark is-bold">
        <div class="hero-body">
          <div class="container">
            <div class="columns is-centered">
              <div class="column is-4">
                <h3 class="title is-5 m-b-sm">
                  <div>{!this.state.success ? <span>Password Reset</span> : <span>Email Sent</span>}</div>
                </h3>
                <LoginBox>
                  {!this.state.success ? (
                    <form method="POST" onSubmit={this.handleSubmit}>
                      <label class="label">Enter Your Email</label>
                      <div class="control m-b-sm">
                        <input
                          class={cn('input', { 'is-danger': this.state.error })}
                          type="text"
                          name="username"
                          required="required"
                          autoComplete="username"
                          placeholder="user@example.com"
                          ref={el => {
                            this.inputEmail = el;
                          }}
                          onInput={handleInputEmail}
                        />
                        {this.state.error && (
                          <Animate
                            component="div"
                            appear="pulse"
                            change="pulse"
                            durationAppear={300}
                            durationChange={300}
                          >
                            <p class="help is-danger pulse">{this.state.error} </p>
                          </Animate>
                        )}
                      </div>

                      <div class="control m-b-sm">
                        <button type="submit" class={cn('button is-primary', { 'is-loading': this.state.sending })}>
                          {'Reset Password'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <Animate component="div" appear="pulse" durationAppear={300}>
                      <p class="text is-dark">
                        <p>
                          We sent you email to <b>{this.email}</b> with reset password link.
                        </p>
                        <p>Please check your inbox and click on the link provided to reset your password.</p>
                      </p>
                    </Animate>
                  )}
                </LoginBox>
                {!this.state.success ? (
                  <p>
                    Enter your account email and we'll send link to reset password or go to{' '}
                    <Link to="/" class="has-underline">
                      login page.
                    </Link>
                  </p>
                ) : (
                  <ul>
                    <li class="is-pulled-left m-l-0 m-r-sm">
                      <a href={origin} onClick={this.goBack}>
                        &larr; Go Back
                      </a>{' '}
                      |
                    </li>
                    <li class="is-pulled-left m-l-0 m-r-sm">
                      <a href="/">Go To Homepage</a>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
