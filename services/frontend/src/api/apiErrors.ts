import {RequestError} from "store/types";

/* This file contains utilities for better identifying/specifying specific API errors. */

export interface ApiError {
    code?: number;
    errors?: Array<RequestError>;
}

export const entityAlreadyExists = (error: ApiError) =>
    error?.code === 400 && error?.errors?.[0]?.message === "id must be unique";
