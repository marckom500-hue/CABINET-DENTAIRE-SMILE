$f = 'c:\Users\DELL\Desktop\STAGE DB DIGITAL\smile\src\pages\Login.jsx'
$bytes = [System.IO.File]::ReadAllBytes($f)
$s = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix double-encoded é (bytes 195,131,194,169 -> é which is bytes 195,169)
# In the UTF-16 string, the garbled é appears as the 2-char sequence Ã© (U+00C3 U+00A9)
# We replace all occurrences
$garbled = [System.Text.Encoding]::UTF8.GetString([byte[]](195,131,194,169))
$correct  = [char]0x00E9  # é

$s = $s.Replace($garbled, $correct)

# Change font: replace Cormorant with Playfair Display for headings
$s = $s.Replace(
  "family=Cormorant:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600",
  "family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600"
)
$s = $s.Replace("'Cormorant', serif", "'Playfair Display', serif")

[System.IO.File]::WriteAllText($f, $s, [System.Text.Encoding]::UTF8)
Write-Host "Done"
