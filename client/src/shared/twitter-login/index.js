import { Component } from 'react';
import { createElement } from 'react';
require('isomorphic-fetch');

class TwitterLogin extends Component {
  constructor(props) {
    super(props);

    this.onButtonClick = this.onButtonClick.bind(this);
  }

  onButtonClick(e) {
    e.preventDefault();
    return this.getRequestToken();
  }

  getHeaders() {
    const headers = Object.assign({}, this.props.customHeaders);
    headers['Content-Type'] = 'application/json';
    headers['csrf-token'] = this.props._csrf;
    return headers;
  }

  getRequestToken() {
    var popup = this.openPopup();

    return fetch(this.props.requestTokenUrl, {
      method: 'POST',
      credentials: this.props.credentials,
      headers: this.getHeaders()
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        popup.location = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}&force_login=${
          this.props.forceLogin
        }&screen_name=${this.props.screenName}`;
        this.polling(popup);
      })
      .catch(error => {
        popup.close();
        return this.props.onFailure(error);
      });
  }

  openPopup() {
    const w = this.props.dialogWidth;
    const h = this.props.dialogHeight;
    const left = screen.width / 2 - w / 2;
    const top = screen.height / 2 - h / 2;

    return window.open(
      '',
      '',
      'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' +
        w +
        ', height=' +
        h +
        ', top=' +
        top +
        ', left=' +
        left
    );
  }

  polling(popup) {
    const polling = setInterval(() => {
      if (!popup || popup.closed || popup.closed === undefined) {
        clearInterval(polling);
        this.props.onFailure(new Error('Popup has been closed by user'));
      }

      const closeDialog = () => {
        clearInterval(polling);
        popup.close();
      };

      try {
        if (!popup.location.hostname.includes('api.twitter.com') && popup.location.hostname !== '') {
          if (popup.location.search) {
            const query = new URLSearchParams(popup.location.search);

            const oauthToken = query.get('oauth_token');
            const oauthVerifier = query.get('oauth_verifier');

            closeDialog();
            return this.getOauthToken(oauthVerifier, oauthToken);
          } else {
            closeDialog();
            return this.props.onFailure(
              new Error(
                'OAuth redirect has occurred but no query or hash parameters were found. ' +
                  'They were either not set during the redirect, or were removed—typically by a ' +
                  'routing library—before Twitter react component could read it.'
              )
            );
          }
        }
      } catch (error) {
        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
        // A hack to get around same-origin security policy errors in IE.
      }
    }, 500);
  }

  getOauthToken(oAuthVerifier, oauthToken) {
    return fetch(`${this.props.loginUrl}?oauth_verifier=${oAuthVerifier}&oauth_token=${oauthToken}`, {
      method: 'POST',
      credentials: this.props.credentials,
      headers: this.getHeaders()
    })
      .then(response => {
        this.props.onSuccess(response);
      })
      .catch(error => {
        return this.props.onFailure(error);
      });
  }

  getDefaultButtonContent() {
    return this.props.text;
  }

  render() {
    const twitterButton = createElement(
      this.props.tag,
      {
        onClick: this.onButtonClick,
        style: this.props.style,
        disabled: this.props.disabled,
        className: this.props.className
      },
      this.props.children ? this.props.children : this.getDefaultButtonContent()
    );
    return twitterButton;
  }
}

TwitterLogin.defaultProps = {
  tag: 'button',
  text: 'Login with Twitter',
  disabled: false,
  dialogWidth: 600,
  dialogHeight: 400,
  showIcon: true,
  credentials: 'same-origin',
  customHeaders: {},
  forceLogin: false
};

export default TwitterLogin;
