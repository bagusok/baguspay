import { useFetchers, useNavigation } from "react-router";
import Loader from "./loader";
export const RouterTopLoader = () => {
  return <Loader useFetchers={useFetchers} useNavigation={useNavigation} />;
};
