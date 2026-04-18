import { setAllowed } from "@stellar/freighter-api";

export default function Stellar_Connection_Button() {
  return (
    <>
      <button onClick={setAllowed}>Connect Stellar Wallet</button>
    </>
  );
}
