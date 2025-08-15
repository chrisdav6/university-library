'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import config from '@/lib/config';
import { IKImage, IKUpload, IKVideo, ImageKitProvider } from 'imagekitio-next';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

interface Props {
  type: 'image' | 'file';
  accept: string;
  placeholder: string;
  folder: string;
  variant: 'dark' | 'light';
  onFileChange: (filePath: string) => void;
}

const ImageUpload = ({
  onFileChange,
  type,
  accept,
  placeholder,
  folder,
  variant,
}: Props) => {
  const [file, setFile] = useState<{ filePath: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const ikUploadRef = useRef(null);

  const styles = {
    button:
      variant === 'dark'
        ? 'bg-dark-300'
        : 'bg-light-600 border-gray-100 border',
    placeholder: variant === 'dark' ? 'text-light-100' : 'text-slate-500',
    text: variant === 'dark' ? 'text-light-100' : 'text-dark-400',
  };

  const onError = (error: any) => {
    console.log(error);

    toast.error(`${type} failed to upload!`, {
      className: 'toast-error',
    });
  };

  const onSuccess = (res: any) => {
    setFile(res);
    onFileChange(res.filePath);

    toast.success(`${type} uploaded successfully!`, {
      description: `${res.filePath} uploaded just now!`,
      className: 'toast-success',
    });
  };

  const onValidate = (file: File) => {
    if (type === 'image') {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20mb!', {
          className: 'toast-error',
        });

        return false;
      }
    } else if (type === 'video') {
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50mb!', {
          className: 'toast-error',
        });

        return false;
      }
    }

    return true;
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({ loaded, total }) => {
          const percent = Math.round((loaded / total) * 100);
          setProgress(percent);
        }}
        folder={folder}
        accept={accept}
        className='hidden'
      />

      <button
        className={cn('upload-btn', styles.button)}
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
        <p className={cn('text-base', styles.placeholder)}>{placeholder}</p>

        {file && (
          <p className={cn('upload-filename', styles.text)}>{file.filePath}</p>
        )}
      </button>

      {progress > 0 && progress !== 100 && (
        <div className='w-full rounded-full bg-green-200'>
          <div className='progress' style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {file &&
        (type === 'image' ? (
          <IKImage
            alt={file.filePath}
            path={file.filePath}
            width={500}
            height={300}
          />
        ) : type === 'video' ? (
          <IKVideo
            path={file.filePath}
            controls={true}
            className='h-96 w-full rounded-xl'
          />
        ) : null)}
    </ImageKitProvider>
  );
};

export default ImageUpload;
