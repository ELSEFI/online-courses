import Aurora from "./Aurora";

export const Home = () => {
  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <Aurora
          colorStops={["#22c55e", "#a855f7", "#22c55e"]}
          blend={0.8}
          amplitude={1.2}
          speed={0.3}
        />
      </div>
    </div>
  );
};
