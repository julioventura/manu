# Fix all remaining double namespace issues and undefined variables
$scssFiles = Get-ChildItem -Path "src" -Filter "*.scss" -Recurse | Where-Object { $_.Name -like "*.component.scss" }

foreach ($file in $scssFiles) {
    Write-Host "Checking $($file.FullName)"
    
    # Read content
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix double namespace issues
    $content = $content -replace 'styles\.styles\.\$', 'styles.$'
    
    # Fix remaining undefined variables without styles prefix
    $content = $content -replace '(?<!styles\.)\$primary-color(?!-)', 'styles.$primary-color'
    $content = $content -replace '(?<!styles\.)\$secondary-color(?!-)', 'styles.$secondary-color'
    $content = $content -replace '(?<!styles\.)\$white(?!-)', 'styles.$white'
    $content = $content -replace '(?<!styles\.)\$text-color(?!-)', 'styles.$text-color'
    $content = $content -replace '(?<!styles\.)\$red(?!-)', 'styles.$red'
    $content = $content -replace '(?<!styles\.)\$font-family(?!-)', 'styles.$font-family'
    
    # Write back if changed
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Fixed $($file.FullName)"
    }
}

Write-Host "Done fixing all SCSS issues!"
