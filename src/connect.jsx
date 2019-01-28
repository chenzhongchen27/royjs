import React from 'react';
import ReactDOM from 'react-dom';
import T from 'prop-types';
import Store from './store';
import { isArray, warning } from './utils';

const connect = function (mapStateToProps = state => state, config = {}) {
    return function withStore(Component) {
        class StoreWrapper extends React.Component {
            static contextTypes = {
                store: T.any,
                injectStore: T.any
            };
            constructor(props, context) {
                super(props, context);
                this._deps = {};
                this._change = obj => {
                    const state = {};
                    obj = isArray(obj) ? obj : [obj];
                    for (let index = 0; index < obj.length; index++) {
                        const item = obj[index];
                        if (this._deps[item.key]) {
                            state[item.key] = item.value;
                        }
                    }
                    this.setState(state);
                };
                this._get = data => {
                    this._deps[data.key] = true;
                };
                this.store = context.store || Store.get();
                if (config.inject) {
                    if (context.injectStore) {
                        this.store = context.injectStore;
                    } else {
                        if (this.store === context.store) {
                            warning('Royjs is using Provider store to connect because the inject store is undefined');
                        } else {
                            warning('Royjs is using the first initialized store to connect because the inject store is undefined');
                        }
                    }
                }
                if (!this.store) {
                    warning('The store has not been initialized yet!');
                    return;
                }
                this.store.on('change', this._change);
                this.store.on('get', this._get);
                this.store.history = this.store.history || this.props.history;
                const store = this.store;
                if (!Component.prototype.store) {
                    Object.defineProperty(Component.prototype, 'store', {
                        get() {
                            warning("Do'nt use this.store in connect!");
                            return store;
                        }
                    });
                }
            }
            componentWillUnmount() {
                this.store.off('change', this._change);
                this.store.off('get', this._get);
            }
            componentDidMount() {
                const node = ReactDOM.findDOMNode(this);
                if (node) {
                    node._instance = this;
                }
            }
            setInstance = inc => {
                this._instance = inc;
            };
            get instance() {
                return this._instance;
            }
            render() {
                const props = mapStateToProps(this.store.state);
                const dispatch = this.store.dispatch;
                return <Component {...this.props} {...props} dispatch={dispatch} ref={this.setInstance} />;
            }
        }
        return StoreWrapper;
    };
};

export default connect;
