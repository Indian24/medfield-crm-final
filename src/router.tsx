import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter(); // ✅ correct (no export)

  return (
    <div>
      <h1>Something went wrong</h1>
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
      >
        Try again
      </button>
    </div>
  );
}

// ✅ THIS is the important part
export const router = createRouter({
  routeTree,
  context: {},
  defaultErrorComponent: DefaultErrorComponent,
});