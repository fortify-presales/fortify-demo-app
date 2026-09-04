#!/usr/bin/env pwsh

# FAA, as a preview, can be downloaded by any of our clients. These are the coordinates:
# ftp-pro.houston.softwaregrp.com
# Use HTTPS, FTP, or SFTP on port 2222
# Login:              faa
# Password:     4uu_SP6m 

# Remove any conflicting FCLI_DEFAULT_SSC_* environment variables so that FoD is used for Fortify Agentic Analyzer 
#Get-ChildItem Env: | Where-Object Name -like "FCLI_DEFAULT_SSC_*" | ForEach-Object { Remove-Item "Env:$($_.Name)" }

fcli fod session login

fortifyaa -pilogin
fortifyaa -selftest

fortifyaa -scan . --scope src --fod-release "fortify-presales/fortify-demo-app:main" --output fortify-demo-app.faa.sarif --message-format fod -clean

fortifyaa -scan . --scope src --fod-release "fortify-presales/fortify-demo-app:main" --baseline fortify-demo-app.faa.sarif --incremental HEAD~1 --output fortify-demo-app.faa-incremental.sarif --message-format fod

fcli fod sast-scan import-sarif --release "fortify-presales/fortify-demo-app:faa-main" -f fortify-demo-app.faa.sarif

fcli fod session logout

