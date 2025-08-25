# Fix SCSS imports and variables - PowerShell script

$files = @(
    "c:\contexto\dentistas-clinica\src\app\menu\menu-config\menu-config.component.scss",
    "c:\contexto\dentistas-clinica\src\app\config\config.component.scss",
    "c:\contexto\dentistas-clinica\src\app\homepage\rodape-homepage\rodape-homepage.component.scss",
    "c:\contexto\dentistas-clinica\src\app\shared\components\group\group-manager.component.scss",
    "c:\contexto\dentistas-clinica\src\app\home\home-config\home-config.component.scss",
    "c:\contexto\dentistas-clinica\src\app\perfil\perfil.component.scss",
    "c:\contexto\dentistas-clinica\src\app\homepage\cartao\cartao.component.scss",
    "c:\contexto\dentistas-clinica\src\app\header\header.component.scss",
    "c:\contexto\dentistas-clinica\src\app\homepage\homepage-intro\homepage-intro.component.scss",
    "c:\contexto\dentistas-clinica\src\app\chatbot-widget\chatbot-widget.component.scss",
    "c:\contexto\dentistas-clinica\src\app\fichas\fichas.component.scss",
    "c:\contexto\dentistas-clinica\src\app\backup\backup.component.scss",
    "c:\contexto\dentistas-clinica\src\app\edit\edit.component.scss",
    "c:\contexto\dentistas-clinica\src\app\footer\footer.component.scss",
    "c:\contexto\dentistas-clinica\src\app\list\list.component.scss"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Fix @use imports to add 'as styles'
        $content = $content -replace '@use ''([^'']+)styles\.scss'';', '@use ''$1styles.scss'' as styles;'
        $content = $content -replace '@use "([^"]+)styles\.scss";', '@use "$1styles.scss" as styles;'
        
        # Fix variable references
        $content = $content -replace '\$primary-color', 'styles.$primary-color'
        $content = $content -replace '\$primary-color-dark', 'styles.$primary-color-dark'
        $content = $content -replace '\$text-color', 'styles.$text-color'
        $content = $content -replace '\$white', 'styles.$white'
        $content = $content -replace '\$gray', 'styles.$gray'
        $content = $content -replace '\$max-width', 'styles.$max-width'
        $content = $content -replace '\$medium-width', 'styles.$medium-width'
        $content = $content -replace '\$secondary-color', 'styles.$secondary-color'
        $content = $content -replace '\$font-family', 'styles.$font-family'
        
        # Write back to file
        Set-Content $file $content -Encoding UTF8
        Write-Host "Fixed: $file"
    }
}
