'use server';
import { signIn } from '@/auth';
import { db } from '@/database/drizzle';
import { users } from '@/database/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import ratelimit from '../rateLimit';
import { redirect } from 'next/navigation';
import { workflowClient } from '../workflow';
import config from '../config';

export const signInWithCredentials = async (
  params: Pick<AuthCredentials, 'email' | 'password'>
) => {
  const { email, password } = params;

  const ipAddress = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await ratelimit.limit(ipAddress);

  if (!success) return redirect('/too-fast');

  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return { success: true };
  } catch (error) {
    console.log(error, 'Signin Error!');
    return {
      success: false,
      error: 'Signin Error!',
    };
  }
};

export const signUp = async (params: AuthCredentials) => {
  const { fullName, email, password, universityId, universityCard } = params;

  const ipAddress = (await headers()).get('x-forwarded-for') || '127.0.0.1';
  const { success } = await ratelimit.limit(ipAddress);

  if (!success) return redirect('/too-fast');

  //Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      success: false,
      error: 'User already exists!',
    };
  }

  //Create the user
  const hashedPassword = await hash(password, 10);

  try {
    await db.insert(users).values({
      fullName,
      email,
      universityCard,
      universityId,
      password: hashedPassword,
    });

    await workflowClient.trigger({
      url: `${config.env.prodApiEndpoint}/api/workflows/onboarding`,
      body: {
        email,
        fullName,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log(error, 'Signup Error!');
    return {
      success: false,
      error: 'Signup Error!',
    };
  }
};
