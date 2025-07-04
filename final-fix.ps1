# Final fix for remaining undefined variables
$content = Get-Content "src/app/edit/edit.component.scss" -Raw

# Replace all remaining $red-dark with styles.$red-dark
$content = $content -replace '(?<!styles\.)\$red-dark', 'styles.$red-dark'

# Also fix any other common patterns
$content = $content -replace 'background-color: \$red-dark', 'background-color: styles.$red-dark'

Set-Content "src/app/edit/edit.component.scss" $content -NoNewline

Write-Host "Fixed remaining variables in edit.component.scss"
