#!/bin/bash

# Daftar file API yang perlu diperbaiki
files=(
  "app/api/user/profile/route.ts"
  "app/api/categories/[id]/route.ts"
  "app/api/admin/login/route.ts"
  "app/api/admin/links/route.ts"
  "app/api/admin/users/route.ts"
  "app/api/admin/users/[id]/route.ts"
)

for file in "${files[@]}"; do
  echo "Processing: $file"

  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "  ⚠️  File not found, skipping..."
    continue
  fi

  # Check if file already has null check
  if grep -q "if (!supabase)" "$file"; then
    echo "  ✓ Already has null check, skipping..."
    continue
  fi

  # Backup original file
  cp "$file" "$file.bak"

  # Add null check after the first function definition that contains "await supabase"
  # This is a simple approach - for more complex cases, manual editing might be needed

  # Find the first occurrence of "await supabase" and add check before it
  # We'll use a marker approach
  python3 - <<PYTHON_SCRIPT
import re

with open('$file', 'r') as f:
    content = f.read()

# Pattern to find async functions that use "await supabase"
# We want to add null check right after the function signature

# Find all "export async function" definitions
pattern = r'(export async function (\w+)\([^)]*\)[^{]*\{)'
matches = list(re.finditer(pattern, content))

modified = False
for i, match in enumerate(matches):
    func_name = match.group(2)
    func_start = match.start()

    # Find the next function or end of file
    next_func_start = matches[i + 1].start() if i + 1 < len(matches) else len(content)

    # Check if this function uses "await supabase"
    func_content = content[func_start:next_func_start]
    if 'await supabase' in func_content and 'if (!supabase)' not in func_content:
        # Find the opening brace position
        opening_brace = match.group(1).find('{') + match.start() + len(match.group(1)) - 1

        # Add null check after opening brace
        null_check = '''
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database connection error' },
      { status: 500 }
    )
  }
'''

        content = content[:opening_brace + 1] + null_check + content[opening_brace + 1:]
        modified = True
        print(f"  ✓ Added null check to function: {func_name}")

if modified:
    with open('$file', 'w') as f:
        f.write(content)
    print("  ✓ File updated successfully")
else:
    print("  - No changes needed")
PYTHON_SCRIPT

  if [ $? -eq 0 ]; then
    echo "  ✅ Done"
  else
    echo "  ❌ Error processing, restoring backup"
    mv "$file.bak" "$file"
  fi

  # Remove backup if successful
  rm -f "$file.bak"
done

echo ""
echo "🎉 All files processed!"
