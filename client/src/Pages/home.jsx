import Navbar from "../Components/Navbar";

export default function Home() {
  return (
    <div className="bg-purple-950 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-5xl font-bold mb-4 text-yellow-400">
          Welcome to Meeting_Ease!
        </h1>
        <p className="text-lg text-purple-200">
          Assists you to plan, manage and track your meeting easily!
        </p>
      </div>
    </div>
  );
}
