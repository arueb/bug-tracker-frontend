// import { createStore, applyMiddleware } from "redux";
// import { devToolsEnhancer } from "redux-devtools-extension";
// import func from "./middleware/func";
// import reducer from "./bugs";

import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import reducer from "./reducer";
import logger from "./middleware/logger";
import toast from "./middleware/toast";
import api from "./middleware/api";
export default function () {
  //   const store = createStore(reducer, applyMiddleware(logger), devToolsEnhancer({ trace: true }));
  // calling this function returns a redux store
  return configureStore({
    reducer,
    middleware: [
      ...getDefaultMiddleware(),
      // logger("console"),
      toast,
      api,
    ],
  });
}
