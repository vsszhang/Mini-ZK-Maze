export const Hero = () => {
  return (
    <div
      className="min-h-screen hero"
      style={{
        backgroundImage: "url(/nauris-amatnieks-forestbattlebackground.jpg)",
      }}
    >
      <div className="bg-opacity-60 hero-overlay"></div>
      <div className="text-center text-neutral-content hero-content">
        <div className="max-w-md">
          <h1 className="font-bold mb-5 text-5xl">ZK Maze</h1>
          <p className="mb-5">
            In this maze game, wit and strategy are your tools. Find the
            shortest path, skillfully avoid obstacles, and victory is within
            reach. Ready? Adventure is calling!
          </p>
          <button className="btn btn-primary" onClick={() => {}}>
            Start the game
          </button>
        </div>
      </div>
    </div>
  );
};
