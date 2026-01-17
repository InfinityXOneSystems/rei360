"""
AI Studio Bridge - Copy prompts to clipboard for instant AI Studio testing
Usage: python ai_studio_bridge.py <prompt_file>
"""

import sys
import pyperclip
from pathlib import Path

def load_and_copy_prompt(prompt_path):
    """Load prompt file and copy to clipboard for AI Studio"""

    prompt_file = Path(prompt_path)

    if not prompt_file.exists():
        print(f"❌ File not found: {prompt_path}")
        return

    # Read the prompt
    prompt_content = prompt_file.read_text(encoding='utf-8')

    # Copy to clipboard
    pyperclip.copy(prompt_content)

    print("✅ Prompt copied to clipboard!")
    print(f"📄 File: {prompt_file.name}")
    print(f"📏 Length: {len(prompt_content)} characters")
    print("\n🚀 Next steps:")
    print("   1. Open: https://aistudio.google.com/prompts/new_chat")
    print("   2. Paste (Ctrl+V)")
    print("   3. See the magic!")

    # Also print first 200 chars as preview
    print(f"\n📝 Preview:\n{prompt_content[:200]}...")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ai_studio_bridge.py <prompt_file>")
        sys.exit(1)

    load_and_copy_prompt(sys.argv[1])
