import { RICKROLL_URL } from "./page";

export default function Head() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0; url=${RICKROLL_URL}`} />
    </>
  );
}
