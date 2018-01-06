import 'react-hot-loader/patch'

import * as React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { AppView } from './view/AppView';
import { Store } from 'redux';
import { configureStore } from './data/helpers/configureStore';
import { IAppState } from './data/api/IAppState';

const reactContainer = document.getElementById('reactContainer')
const store: Store<IAppState> = configureStore();

const renderApp = () => {

  render(
    <AppContainer>
      <AppView state={store.getState()} callback={store.dispatch} />
    </AppContainer>
    ,
    reactContainer
  )
}

const renderAppHot = () => {
  const NextApp: typeof AppView = require<{ default: typeof AppView }>('./view/AppView').default
  render(
    <AppContainer>
      <NextApp state={store.getState()} callback={store.dispatch} />
    </AppContainer>
    ,
    reactContainer
  )
}

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept(renderAppHot);
}

store.subscribe(renderApp);

renderApp();
