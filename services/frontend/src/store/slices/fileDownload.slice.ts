import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";

// This slice is just kind of a hacky way to enable file downloading through Redux.
// By writing to the `fileContents` state, a connected component will take the string (of perhaps JSON
// stringified content), turn it into a file blob, and attach it to an anchor tag and click it.
// This effectively simulates downloading a file.

// See https://stackoverflow.com/a/44661948 and https://stackoverflow.com/a/26158579 as references.

/* State */

interface FileDownloadState {
    fileContents: string;
    fileName: string;
}

const initialState: FileDownloadState = {fileContents: "", fileName: ""};

/* Selectors */

const selectState = (state: State): FileDownloadState => state[mounts.fileDownload];

const selectFileContents = createSelector([selectState], (state) => state.fileContents);
const selectFileName = createSelector([selectState], (state) => state.fileName);

const selectors = {
    selectState,
    selectFileContents,
    selectFileName
};

/* Slice */

export const fileDownloadSlice = createSliceWithSelectors({
    name: mounts.fileDownload,
    initialState,
    reducers: {
        resetState: () => initialState,
        setFile: (
            state: FileDownloadState,
            action: PayloadAction<{contents: string; name: string}>
        ) => {
            const {contents, name} = action.payload;

            state.fileContents = contents;
            state.fileName = name;
        }
    },
    selectors
});
