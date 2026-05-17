export function renderErrorPage() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OBRENT</title>
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0d0f10;
        color: #f4efe6;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        padding: 24px;
      }
      main {
        width: min(100%, 480px);
        text-align: center;
      }
      h1 {
        margin: 0 0 12px;
        font-size: clamp(28px, 4vw, 38px);
      }
      p {
        margin: 0;
        color: rgba(244, 239, 230, 0.72);
        line-height: 1.6;
      }
      .actions {
        margin-top: 28px;
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      a, button {
        appearance: none;
        border: 1px solid rgba(244, 239, 230, 0.2);
        background: transparent;
        color: #f4efe6;
        padding: 12px 18px;
        text-decoration: none;
        font: inherit;
        cursor: pointer;
      }
      .primary {
        background: #c3a265;
        border-color: #c3a265;
        color: #111;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Something went wrong</h1>
      <p>The page could not be rendered right now. Please refresh or return to the homepage.</p>
      <div class="actions">
        <button class="primary" onclick="window.location.reload()">Refresh</button>
        <a href="/">Go home</a>
      </div>
    </main>
  </body>
</html>`;
}