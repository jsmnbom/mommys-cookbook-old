import _Vue from 'vue';
import { UserInfo } from 'firebase';

const baseStore: {
    user: UserInfo | null,
} = {
    user: null,
};

export const store = _Vue.observable(baseStore);

export function StorePlugin(Vue: typeof _Vue, options?: any): void {
    Object.defineProperty(_Vue.prototype, '$store', {
        get() { return store; },
    });
}
