import { applyMiddleware, compose, createStore, Store } from 'redux';
import { appReducer } from '../reducers/appReducer';
import { loadState } from './LocalStorageHelper';

const initialState = loadState();

export const configureStore = <TState>(): Store<TState> => {
  const store = createStore(
    appReducer,
    initialState,
    compose(
      //applyMiddleware(reduxLogger),
      window[('devToolsExtension')] ? window[('devToolsExtension')]() : f => f
    )
  );

  return store;
}


