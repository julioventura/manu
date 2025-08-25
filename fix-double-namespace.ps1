# Fix double namespace issues created by the previous script
$scssFiles = @(
    "src/app/edit/edit.component.scss",
    "src/app/homepage/homepage-intro/homepage-intro.component.scss", 
    "src/app/perfil/perfil.component.scss",
    "src/app/login/login.component.scss",
    "src/app/erupcoes/erupcoes.component.scss"
)

foreach ($file in $scssFiles) {
    if (Test-Path $file) {
        Write-Host "Fixing double namespace in $file"
        
        # Read content
        $content = Get-Content $file -Raw
        
        # Fix double namespace issues
        $content = $content -replace 'styles\.styles\.\$', 'styles.$'
        
        # Fix remaining undefined variables
        $content = $content -replace '\$primary-color([^-])', 'styles.$primary-color$1'
        $content = $content -replace 'border-color: \$primary-color;', 'border-color: styles.$primary-color;'
        
        # Write back
        Set-Content $file $content -NoNewline
        Write-Host "Fixed $file"
    }
}

Write-Host "Done fixing double namespace issues!"
