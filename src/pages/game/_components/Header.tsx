import { useEffect } from "react";
import { RESULT_MAP, RESULT_COLOR_MAP, RESULT_DESCRIPTION } from "@/constants";
import { dispatch as dispatchGameState } from "../_utils";
import { useStateStore } from "@/store";

// eslint-disable-next-line react/display-name
const Header = () => {
  const { gameResult } = useStateStore();

  useEffect(() => {
    dispatchGameState({
      type: "ready",
      param: {
        ready: true,
      },
    });
  });

  const data = gameResult;

  return (
    <>
      <header className="flex shadow mb-8 py-6 px-4 items-center relative">
        <img src="/Tiles/tile_0051.png" className="w-8" />
        <div className="font-semibold flex-1 text-primary text-2xl">
          Mini ZK Maze
        </div>
        {Number(data) !== 2 ? (
          <div className="flex h-full w-full top-0 left-0 justify-center items-center absolute">
            <div
              className="tooltip tooltip-bottom tooltip-accent"
              data-tip={RESULT_DESCRIPTION[Number(data)]}
            >
              <div className="cursor-pointer stats">
                {
                  <div className="py-2 stat">
                    <div
                      className={
                        "stat-figure text-" + RESULT_COLOR_MAP[Number(data)] ||
                        ""
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        className="h-8 stroke-current w-8 inline-block"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        ></path>
                      </svg>
                    </div>
                    <div className="stat-title">Your Achievement</div>
                    <div
                      className={
                        "stat-value text-" + RESULT_COLOR_MAP[Number(data)] ||
                        ""
                      }
                    >
                      {RESULT_MAP[Number(data)] || "--"}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
};

export default Header;
