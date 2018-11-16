import EventEmitter from 'eventemitter3';
import config from '../data/config/index';

// https://developers.google.com/identity/protocols/OAuth2UserAgent
// https://developers.google.com/api-client-library/javascript/start/start-js

export default class GoogleAuthClient {
  constructor() {
    this.gapi = null;
    this.auth = null;
    this.isSignedIn = false;
    this.user = null;
    this.emitter = new EventEmitter();
  }

  // check login status
  check() {
    return this.init().then(({ auth }) => {
      return this.isSignedIn ? this.user : null;
    });
  }

  // sign in
  signIn() {
    return this.init().then(({ auth }) => {
      // 已经登录
      if (this.isSignedIn) return this.user;
      // 登录
      return new Promise((resolve, reject) => {
        auth.signIn().then(() => {
          this.isSignedIn = this.auth.isSignedIn.get();
          this.user = this._updateUser();
          resolve(this.user);
        }, reject);
      });
    });
  }

  // sign out
  signOut() {
    return this.init().then(({ auth }) => {
      return new Promise((resolve, reject) => {
        auth.signOut().then(() => {
          this.isSignedIn = false;
          this.user = null;
          resolve();
        }, reject);
      });
    });
  }

  _updateUser() {
    let currentUser = this.auth.currentUser.get();
    let user = currentUser.getAuthResponse();
    let profile = currentUser.getBasicProfile();
    user.id = profile.getId();
    user.name = profile.getName();
    user.givenName = profile.getGivenName();
    user.familyName = profile.getFamilyName();
    user.imageUrl = profile.getImageUrl();
    user.email = profile.getEmail();
    this.user = user;
    return this.user;
  }

  grantOfflineAccess(scope = 'profile email openid') {
    return this.init().then(({ auth }) => {
      return new Promise((resolve, reject) => {
        auth.grantOfflineAccess({ scope }).then((resp) => {
          resolve(resp.code);
        }, reject);
      });
    });
  }

  // on event
  on(eventName, listener) {
    this.emitter.on(eventName, listener);
  }

  // off event
  off(eventName, listener) {
    this.emitter.off(eventName, listener);
  }

  // init client
  init() {
    if (this.auth) return Promise.resolve(this);
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.loadGApi().then(() => {
      return new Promise((resolve, reject) => {
        this.gapi.client
          .init({
            apiKey: config.google.key,
            clientId: config.google.id,
            scope: 'openid profile email',
            discoveryDocs: [],
          })
          .then(() => {
            this.auth = gapi.auth2.getAuthInstance();
            this.isSignedIn = this.auth.isSignedIn.get();
            if (this.isSignedIn) {
              this.user = this._updateUser();
            }
            // Listen for sign-in state changes.
            this.auth.isSignedIn.listen((isSignedIn) => {
              this.isSignedIn = isSignedIn;
              if (this.isSignedIn) {
                this.user = this._updateUser();
              } else {
                this.user = null;
              }
              this.emitter.emit(
                'signInStatusChange',
                this.isSignedIn,
                this.user,
              );
            });
            resolve(this);
          }, reject);
      });
    });

    return this.initPromise;
  }

  // load api and oauth2 client
  loadGApi() {
    return new Promise((resolve, reject) => {
      this._loadGApi((gapi) => {
        if (gapi.error) return reject(gapi.error);
        this.gapi = gapi;
        gapi.load('client:auth2', {
          callback(rst) {
            resolve(gapi);
          },
          onerror() {
            reject(new Error('gapi.client failed to load!'));
          },
          timeout: 5000, // 5 seconds.
          ontimeout() {
            reject(new Error('gapi.client timeout!'));
          },
        });
      });
    });
  }

  // load main api js
  _loadGApi(callback) {
    let callbacks = [];

    // 已经加载
    if (typeof gapi === 'object' && gapi.auth2) {
      return callback(gapi);
    }

    callbacks.push(callback);

    // 正则加载
    if (callbacks.length > 1) return;

    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://apis.google.com/js/api.js';
    document.body.appendChild(script);

    function stateChange() {
      if (
        !this.readyState ||
        this.readyState === 'loaded' ||
        this.readyState === 'complete'
      ) {
        // callbacks
        while (callbacks.length) {
          callbacks.shift()(gapi);
        }

        // unbind
        script.onload = null;
        script.onreadystatechange = null;
      }
    }

    script.onload = stateChange;
    script.onreadystatechange = stateChange;
    script.onerror = () => {
      let rst = { error: new Error('Load google api js error!') };
      callbacks.shift()(rst);
    };
  }
}
