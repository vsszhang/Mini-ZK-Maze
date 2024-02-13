import { useStateStore } from "@/store";
import { Game } from "./_components/Game";
import { Hero } from "./_components/Hero";

export default function GamePage() {
  const { isStart } = useStateStore();
  console.log("Is game start: ", isStart);

  return isStart ? <Game /> : <Hero />;
}
