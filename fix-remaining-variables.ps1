# Fix remaining SCSS variable issues
$scssFiles = @(
    "src/app/edit/edit.component.scss",
    "src/app/homepage/homepage-intro/homepage-intro.component.scss",
    "src/app/perfil/perfil.component.scss"
)

foreach ($file in $scssFiles) {
    if (Test-Path $file) {
        Write-Host "Fixing variables in $file"
        
        # Read content
        $content = Get-Content $file -Raw
        
        # Replace variables with styles namespace
        $content = $content -replace '\$red-light', 'styles.$red-light'
        $content = $content -replace '\$background-cinza', 'styles.$background-cinza'
        $content = $content -replace '\$box-shadow', 'styles.$box-shadow'
        
        # Fix darken function
        $content = $content -replace 'darken\(styles\.\$red, 10%\)', 'color.adjust(styles.$red, $lightness: -10%)'
        
        # Write back
        Set-Content $file $content -NoNewline
        Write-Host "Fixed $file"
    }
}

# Add missing imports if needed
$filesToAddColorImport = @(
    "src/app/perfil/perfil.component.scss"
)

foreach ($file in $filesToAddColorImport) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if (-not ($content -match "@use 'sass:color'")) {
            $content = $content -replace "(@use.*?as styles;)", "`$1`r`n@use 'sass:color';"
            Set-Content $file $content -NoNewline
            Write-Host "Added color import to $file"
        }
    }
}

Write-Host "Done fixing remaining variables!"
