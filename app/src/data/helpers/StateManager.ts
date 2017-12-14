import { IState } from '../api/IState';
import { IStateManager } from '../api/IStateManager';
import { IAction } from '../api/IAction';
import { Store } from 'redux';
import { configureStore } from '../configureStore';

export class StateManager implements IStateManager<IState> {
  store: Store<IState>;
  callback?: (stateManager: IStateManager<IState>) => void;

  constructor(callback?: (stateManager: IStateManager<IState>)=>void) {
    this.store = configureStore<IState>();
    if (callback) {
      this.store.subscribe(this.onStateChanged);
    }
  }

  onStateChanged = () => {
    if (this.callback) {
      this.callback(this);
    }
  }

  getState = (): IState => {
    return this.store.getState();
  }

  dispatch = (action: IAction) => {
    this.store.dispatch(action);
  }

}
