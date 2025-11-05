#!/usr/bin/env python3
import re

# Read the file
with open('frontend/src/features/admin/services/contentService.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace success cases - remove message property and add timestamp
content = re.sub(
    r'(\s+return\s+{\s*success:\s*true,\s*data:\s*[^,}]+,)\s*message:\s*[^}]+(\s*};\s*)',
    r'\1 timestamp: new Date().toISOString()\2',
    content,
    flags=re.MULTILINE | re.DOTALL
)

# Replace error cases - convert message to error structure
content = re.sub(
    r'(\s+return\s+{\s*success:\s*false,\s*data:\s*[^,}]+,)\s*message:\s*(error\.response.*?)\s*(\s*};\s*)',
    r'\1 error: { code: \'SERVICE_ERROR\', message: \2 }, timestamp: new Date().toISOString()\3',
    content,
    flags=re.MULTILINE | re.DOTALL
)

# Write the file back
with open('frontend/src/features/admin/services/contentService.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed contentService.ts")