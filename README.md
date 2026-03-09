
# estate state manager

fancier version of one tweet state manager
[https://x.com/ilhannegis/status/1627411077783859201?s=20](https://x.com/ilhannegis/status/1627411077783859201?s=20)

## usage and example

```javascript
const { state, subscribe } = createState({
  count: 0,
  user: { name: 'Dev' }
});

// Subscribe to changes
const unsubscribe = subscribe((key, value, path) => {
  console.log(`Change detected at ${path.join('.')}:`, value);
});

// Updates trigger the listener
state.count++; 
state.user.name = 'New Name';

// Clean up when done
unsubscribe();
```

Deep Nesting & Arrays

The proxy recursively wraps objects, so standard array methods and deep assignments work out of the box:

```javascript
state.items = [];
state.items.push('First Item'); // Notifies: items.0 = 'First Item'
```
