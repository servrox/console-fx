export default function Page() {
  return (
    <main>
      <h1>Packed Next consumer</h1>
      <p>A server page with an explicit client banner.</p>
      <Cards />
      <Fitting />
    </main>
  );
}
import { Cards } from "./cards";

import { Fitting } from "./fitting";
