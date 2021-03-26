import { RootState } from './store'

function isRootState(o: any): o is RootState {
    return "name" in o && "description" in o
  }

type ParseResult<T> =
  | { parsed: T; hasError: false; error?: undefined }
  | { parsed?: undefined; hasError: true; error?: unknown }

const safeJsonParse = <T>(guard: (o: any) => o is T) => (text: string): ParseResult<T> => {
    const parsed = JSON.parse(text)
    return guard(parsed) ? { parsed, hasError: false } : { hasError: true }
  }

export function load(){
    try {
        const serializedState = localStorage.getItem('pyramidNotificationState');
        if (serializedState === null) {
            return {};
        }
        let res = safeJsonParse(isRootState)(serializedState);
        if (res.hasError) {
            return JSON.parse(serializedState);
        } else {
            return res.parsed;
        }
    } catch (err) {
        throw EvalError();
    }
}

export const saveState = (state: RootState) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('pyramidNotificationState', serializedState);
    } catch {
    }
};
