import BookList from '@/components/BookList';
import { Button } from '@/components/ui/button';
import { sampleBooks } from '@/constants';
import { signOut } from '@/auth';

const MyProfile = () => {
  return (
    <div>
      <form
        className='mb-10'
        action={async () => {
          'use server';
          await signOut();
        }}
      >
        <Button>Log Out</Button>
      </form>

      <BookList
        title='Borrowed Books'
        books={sampleBooks}
        containerClassName='mt-28'
      />
    </div>
  );
};

export default MyProfile;
