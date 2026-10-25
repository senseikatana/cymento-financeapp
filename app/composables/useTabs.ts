import type { InjectionKey, Ref } from 'vue';

export interface TabsContext {
  activeTab: Ref<string>;
  setTab: (value: string) => void;
}

export const TABS_CONTEXT_KEY: InjectionKey<TabsContext> = Symbol('tabs-context');
