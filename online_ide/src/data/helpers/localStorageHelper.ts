import { appConfig } from '../config/appConfig';
export const loadState = () => {
    if (!appConfig.isLoadFromLocalStorage) {
        return undefined;
    }

    try {
        const serializedState = localStorage.getItem('state');
        if (!serializedState) {
            return undefined;
        }

        return JSON.parse(serializedState);
    } catch (err) {
        return undefined;
    }
};

export const saveState = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('state', serializedState);
    } catch (err) {
        // ignore it
        console.error(err);
    }
};
