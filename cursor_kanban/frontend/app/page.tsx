import { Board } from "@/components/Board";
import { BoardProvider } from "@/components/BoardProvider";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <BoardProvider>
        <Board />
      </BoardProvider>
    </main>
  );
}
