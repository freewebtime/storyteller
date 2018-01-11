import { compose, createStore, Store } from 'redux';
import { loadState } from './localStorageHelper';
import { appReducer } from '../reducers/appReducer';

const initialState = loadState();

export const configureStore = <TState>(): Store<TState> => {
  const store = createStore(
    appReducer,
    initialState,
    compose(
      window[('devToolsExtension')] ? window[('devToolsExtension')]() : f => f
    )
  );
  // store.dispatch({type: 'No operation'});

  return store;
};
