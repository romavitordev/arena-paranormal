$ErrorActionPreference = 'Stop'

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$gameUrl = 'http://127.0.0.1:5173/'
$edgePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

function Test-GameServer {
    $request = [System.Net.HttpWebRequest]::Create($gameUrl)
    $request.Proxy = $null
    $request.Timeout = 2000

    try {
        $response = $request.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $content = $reader.ReadToEnd()
        $reader.Dispose()
        $response.Dispose()
        return $content.Contains('<title>Arena Paranormal</title>')
    }
    catch {
        return $false
    }
}

if (-not (Test-GameServer)) {
    $command = "cd /d `"$projectDir`" && npm.cmd run dev -- --host 127.0.0.1 --strictPort"
    Start-Process -FilePath $env:ComSpec -ArgumentList @('/c', $command) -WindowStyle Minimized

    $serverReady = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Seconds 1
        if (Test-GameServer) {
            $serverReady = $true
            break
        }
    }

    if (-not $serverReady) {
        $shell = New-Object -ComObject Wscript.Shell
        $shell.Popup(
            "O jogo não iniciou. Verifique se o Node.js está instalado e se as dependências foram instaladas com npm install na pasta do projeto.",
            0,
            'Arena Paranormal',
            16
        ) | Out-Null
        exit 1
    }
}

if (-not (Test-Path $edgePath)) {
    $shell = New-Object -ComObject Wscript.Shell
    $shell.Popup('O Microsoft Edge não foi encontrado neste computador.', 0, 'Arena Paranormal', 16) | Out-Null
    exit 1
}

Start-Process -FilePath $edgePath -ArgumentList @('--new-window', '--start-fullscreen', $gameUrl)
