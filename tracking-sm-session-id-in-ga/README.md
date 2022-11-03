# Tracking SM Session ID in GA

The purpose of this document is to walk through the steps needed to add the Soul Machines session ID as an event to Google Analytics from a React application. 

This guide is written assuming that you have the following:
1. The current [React Reference UI](https://github.com/soulmachines/react-reference-ui) template developed by Soul Machines 
2. GA4 version of Google Analytics with tracking code

## Steps
1. Retrieve the SM session ID from the websdk and save to application state
2. Use the [`react-ga4`](https://www.npmjs.com/package/react-ga4) npm package to send session ID to GA.

### Setting Session ID

In the React template, the redux store (`src/store/sm/index.js`) is responsible for establishing a connection to the Soul Machines server using our websdk. Once a connection has been established, we can retrieve the session ID from the Scene instance and save in into our redux store.

1. In the `initialState` declaration in the `index.js` file, add `sessionId: null,` as a new property. 
2. In the reducers property of your `smSlice` (`const smSlice = createSlice({`), add a new `setSessionId` reducer.
      ```js
      setSessionId: (state, { payload }) => ({
        ...state,
        sessionId: payload.sessionId,
      }),
      ```
    ![Screen Shot 2022-10-24 at 12 32 36 PM](https://user-images.githubusercontent.com/97319962/197622639-5ddf29eb-8777-45ec-8c65-9b0744fc9a0a.png)
3. After connecting with the scene (`scene.connect()`), dispatch the setSessionId action to update the session ID in the store.
      ```js
      const { sessionId } = scene.session();
      thunk.dispatch(actions.setSessionId({
        sessionId,
      }));
      ```

After completing these steps, the custom UI will now have reference to the SM session ID included in its state. The next step will be to send that session ID to our GA instance from our `Router` component.

### Send session ID to GA

To send the session ID to GA, we will use an open source NPM package called `react-ga4` to connect with our GA instance. However our first step will be to set our GA tracking code in our deployed environment. 

> Note: The current iteration of the React template includes a package `react-ga`. Unfortunately, `react-ga` does not support the GA4 product from Google and have indicated that they do not plan to in the future. The `react-ga4` package used in this guide was specifically developed to address this issue.

1. In the React app's `.env` file, update the `REACT_APP_GA_TRACKING_ID` to your GA instance's tracking code. ex: `REACT_APP_GA_TRACKING_ID=<your tracking id>`
![Screen Shot 2022-10-24 at 12 42 46 PM](https://user-images.githubusercontent.com/97319962/197622291-8279711d-6b44-49f2-b24c-34620ffa0ea3.png)

2. Include `react-ga4` in your package.json by running `npm install react-ga4` in the root of your application.
3. In the `Router` component (./src/components/Router.js), update the `ReactGA` import to come from `react-ga4`. ex: 
      ```js
      import ReactGA from 'react-ga4';
      ```
4. Initialize the `react-ga` instance when a `REACT_APP_GA_TRACKING_ID` is present. ex:
      ```js
      const { REACT_APP_GA_TRACKING_ID } = process.env;
      if (REACT_APP_GA_TRACKING_ID) {
        ReactGA.initialize(REACT_APP_GA_TRACKING_ID, {
          debug: true,
        });
      }
      ```
5. Expose the `sessionId` property from the app state to this component by including it in `mapStateToProps` and the `connect` export.
      ```js
      const mapStateToProps = ({ sm }) => ({
        sessionId: sm.sessionId,
      });

      export default connect(mapStateToProps)(App);
      ```
      Also include the `sessionId` reference in your `App` declaration. ex: 
      ```js 
      function App({ sessionId }) { 
      ```

6. Once the session ID populates, use the `gtag` React GA method to send the session ID to your GA instance. 
      ```js
      function App({ sessionId }) {
        if (sessionId) {
          ReactGA.gtag('event', 'sm_session_id', { sm_session_id: sessionId });
        } else {
          console.log('NO SESSION ID');
        }
      ```

With this step completed, you will now receive and event with the session ID for every user that visits the application.
![Screen Shot 2022-10-24 at 1 26 18 PM](https://user-images.githubusercontent.com/97319962/197622525-ea8ba434-8573-47f2-b27b-42b2381c440a.png)