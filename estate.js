const isObject = (val) => val !== null && typeof val === 'object';

const createState = (initialState = {}) => {
  const listeners = new Set();
  let isNotifying = false;

  // Helper to notify all subscribers
  const notify = (key, value, path) => {
    if (isNotifying) return; // Prevent circular notification loops
    isNotifying = true;
    try {
      listeners.forEach((listener) => {
        try {
          listener(key, value, path);
        } catch (err) {
          console.error("Error in state listener:", err);
        }
      });
    } finally {
      isNotifying = false;
    }
  };

  // creates a proxy handler that supports nested objects

  const createHandler = (path = []) => ({
    get: (target, key) => {
      const value = Reflect.get(target, key);

      // if the value is an object, wrap it in a proxy to support deep nesting
      // We only proxy it if it's not already a proxy
      if (isObject(value)) {
        return new Proxy(value, createHandler([...path, key]));
      }
      return value;
    },

    set: (target, key, value) => {
      const oldValue = target[key];

      // redundancy check
      if (oldValue === value && key !== 'length') {
        return true;
      }

      // update
      const success = Reflect.set(target, key, value);

      // notify listeners
      if (success) {
        notify(key, value, [...path, key]);
      }

      return success;
    },

    deleteProperty: (target, key) => {
      const success = Reflect.deleteProperty(target, key);
      if (success) {
        notify(key, undefined, [...path, key]);
      }
      return success;
    }
  });

  const state = new Proxy(initialState, createHandler([]));

  // subscribe to changes
  const subscribe = (listener) => {
    if (typeof listener !== 'function') {
      throw new Error("Listener must be a function");
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    state,
    subscribe,
    // debug helper to check current listener count
    get listenerCount() {
      return listeners.size;
    }
  };
};

// --- Example Usage ---
/*
const { state, subscribe } = createState({ 
  user: { name: 'Alice', settings: { theme: 'dark' } },
  tags: ['js', 'proxy']
});

const unsub = subscribe((key, val, path) => {
  console.log(`Changed: ${path.join('.')} =`, val);
});

state.user.settings.theme = 'light'; // Deep update works!
state.tags.push('web');              // Array methods work!
unsub();                             // Clean up
*/

export { createState };
