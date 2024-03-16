```
npx near2ts devhub.near
```

or

```
npx near2ts ./devhub.near_abi.json
```

Also works as dev dependency

```

npm i near2ts --save-dev

```
package.json

```
  "scripts": {
    "near2ts": "near2ts"
  },

```

TODO
- dev dependency uses local version before node modules so if you have the non rs cli installed its using that one instead making it fail
