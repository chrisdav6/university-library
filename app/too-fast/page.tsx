const RateLimitPage = () => {
  return (
    <main className='root-container flex flex-col min-h-screen items-center justify-center'>
      <h1 className='font-bebas-neue text-5xl font-bold text-light-100'>
        Whoa! Slow down there, speedy!
      </h1>
      <p className='mt-3 text-center max-w-xl text-xl text-light-400'>
        Too many requests at once! Chill for a bit and try again later.
      </p>
    </main>
  );
};

export default RateLimitPage;
