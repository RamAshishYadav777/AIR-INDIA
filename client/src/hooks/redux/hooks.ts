// src/hooks/redux/hooks.ts
import {  useDispatch, useSelector } from "react-redux";
import type{ TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Typed Redux hooks for your app.
 * Always use these instead of raw useDispatch/useSelector.
 */

// ✅ Typed dispatch (handles async thunks correctly)
export const useAppDispatch = () => useDispatch<AppDispatch>();

// ✅ Typed selector (state.auth, state.flights, etc.)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
