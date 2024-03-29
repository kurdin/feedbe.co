/* globals $ */
/*eslint camelcase: 0*/

import React, { Component } from 'react';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { Row, Col } from '@zendeskgarden/react-grid';
import Animate from 'animate.css-react';
import { emailRegex } from 'shared/utils';
import FacebookLogin from 'shared/facebook-login';
import TwitterLogin from 'shared/twitter-login';
import GoogleLogin from 'shared/google-login';
import { setUrl } from 'shared/utils';

import './css/Login.css';
import '@zendeskgarden/react-grid/dist/styles.css';

const _getCSRF = () => typeof window !== 'undefined' && window.datashared && window.datashared.csrfToken;

class LoginBox extends Component {
  componentWillEnter(done) {
    setTimeout(done, 20);
  }

  componentDidEnter() {}

  componentWillLeave(done) {
    setTimeout(done, 20);
  }

  componentDidLeave() {}

  render() {
    const { children } = this.props;
    return (
      <div class="box m-b-sm" ref={c => (this.container = c)}>
        {children}
      </div>
    );
  }
}

class Login extends Component {
  static displayName = 'Login';
  email = null;

  constructor(props) {
    super(props);
    this.origin = props.origin;
    this.state = {
      usePassword: JSON.parse(localStorage.getItem('feedbe_usePassword')) || false,
      success: false,
      sending: false,
      error: null
    };
  }

  handleUsePasswordToggle = e => {
    e.preventDefault();
    this.setState(
      prevState => ({
        usePassword: !prevState.usePassword
      }),
      () => {
        localStorage.setItem('feedbe_usePassword', JSON.stringify(this.state.usePassword));
      }
    );
  };

  handleInputEmail = e => {
    this.email = e.currentTarget.value.trim();

    if (this.state.error && ((this.email && this.email.match(emailRegex)) || this.email === '')) {
      this.setState({
        error: null
      });
    }
  };

  handleInputPassword = e => {
    this.password = e.currentTarget.value;
  };

  checkLoginSuccess() {
    $.get('/login/success/check', data => {
      if (data && data.isAuthenticated) {
        location.href = data.redirect;
      } else {
        setTimeout(this.checkLoginSuccess, 240000);
      }
    });
  }

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

  twitterResponse = response => {
    response.json().then(done => {
      if (done && done.success) {
        location.reload(true);
      }
    });
  };

  facebookResponse = response => {
    $.ajax({
      url: '/auth/facebook',
      dataType: 'json',
      type: 'POST',
      data: { access_token: response.accessToken, _csrf: _getCSRF() },
      success: done => {
        if (done && done.success) {
          location.reload(true);
        }
      },
      error: (xhr, status, err) => {
        console.error(this.props.url, status, err.toString());
      }
    });
  };

  googleResponse = response => {
    $.ajax({
      url: '/auth/google',
      dataType: 'json',
      type: 'POST',
      data: { access_token: response.accessToken, _csrf: _getCSRF() },
      success: done => {
        if (done && done.success) {
          location.reload(true);
        }
      },
      error: (xhr, status, err) => {
        console.error(this.props.url, status, err.toString());
      }
    });
  };

  render() {
    const { origin } = this.props;
    const { usePassword } = this.state;
    const { handleUsePasswordToggle, handleInputEmail, handleInputPassword } = this;

    // return (
    //   // <section class="hero is-dark is-bold">
    //   //   <div class="hero-body">Hello Login</div>
    //   // </section>
    // );

    return (
      <section class="hero is-dark is-bold">
        <div class="hero-body">
          <div class="container">
            <div class="columns">
              <div class="column is-4 is-offset-2">
                <h3 class="title is-5 m-b-sm">
                  <div>
                    {!this.state.success ? (
                      <span>{usePassword ? 'Login with Email and Password' : 'Passwordless Login with Email'}</span>
                    ) : (
                      <span>Email Sent</span>
                    )}
                  </div>
                </h3>
                <LoginBox>
                  {!this.state.success ? (
                    <form method="POST" onSubmit={this.handleSubmit}>
                      <label class="label">Email</label>
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
                        {/* this.origin && <input type="hidden" name="origin" value={origin} /> */}
                        {!usePassword && this.state.error && (
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
                      {usePassword && (
                        <>
                          <label class="label">Password</label>
                          <div class="control m-b-sm">
                            <input
                              class={cn('input', { 'is-danger': this.state.error })}
                              type="password"
                              name="password"
                              autoComplete="current-password"
                              required="required"
                              ref={el => {
                                this.inputPassword = el;
                              }}
                              onInput={handleInputPassword}
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
                        </>
                      )}

                      <div class="control m-b-sm">
                        <Row gutters={false}>
                          <Col>
                            <button type="submit" class={cn('button is-primary', { 'is-loading': this.state.sending })}>
                              {usePassword ? 'Login' : 'Login / Register'}
                            </button>
                          </Col>
                          <Col class="has-text-right">
                            <span class="button is-link" onClick={handleUsePasswordToggle}>
                              {usePassword ? 'use Email' : 'Use Password'}
                            </span>
                          </Col>
                        </Row>
                      </div>
                    </form>
                  ) : (
                    <Animate component="div" appear="pulse" durationAppear={300}>
                      <p class="text is-dark">
                        <p>
                          We sent you email to <b>{this.email}</b> with login magic link.
                        </p>
                        <p>Please check your inbox and click on the link provided to login.</p>
                      </p>
                    </Animate>
                  )}
                </LoginBox>
                {!this.state.success ? (
                  usePassword ? (
                    <p>
                      Don't have account?{' '}
                      <a href="#" class="has-underline" onClick={handleUsePasswordToggle}>
                        Login or register with email.
                      </a>
                      <div>
                        <Link to="/reset-password" class="has-underline">
                          Forgot password?
                        </Link>
                      </div>
                    </p>
                  ) : (
                    <p>
                      Enter your email to login or register, we'll send you token-based authentication link. No need for
                      passwords.
                    </p>
                  )
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
              <div class="column is-1 is-or-column">
                <h3 class="title is-6 is-or">OR</h3>
                <div class="vr-or" />
              </div>
              <div class="column is-4 is-offset-0">
                <h3 class="title is-5 m-b-sm">
                  <div>
                    <span>Social Login</span>
                  </div>
                </h3>
                <LoginBox>
                  <FacebookLogin
                    appId="366257574171895"
                    autoLoad={false}
                    fields="name,email"
                    callback={this.facebookResponse}
                    render={renderProps => (
                      <button
                        style={{ backgroundColor: '#3b5998' }}
                        onClick={renderProps.onClick}
                        class="w100 m-b-sm button is-info is-medium"
                      >
                        <span class="icon m-0">&#228;</span> Login with <b style={{ margin: '5px' }}>FaceBook</b>
                      </button>
                    )}
                  />
                  <GoogleLogin
                    clientId="131777512320-napdjp591f8n3sum5919epnbcnma10v8.apps.googleusercontent.com"
                    render={renderProps => (
                      <button
                        style={{ backgroundColor: '#db4437' }}
                        onClick={renderProps.onClick}
                        class="w100 m-b-sm button is-info is-medium"
                      >
                        <span class="icon m-0">&#242;</span> Login with <b style={{ margin: '5px' }}>Google</b>
                        {'\u00A0\u00A0\u00A0\u00A0\u00A0'}
                      </button>
                    )}
                    onSuccess={this.googleResponse}
                    onFailure={() => {}}
                  />
                  <TwitterLogin
                    loginUrl="/auth/twitter"
                    onFailure={() => {}}
                    _csrf={_getCSRF()}
                    onSuccess={this.twitterResponse}
                    style={{ backgroundColor: '#1da1f2' }}
                    className="w100 button is-info is-medium"
                    requestTokenUrl="/auth/twitter/reverse"
                  >
                    <span class="icon m-0">&#229;</span> Login with <b style={{ margin: '5px' }}>Twitter</b>
                    {'\u00A0\u00A0\u00A0\u00A0\u00A0'}
                  </TwitterLogin>
                </LoginBox>
                <p>
                  Social Login, is a quick way to sign-on using your existing login information from a social networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Login;
