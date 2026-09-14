export function UsageVideo() {
  return (
    <section
      className="usage-video-section"
      aria-labelledby="usage-video-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">From an idea to one console.log</p>
          <h2 id="usage-video-title">See how it works.</h2>
        </div>
        <p>
          Edit, style, test and copy. Follow the walkthrough, then try your own.
        </p>
      </div>
      <figure className="usage-video">
        <video
          controls
          playsInline
          preload="none"
          width={1440}
          height={960}
          poster="/media/console-fx-usage-poster.webp"
          aria-label="ConsoleFX usage walkthrough"
          aria-describedby="usage-video-description"
        >
          <source src="/media/console-fx-usage.webm" type="video/webm" />
          <source src="/media/console-fx-usage.mp4" type="video/mp4" />
          <track
            default
            kind="captions"
            src="/media/console-fx-usage.vtt"
            srcLang="en"
            label="English instructions"
          />
          <a href="/media/console-fx-usage.mp4">Download the walkthrough</a>
        </video>
        <figcaption id="usage-video-description">
          Recorded in Chromium on 14 September 2026. No audio; captions explain
          each step. The page preview is approximate. Use DevTools to inspect
          the printed result.
        </figcaption>
      </figure>
      <details className="usage-transcript">
        <summary>Read the walkthrough</summary>
        <ol>
          <li>
            Choose a use case and compare its output with the complete recipe.
          </li>
          <li>
            Select Edit this example. Write your message; editing stays silent.
          </li>
          <li>
            Open your browser’s DevTools Console. Select Test in console to
            print one entry.
          </li>
          <li>
            Select Copy console.log. The complete JavaScript runs without
            installing ConsoleFX. Inspect it under Generated code.
          </li>
          <li>
            Browse all examples, filter by style and search for Build Receipt.
            Select it, then Load example. Your previous scene remains available
            in Undo.
          </li>
          <li>
            Supply your own project details and copy the updated export. Drafts
            stay in this browser; editing and copying never print a message.
          </li>
        </ol>
      </details>
      <a className="button" href="/studio/">
        Try it yourself
      </a>
    </section>
  );
}
