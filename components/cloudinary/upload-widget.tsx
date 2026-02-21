import { useEffect, useRef, useState } from "react";

import Script from "./script";
import {
  CloudinaryInstance,
  UploadWidgetError,
  UploadWidgetInstance,
  UploadWidgetProps,
  UploadWidgetResults,
} from "./upload-widget.type";

const UploadWidget = ({ children, onSuccess, onError }: UploadWidgetProps) => {
  const cloudinary = useRef<CloudinaryInstance | null>(null);
  const widget = useRef<UploadWidgetInstance | null>(null);

  const [isScriptLoading, setIsScriptLoading] = useState(true);

  const uploadOptions = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  };

  function handleOnLoad() {
    setIsScriptLoading(false);


    if (!cloudinary.current && typeof window) {
      cloudinary.current = (window as any).cloudinary;
    }


    function onIdle() {
      if (!widget.current) {
        widget.current = createWidget();
      }
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(onIdle);
    } else {
      setTimeout(onIdle, 1);
    }
  }

  useEffect(() => {
    return () => {
      widget.current?.destroy();
      widget.current = undefined;
      cloudinary.current = undefined;
    };
  }, []);

  function createWidget() {
    return cloudinary.current?.createUploadWidget(
      uploadOptions,
      function (error: UploadWidgetError, result: UploadWidgetResults) {
        if (error && typeof onError === "function") {
          onError(error, widget.current);
        }

        if (result.event === "success" && typeof onSuccess === "function") {
          onSuccess(result, widget.current);
        }
      }
    );
  }

  const open = () => {
    if (!widget.current) {
      widget.current = createWidget();
    }

    widget.current.open();
  };

  return (
    <>
      {typeof children === "function" && children({ cloudinary, widget, open })}
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        onLoad={handleOnLoad}
        onError={() => console.error(`Failed to load Cloudinary Upload Widget`)}
      />
    </>
  );
};

export default UploadWidget;
