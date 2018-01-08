import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import { AppView } from './view/AppView';
import { Store } from 'redux';
import { IAppState } from './data/api/IAppState';
import { configureStore } from './data/helpers/configureStore';

const reactContainer = document.getElementById('root');
const store: Store<IAppState> = configureStore();

const renderApp = () => {

	ReactDOM.render(
		<AppView state={store.getState()} callback={store.dispatch} />,
		reactContainer
	);
};

store.subscribe(renderApp);

renderApp();

//registerServiceWorker();
