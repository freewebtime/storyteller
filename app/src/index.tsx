import 'react-hot-loader/patch'

import * as React from 'react'
import { render } from 'react-dom'
import { AppView } from './view/AppView';
import { Store } from 'redux';
import { configureStore } from './data/helpers/configureStore';
import { IAppState } from './data/api/IAppState';

const reactContainer = document.getElementById('reactContainer')
const store: Store<IAppState> = configureStore();

const renderApp = () => {

  render(
    <AppView state={store.getState()} callback={store.dispatch} />,
    reactContainer
  )
}

store.subscribe(renderApp);

renderApp();
