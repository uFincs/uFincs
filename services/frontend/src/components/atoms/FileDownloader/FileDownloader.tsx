import React, {useEffect, useRef, useState} from "react";
import connect, {ConnectedProps} from "./connect";

interface FileDownloaderProps extends ConnectedProps {}

/** A component that connects to the `fileDownload` slice to enable arbitrary file downloads from Redux. */
const FileDownloader = ({fileContents, fileName, clearFileState}: FileDownloaderProps) => {
    const anchorRef = useRef<HTMLAnchorElement | null>(null);
    const [fileUrl, setFileUrl] = useState("");

    useEffect(() => {
        // When the slice has file contents, construct the file blob and set the 'url'.
        if (fileContents) {
            const blob = new Blob([fileContents], {type: "application/json"});
            const url = URL.createObjectURL(blob);

            setFileUrl(url);
        }
    }, [fileContents]);

    useEffect(() => {
        // Once the ulr has been set, 'click' the anchor link to trigger the file download.
        if (fileUrl && anchorRef.current) {
            anchorRef.current.click();

            setTimeout(() => {
                // Once the download has been triggered, we can clear the store/component state.
                clearFileState();
                setFileUrl("");
            }, 0);
        }
    }, [fileUrl, clearFileState]);

    return fileUrl ? (
        // eslint-disable-next-line
        <a
            style={{display: "hidden"}}
            aria-hidden="true"
            href={fileUrl}
            download={fileName}
            ref={anchorRef}
        />
    ) : null;
};

export default connect(FileDownloader);
