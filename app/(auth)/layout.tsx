import Image from 'next/image';
import { ReactNode } from 'react';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <main className='auth-container'>
      <section className='auth-form'>
        <div className='auth-box'>
          <div className='flex flex-row items-center gap-2'>
            <Image src='/icons/logo.svg' width={37} height={37} alt='Logo' />
            <h1 className='text-2xl font-semibold text-white'>BookWise</h1>
          </div>

          <div>{children}</div>
        </div>
      </section>

      <section className='auth-illustration'>
        <Image
          src='/images/auth-illustration.png'
          width={1000}
          height={1000}
          alt='Auth Illustration'
          className='size-full object-cover'
        />
      </section>
    </main>
  );
};

export default Layout;
