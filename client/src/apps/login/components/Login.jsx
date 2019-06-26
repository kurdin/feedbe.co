/* globals $ */
/*eslint camelcase: 0*/

import React, { Component } from 'react';
import cn from 'classnames';
import Animate from 'animate.css-react';
import { emailRegex } from 'shared/utils';
import FacebookLogin from 'shared/facebook-login';
import TwitterLogin from 'shared/twitter-login';
import GoogleLogin from 'shared/google-login';

import './css/Login.css';

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
      success: false,
      sending: false,
      error: null
    };
  }

  on = {
    handleInput: e => {
      this.email = e.currentTarget.value.trim();

      if (this.state.error && ((this.email && this.email.match(emailRegex)) || this.email === '')) {
        this.setState({
          error: null
        });
      }
    },
    handleSubmit: e => {
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
            this.setState({ success: true });
          },
          error: (xhr, status, err) => {
            console.error(this.props.url, status, err.toString());
          }
        });
      }
    },
    goBack: e => {
      if (typeof this.origin !== 'undefined') return;
      else {
        e.preventDefault();
        window.history.back();
      }
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
                  <div>{!this.state.success ? <span>Passwordless Login</span> : <span>Email Sent</span>}</div>
                </h3>
                <LoginBox>
                  {!this.state.success ? (
                    <form method="POST" onSubmit={this.on.handleSubmit}>
                      <label class="label">Email</label>
                      <p class="control m-b-sm">
                        <input
                          class={cn('input', { 'is-danger': this.state.error })}
                          type="text"
                          name="user"
                          required="required"
                          placeholder="user@example.com"
                          ref={el => {
                            this.inputEmail = el;
                          }}
                          onInput={this.on.handleInput}
                        />
                        {/* this.origin && <input type="hidden" name="origin" value={origin} /> */}
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
                      </p>
                      <p class="control m-b-sm">
                        <button type="submit" class={cn('button is-primary', { 'is-loading': this.state.sending })}>
                          Login / Register
                        </button>
                      </p>
                    </form>
                  ) : (
                    <Animate component="div" appear="pulse" durationAppear={300}>
                      <p class="text is-dark">
                        <p>
                          We sent you email to <b>{this.email}</b> with login link.
                        </p>
                        <p>Please check your inbox and click on the link provided to login.</p>
                      </p>
                    </Animate>
                  )}
                </LoginBox>
                {!this.state.success ? (
                  <p>
                    Enter your email to login or register, we'll send you token-based authentication link. No need for
                    passwords.
                  </p>
                ) : (
                  <ul>
                    <li class="is-pulled-left m-l-0 m-r-sm">
                      <a href={origin} onClick={this.on.goBack}>
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
