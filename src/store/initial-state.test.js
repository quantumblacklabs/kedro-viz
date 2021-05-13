import getInitialState from './initial-state';
import { saveState } from './helpers';
import animals from '../utils/data/animals.mock.json';

describe('getInitialState', () => {
  const props = { data: animals };

  it('throws an error when data prop is empty', () => {
    expect(() => getInitialState({})).toThrow();
  });

  it('returns an object', () => {
    expect(getInitialState(props)).toEqual(expect.any(Object));
  });

  it('returns full initial state', () => {
    expect(getInitialState(props)).toMatchObject({
      chartSize: {},
      textLabels: true,
      theme: 'dark',
      node: expect.any(Object),
      pipeline: expect.any(Object),
      visible: {
        exportBtn: true,
        labelBtn: true,
        layerBtn: true,
        themeBtn: true,
      },
    });
  });

  it('uses prop values instead of defaults if provided', () => {
    expect(
      getInitialState({
        ...props,
        theme: 'light',
        visible: { themeBtn: false },
      })
    ).toMatchObject({
      theme: 'light',
      visible: { labelBtn: true, themeBtn: false },
    });
  });

  it('uses localstorage values instead of defaults if provided', () => {
    const storeValues = {
      textLabels: false,
      theme: 'light',
    };
    saveState(storeValues);
    expect(getInitialState(props)).toMatchObject(storeValues);
    window.localStorage.clear();
  });

  it('uses prop values instead of localstorage if provided', () => {
    saveState({ theme: 'light' });
    expect(getInitialState({ ...props, theme: 'dark' })).toMatchObject({
      theme: 'dark',
    });
    window.localStorage.clear();
  });

  it('hides parameters when parameter flag is true', () => {
    const state = getInitialState({
      ...props,
      flags: {
        parameters: true,
      },
    });
    const parametersDisabled = state.nodeType.disabled.parameters;
    expect(parametersDisabled).toBe(true);
  });

  it('applies localStorage values on top of initial state', () => {
    const localStorageState = {
      theme: 'foo',
      node: { disabled: { abc123: true } },
    };
    saveState(localStorageState);
    expect(getInitialState(props)).toMatchObject(localStorageState);
    window.localStorage.clear();
  });

  it('sets main pipeline as active if active pipeline from localStorage is not one of the pipelines in the current list', () => {
    const localStorageState = {
      pipeline: { active: 'unknown pipeline id' },
    };
    saveState(localStorageState);
    const state = getInitialState(props);
    expect(state.pipeline.active).toBe(animals.selected_pipeline);
    window.localStorage.clear();
  });

  it('overrides flags with values from URL', () => {
    // In this case, location.href is not provided
    expect(getInitialState(props)).toMatchObject({
      flags: {
        oldgraph: expect.any(Boolean),
      },
    });
  });

  it('overrides theme with value from prop', () => {
    const theme = 'test';
    expect(getInitialState({ ...props, theme })).toMatchObject({ theme });
  });

  it('overrides visible with values from prop', () => {
    const visible = {
      miniMap: true,
      sidebar: false,
      themeBtn: false,
    };
    expect(getInitialState({ ...props, visible })).toMatchObject({ visible });
  });
});
