/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useState, useEffect, useRef } from "react";
import FileSaver from "file-saver";
import { generatePublicInput, gameState } from "../_utils";
import { PROGRAM_STRING, RESULT_MAP, RESULT_COLOR_MAP } from "@/constants";
import * as myWorker from "../_utils/zkpWorker.ts";
import { useStateStore } from "@/store";
import { zkpVerifyLocally } from "@/api/zkp.ts";
import { useDispatchStore } from "@/store";

export const GameOver = ({
  onRefresh,
  onExit,
}: {
  onRefresh: () => void;
  onExit: () => void;
}) => {
  const dispatch = useDispatchStore();

  const { path } = gameState;
  const [step, setStep] = useState(0);
  const [zkpResult, setZkpResult] = useState<string | undefined>();
  const [publicInput, setPublicInput] = useState<string | undefined>();
  const [programHash, setProgramHash] = useState<string | undefined>();
  const [errorMsg, setErrorMsg] = useState<string | undefined>();
  const { gameResult } = useStateStore();

  useEffect(() => {
    console.log("onRefresh func active...");
    onRefresh?.();
  }, [onRefresh]);

  const userSelect = useRef<boolean>();

  const hiddenStepIndex = useRef<number[]>([]);

  const SettlementProgress = [
    {
      prefix: "$",
      content: ["Game completed!"],
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 100);
        });
      },
    },
    {
      prefix: ">",
      content: ["Settlement in progress..."],
      class: "text-warning",
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 100);
        });
      },
    },
    {
      prefix: ">",
      content: ["Generate Zero Knowledge Proof locally"],
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          const { StartPosition, ExitPosition, ShortestPathLength, Map } =
            gameState;
          console.log(
            "generate zkp",
            StartPosition,
            ExitPosition,
            ShortestPathLength
          );
          const publicInput = generatePublicInput(
            Map,
            StartPosition,
            ExitPosition,
            ShortestPathLength
          );
          const secretInput = path
            .map((item) => [item.x, item.y])
            .flat()
            .join(",");
          setPublicInput(publicInput);
          console.log("publicInput", publicInput, "secretInput", secretInput);
          myWorker.onmessage({
            data: [PROGRAM_STRING, publicInput, secretInput],
            postMessage: (e) => {
              const _zkpResult = e.data;
              if (_zkpResult && e.programHash) {
                setProgramHash(e.programHash);
                setZkpResult(_zkpResult);
                resolve(true);
              } else {
                reject("generate zkp fail!");
              }
            },
          });
        });
      },
    },
    {
      prefix: "$",
      hideLoading: true,
      content: [
        "Verify Your Game Path ZKP on verifer service?",
        <>
          {userSelect.current !== false && (
            <button
              className="rounded-none text-warning btn btn-xs btn-ghost"
              disabled={userSelect.current !== undefined}
              onClick={() => {
                userSelect.current === undefined && (userSelect.current = true);
              }}
            >
              [Yes]
            </button>
          )}
          {userSelect.current !== true && (
            <button
              className="rounded-none text-warning btn btn-xs btn-ghost"
              disabled={userSelect.current !== undefined}
              onClick={() => {
                userSelect.current === undefined &&
                  (userSelect.current = false);
              }}
            >
              [No]
            </button>
          )}
        </>,
      ],
      class: "",
      run: () => {
        return new Promise((resolve, reject) => {
          const timer = setInterval(() => {
            if (userSelect.current === true) {
              clearInterval(timer);
              resolve(true);
            } else if (userSelect.current === false) {
              clearInterval(timer);
              reject(`User Cancel!`);
            }
          }, 200);
        });
      },
    },
    {
      prefix: ">",
      content: ["Verify proof on local ZKP VERIFIER service"],
      class: "text-success",
      run: () => {
        return new Promise((resolve, reject) => {
          if (programHash && publicInput && zkpResult) {
            console.log("2/4:", programHash, publicInput, zkpResult);
            const zkpVerifyPayload = JSON.stringify({
              program_hash: programHash,
              stack_inputs: publicInput,
              zkp_result: JSON.parse(zkpResult),
            }).replace(/\\/g, "");
            zkpVerifyLocally(zkpVerifyPayload)
              .then((res) => {
                const zkpVerifierResult = res.is_valid;
                console.log("verifier result: ", zkpVerifierResult);
                if (zkpVerifierResult === true) {
                  // Store zkp verify result in gameResult
                  dispatch &&
                    dispatch({
                      type: "update",
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      param: Number(JSON.parse(zkpResult).outputs.stack[0]),
                    });
                  resolve(true);
                } else {
                  // Update gameResult as 3, when failed to pass zkp verifier judgment.
                  dispatch &&
                    dispatch({
                      type: "update",
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      param: 3,
                    });
                  reject(false);
                }
              })
              .catch((error) => {
                console.log(error);
              });
            console.log("Over, kids");
          } else {
            reject;
          }
        });
      },
    },
    {
      prefix: ">",
      content: ["Determine achievement from ZK VM output"],
      class: "text-success",
      run: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, 1000);
        });
      },
    },
  ];

  const SettlementOver = step >= SettlementProgress.length;

  useEffect(() => {
    if (!SettlementOver) {
      void SettlementProgress[step]
        .run?.()
        .then((res) => {
          if (res) {
            setStep(step + 1);
          }
        })
        .catch((err) => {
          setErrorMsg(err);
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="flex flex-col h-full text-white w-full p-4 top-0 left-0 absolute justify-center items-center">
      <div className="bg-base-100 text-base-content min-h-20 mockup-code">
        {SettlementProgress.slice(0, step + 1).map((log, index) => {
          return hiddenStepIndex.current.includes(index) ? null : (
            <pre
              data-prefix={log.prefix}
              className={errorMsg && step === index ? " text-error" : log.class}
              key={index}
            >
              {step === index && !errorMsg && !log.hideLoading && (
                <span className="loading loading-ball loading-xs"></span>
              )}
              {log.content.map((cont, index) => (
                <code
                  style={
                    index > 0
                      ? {
                          display: "block",
                          paddingLeft: "40px",
                        }
                      : {}
                  }
                  key={index}
                >
                  {cont}
                </code>
              ))}
            </pre>
          );
        })}

        {SettlementOver && (
          <pre
            data-prefix=">"
            className={`bg-${RESULT_COLOR_MAP[gameResult]} text-${RESULT_COLOR_MAP[gameResult]}-content`}
          >
            <code>Game Result: {RESULT_MAP[gameResult]}!</code>
          </pre>
        )}

        <div className="mt-4 text-center w-full px-4">
          {zkpResult && (
            <button
              className="rounded-none text-success btn btn-xs btn-ghost"
              onClick={() => {
                const blob = new Blob([zkpResult], {
                  type: "application/json;charset=utf-8",
                });
                FileSaver.saveAs(blob, `zkp-${new Date().getTime()}.json`);
              }}
            >
              [Save ZKP]
            </button>
          )}
          {(SettlementOver || errorMsg) && (
            <button
              className="rounded-none text-error btn btn-xs btn-ghost"
              onClick={() => {
                setErrorMsg(undefined);
                onExit();
              }}
            >
              [Exit]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
