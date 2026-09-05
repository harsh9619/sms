import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { rootReducer } from "./rootReducer";
import { rootSaga } from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppState = RootState;

export * from "./auth";
export * from "./school";
export * from "./students";
export * from "./teachers";
export * from "./classes";
export * from "./users";
export * from "./fees";
export * from "./salaries";
export * from "./timetables";
export * from "./homework";
export * from "./notices";
export * from "./marks";
export * from "./attendance";
