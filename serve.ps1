# Simple static server for local preview (no Node/Python required)
# Usage: powershell -ExecutionPolicy Bypass -File serve.ps1  ->  http://localhost:5173/
param([int]$Port = 5173)

$root = $PSScriptRoot
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'application/javascript; charset=utf-8'
  '.svg' = 'image/svg+xml'; '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.png' = 'image/png'; '.webp' = 'image/webp'
  '.xml' = 'application/xml'; '.txt' = 'text/plain; charset=utf-8'; '.ico' = 'image/x-icon'; '.json' = 'application/json'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
    if ($path -eq '' -or $path.EndsWith('/')) { $path += 'index.html' }
    $file = Join-Path $root $path
    $status = 200
    if (-not (Test-Path $file -PathType Leaf) -or -not ([IO.Path]::GetFullPath($file).StartsWith($root))) {
      $file = Join-Path $root '404.html'; $status = 404
    }
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.StatusCode = $status
    $ctx.Response.ContentType = if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' }
    $ctx.Response.ContentLength64 = $bytes.Length
    if ($ctx.Request.HttpMethod -ne 'HEAD') {
      try { $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length) } catch { }
    }
    try { $ctx.Response.Close() } catch { }
  }
} finally {
  $listener.Stop()
}
