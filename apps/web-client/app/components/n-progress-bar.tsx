import { useNProgress } from "@tanem/react-nprogress";
import { useEffect, useState } from "react";
import { useFetchers, useNavigation, type Fetcher } from "react-router";

function useIsAnimating() {
  const navigation = useNavigation();
  const fetchers = useFetchers();

  // Cek jika sedang navigasi
  const isNavigationLoading = navigation.state === "loading";

  // Cek jika ada fetcher yang loading
  const isFetcherLoading = fetchers.some(
    (fetcher: Fetcher) => fetcher.state !== "idle",
  );

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isNavigationLoading || isFetcherLoading) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isNavigationLoading, isFetcherLoading]);

  return isAnimating;
}

export default function ProgressBar() {
  const isAnimating = useIsAnimating();

  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating,
  });

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 w-full z-[1031]"
      style={{
        opacity: isFinished ? 0 : 1,
        transition: `opacity ${animationDuration}ms linear`,
      }}
    >
      <div
        className="h-[2px] bg-primary fixed top-0 left-0 w-full"
        style={{
          marginLeft: `${(-1 + progress) * 100}%`,
          transition: `margin-left ${animationDuration}ms linear`,
        }}
      >
        <div
          className="absolute right-0 h-full w-[100px]"
          style={{
            boxShadow: "0 0 10px #38bdf8, 0 0 5px #38bdf8", // sky-500
            transform: "rotate(3deg) translate(0px, -4px)",
          }}
        />
      </div>
    </div>
  );
}
