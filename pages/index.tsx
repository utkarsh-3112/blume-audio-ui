import Head from "next/head";
import NoteForm from "../components/NoteForm";

const Home = (): JSX.Element => {
  return (
    <div>
      <Head>
        <meta
          http-equiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
        <title>Create Notes from Audio</title>
      </Head>
      <div className="flex items-center justify-center h-screen">
        <div className="w-80 p-6 bg-white rounded shadow">
          <h1 className="text-2xl font-bold mb-6 text-black">
            Create Notes from Audio
          </h1>
          <NoteForm />
        </div>
      </div>
    </div>
  );
};

export default Home;
