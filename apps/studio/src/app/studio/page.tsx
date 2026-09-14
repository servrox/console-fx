import { PageEffects } from "../../features/experience/page-effects";
import { Studio } from "../../features/editor/studio";
export default function StudioPage() {
  return (
    <main id="main">
      <PageEffects>
        <Studio />
      </PageEffects>
    </main>
  );
}
