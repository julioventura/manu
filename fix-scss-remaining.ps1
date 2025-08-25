# Fix remaining SCSS issues - PowerShell script

$files = @(
    "c:\contexto\dentistas-clinica\src\app\home\home-config\home-config.component.scss",
    "c:\contexto\dentistas-clinica\src\app\header\header.component.scss", 
    "c:\contexto\dentistas-clinica\src\app\menu\menu-config\menu-config.component.scss",
    "c:\contexto\dentistas-clinica\src\app\shared\components\group\group-manager.component.scss",
    "c:\contexto\dentistas-clinica\src\app\perfil\perfil.component.scss",
    "c:\contexto\dentistas-clinica\src\app\chatbot-widget\chatbot-widget.component.scss",
    "c:\contexto\dentistas-clinica\src\app\homepage\homepage-intro\homepage-intro.component.scss"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Fix double namespace references
        $content = $content -replace 'styles\.styles\.', 'styles.'
        
        # Write back to file
        Set-Content $file $content -Encoding UTF8
        Write-Host "Fixed double namespace: $file"
    }
}

# Fix specific remaining variable issues
$specificFixes = @{
    "c:\contexto\dentistas-clinica\src\app\home\home.component.scss" = @{
        '$primary-color-dark' = 'styles.$primary-color-dark'
    }
    "c:\contexto\dentistas-clinica\src\app\erupcoes\erupcoes.component.scss" = @{
        '$font-family' = 'styles.$font-family'
    }
    "c:\contexto\dentistas-clinica\src\app\login\reset-password\reset-password.component.scss" = @{
        'color: $primary-color;' = 'color: styles.$primary-color;'
    }
    "c:\contexto\dentistas-clinica\src\app\erupcoes\erupcoes-popup\erupcoes-popup.component.scss" = @{
        '$primary-color-dark' = 'styles.$primary-color-dark'
    }
    "c:\contexto\dentistas-clinica\src\app\list\list.component.scss" = @{
        '$primary-hover' = 'styles.$primary-hover'
    }
    "c:\contexto\dentistas-clinica\src\app\homepage\endereco\endereco.component.scss" = @{
        '$secondary-color' = 'styles.$secondary-color'
    }
    "c:\contexto\dentistas-clinica\src\app\config\config.component.scss" = @{
        '$red-dark' = 'styles.$red-dark'
    }
    "c:\contexto\dentistas-clinica\src\app\fichas\fichas.component.scss" = @{
        '$red-dark' = 'styles.$red-dark'
    }
    "c:\contexto\dentistas-clinica\src\app\edit\edit.component.scss" = @{
        '$primary-hover' = 'styles.$primary-hover'
    }
}

foreach ($file in $specificFixes.Keys) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        foreach ($find in $specificFixes[$file].Keys) {
            $replace = $specificFixes[$file][$find]
            $content = $content -replace [regex]::Escape($find), $replace
        }
        Set-Content $file $content -Encoding UTF8
        Write-Host "Fixed variables in: $file"
    }
}
