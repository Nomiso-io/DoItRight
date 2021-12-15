# Frontend for DoItRight

Frontend has the complete UI of the DoItRight application. It is written in Typescript with React Hooks, Material-UI 4 and React-Redux 7 (with hooks!).

## Reference

-   [x] [Material-UI](https://github.com/mui-org/material-ui)
-   [x] [Typescript](https://www.typescriptlang.org/)
-   [x] [React](https://facebook.github.io/react/)
-   [x] [Redux](https://github.com/reactjs/redux)
-   [x] [Redux-Thunk](https://github.com/gaearon/redux-thunk)
-   [x] [Redux-Persist](https://github.com/rt2zz/redux-persist)
-   [x] [React Router](https://github.com/ReactTraining/react-router)
-   [x] [Redux DevTools Extension](https://github.com/zalmoxisus/redux-devtools-extension)
-   [x] [TodoMVC example](http://todomvc.com)
-   [x] PWA Support


## How to use

Download or clone this repo

Install it and run:

```bash
npm i
npm start
```

## Enable PWA ServiceWorker [OPTIONAL]

Just comment in the following line in the `index.tsx`:

```javascript
// registerServiceWorker();
```

to

```javascript
registerServiceWorker();
```

## Enable Prettier [OPTIONAL]

1.  Step: Install the Prettier plugin (e.g. the one of Esben Petersen)
2.  Add the following snippet to your settings in VSCode:

```json
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
       "source.organizeImports": true // optional
   },
```

## Contributors

## About the author

This project is maintaned by [NomiSo Inc.](https://nomiso.io/products).

