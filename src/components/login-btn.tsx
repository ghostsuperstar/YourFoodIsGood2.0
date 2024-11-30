import { signIn, signOut, useSession, } from "next-auth/react";

 const LoginButton = () => {
  const { data: session } = useSession();

  return (
    <div>
      {session ? (
        <>
          <p>{session.user?.email}</p>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button onClick={() => signIn("google")}>Sign in with Google</button>
      )}
    </div>
  );
};

export default LoginButton;
