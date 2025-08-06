'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import config from '@/lib/config';
import { IKImage, IKUpload, ImageKitProvider } from 'imagekitio-next';
import { toast } from 'sonner';

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.apiEndpoint}/api/auth/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status: ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return {
      signature,
      expire,
      token,
    };
  } catch (error: any) {
    throw new Error(`Authentication request failed!: ${error.message}`);
  }
};

const ImageUpload = ({
  onFileChange,
}: {
  onFileChange: (filePath: string) => void;
}) => {
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const ikUploadRef = useRef(null);

  const onError = (error: any) => {
    console.log(error);

    toast.error('Image failed to upload!', {
      className: 'toast-error',
    });
  };

  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast.success('Image uploaded successfully!', {
      description: `${res.filePath} uploaded just now!`,
      className: 'toast-success',
    });
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className='hidden'
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        fileName='test-upload.png'
      />

      <button
        className='upload-btn'
        onClick={(e) => {
          e.preventDefault();

          if (ikUploadRef.current) {
            //@ts-ignore
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src='/icons/upload.svg'
          width={20}
          height={20}
          alt='Upload Icon'
          className='object-contain'
        />
        <p className='text-base text-light-100'>Upload a file</p>

        {file && <p className='upload-filename'>{file.filePath}</p>}
      </button>

      {file && (
        <IKImage
          alt={file.filePath}
          path={file.filePath}
          width={500}
          height={500}
        />
      )}
    </ImageKitProvider>
  );
};

export default ImageUpload;
