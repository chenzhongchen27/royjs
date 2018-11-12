import {Store, inject} from '../../src/';
import devtools from '../../src/plugins/devtools';
import React from 'react';
import ReactDOM from 'react-dom';

const logger = function (store) {
    store.subscribe(obj => {
        console.log(obj.type, obj.payload, obj.state.toJSON());
    });
};

const store = new Store({
    state: {
        count: 0,
        list: []
    },
    actions: {
        add(state, payload) {
            const {count} = state;
            state.set('count', count + 1);
            state.list.push('1');
        },
        reduce(state, payload) {
            const {count} = state;
            state.set('count', count - 1);
        },
        async asyncAdd(state, payload) {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 500);
            });
            this.dispatch('add');
        }
    }
}, {
    plugins: [logger, devtools]
});

@inject(store)
class App extends React.Component {
    render() {
        const {count, list} = this.store.state;
        const {dispatch} = this.store;
        return (<div>
            {count}
            list: {list.length}
            <button onClick={() => dispatch('add')}>add</button>
            <button onClick={() => dispatch('reduce')}>reduce</button>
            <button onClick={() => dispatch('asyncAdd')}>async</button>
        </div>);
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
