import { Cloudinary } from "@cloudinary/url-gen";
import { useEffect, useRef } from "react";

// Based on:
// - https://cloudinary.com/documentation/upload_widget
// - https://stackblitz.com/edit/cloudinary-upload-widget-react
export function ImageUpload({ setImageUrl, setError }) {
  const uploadWidgetRef = useRef(null);
  const uploadButtonRef = useRef(null);

  const cld = new Cloudinary({
    cloud: {
      cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }
  });

  const config = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    sources: ["local", "url", "camera"],
    multiple: false,
    maxFiles: 1,
    clientAllowedFormats: "image",
    singleUploadAutoClose: false
  }

  console.log(window);

  useEffect(() => {
    const initializeUploadWidget = () => {
      if (window.cloudinary && uploadButtonRef.current) {
        // Create upload widget
        uploadWidgetRef.current = window.cloudinary.createUploadWidget(
          config,
          (error, result) => {
            if (!error && result && result.event === 'success') {
              setImageUrl(result.info.url);

            } else if (error) {
              setError(error);
            }
          }
        );

        // Add click event to open widget
        const handleUploadClick = () => {
          if (uploadWidgetRef.current) {
            uploadWidgetRef.current.open();
          }
        };

        const buttonElement = uploadButtonRef.current;
        buttonElement.addEventListener('click', handleUploadClick);

        // Cleanup
        return () => {
          buttonElement.removeEventListener('click', handleUploadClick);
        };
      }
    };

    console.log("enter use effect");
    initializeUploadWidget();
  }, [config, setImageUrl]);

  return (
    <>
      <button
        type="button"
        ref={uploadButtonRef}
        id="upload_widget"
        className="cloudinary-button"
      >
        Upload
      </button>
    </>
  );
}