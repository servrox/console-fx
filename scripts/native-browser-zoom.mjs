// Native Windows browser controls; CDP page keys do not change browser zoom.
import { execFileSync } from "node:child_process";
export async function nativeBrowserZoom(page, processId, steps) {
  const previous = await page.title();
  const marker = `ConsoleFX-zoom-${Date.now()}`;
  await page.evaluate((title) => {
    document.title = title;
  }, marker);
  await page.bringToFront();
  const isEdge = await page.evaluate(() =>
    navigator.userAgent.includes("Edg/"),
  );
  const percent = [100, 110, 125, 150, 175, 200, 250, 300, 400][steps];
  if (!Number.isInteger(percent))
    throw new Error("Unsupported native zoom step");
  const edgeScript = `
$ErrorActionPreference="Stop"
Add-Type -AssemblyName UIAutomationClient
$root=[System.Windows.Automation.AutomationElement]::RootElement
$condition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty,${processId})
$windows=$root.FindAll([System.Windows.Automation.TreeScope]::Children,$condition)
$target=$null
foreach($item in $windows){if($item.Current.Name.Contains("${marker}") -and !$item.Current.Name.StartsWith("DevTools")){$target=$item;break}}
if($null -eq $target){throw "Owned Edge window missing"}
for($attempt=0;$attempt -lt 30;$attempt++){
  $buttons=$target.FindAll([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::Button)))
  $menu=$null
  foreach($button in $buttons){if($button.Current.Name -match "^(Settings and more|Einstellungen und mehr)"){$menu=$button;break}}
  if($null -eq $menu){throw "Owned Edge menu missing"}
  $pattern=$menu.GetCurrentPattern([System.Windows.Automation.ExpandCollapsePattern]::Pattern)
  $pattern.Expand()
  try {
    $items=$target.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition)
    $current=$null; $increase=$null; $decrease=$null
    foreach($item in $items){
      if($item.Current.Name -match "^Zoom.*?([0-9]+).?%"){$current=[int]$Matches[1]}
      if($item.Current.Name -match "^(Vergr|Zoom in)"){$increase=$item}
      if($item.Current.Name -match "^(Verkleinern|Zoom out)"){$decrease=$item}
    }
    if($null -eq $current){throw "Owned Edge zoom percentage missing"}
    if($current -eq ${percent}){break}
    $command=if($current -lt ${percent}){$increase}else{$decrease}
    if($null -eq $command){throw "Owned Edge zoom command missing"}
    $command.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
  } finally { $pattern.Collapse() }
  Start-Sleep -Milliseconds 60
}
if($current -ne ${percent}){throw "Owned Edge zoom did not reach requested percentage"}
`;
  const script = `$ErrorActionPreference="Stop"; Add-Type -AssemblyName UIAutomationClient; Add-Type -AssemblyName System.Windows.Forms; Add-Type 'using System; using System.Runtime.InteropServices; public class ConsoleFxFocus { [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); }'; $root=[System.Windows.Automation.AutomationElement]::RootElement; $condition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty,${processId}); $windows=$root.FindAll([System.Windows.Automation.TreeScope]::Children,$condition); $target=$null; foreach($item in $windows){if($item.Current.Name.Contains("${marker}") -and !$item.Current.Name.StartsWith("DevTools")){$target=$item;break}}; if($null -eq $target){throw "Owned browser window missing"}; $handle=[IntPtr]$target.Current.NativeWindowHandle; $null=[ConsoleFxFocus]::SetForegroundWindow($handle); Start-Sleep -Milliseconds 120; if([ConsoleFxFocus]::GetForegroundWindow() -ne $handle){$target.SetFocus(); $null=[ConsoleFxFocus]::SetForegroundWindow($handle); Start-Sleep -Milliseconds 120}; if([ConsoleFxFocus]::GetForegroundWindow() -ne $handle){throw "Owned browser did not receive foreground focus"}; [System.Windows.Forms.SendKeys]::SendWait("^0"); for($i=0;$i -lt ${steps};$i++){ $buttons=$target.FindAll([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::Button))); $menu=$null; foreach($button in $buttons){if($button.Current.Name -match "Chrome|Chromium|Microsoft Edge|Settings and more|Einstellungen und mehr"){$menu=$button;break}}; if($null -eq $menu){throw "Native browser menu missing"}; $pattern=$menu.GetCurrentPattern([System.Windows.Automation.ExpandCollapsePattern]::Pattern); $pattern.Expand(); $items=$target.FindAll([System.Windows.Automation.TreeScope]::Descendants,[System.Windows.Automation.Condition]::TrueCondition); $zoom=$null; foreach($item in $items){if($item.Current.Name -match "^(Schriftgrad vergr|Zoom in|Vergr)"){$zoom=$item;break}}; if($null -eq $zoom){$pattern.Collapse();throw "Native zoom-in command missing"}; $zoom.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); $pattern.Collapse(); Start-Sleep -Milliseconds 60}`;
  try {
    execFileSync(
      "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-EncodedCommand",
        Buffer.from(isEdge ? edgeScript : script, "utf16le").toString("base64"),
      ],
      { encoding: "utf8", timeout: 10_000 },
    );
    await page.waitForTimeout(250);
  } finally {
    await page.evaluate((title) => {
      document.title = title;
    }, previous);
  }
}
