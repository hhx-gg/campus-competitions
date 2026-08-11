from __future__ import annotations

from pathlib import Path

from PIL import Image


SRC = Path(r"D:\浏览器下载\ChatGPT Image 2026年8月11日 11_25_13.png")
ROOT = Path(r"C:\Users\hhx\Documents\ChatGPT\竞赛消息工具")
ICON_DIR = ROOT / "src-tauri" / "icons"
PUBLIC_DIR = ROOT / "public"
OLD_ICON_SOURCE = ICON_DIR / "ChatGPT Image 2026年8月10日 14_17_26.png"


def main() -> None:
    image = Image.open(SRC).convert("RGB")

    # Full-resolution source copy for the Tauri icons directory.
    image.save(ICON_DIR / "icon.png", "PNG")

    # In-app brand mark (public/ is served by the frontend).
    image.resize((256, 256), Image.LANCZOS).save(PUBLIC_DIR / "logo.png", "PNG")

    # App icon: standard multi-size ICO for Windows taskbar/installer.
    image.resize((256, 256), Image.LANCZOS).save(
        ICON_DIR / "icon.ico",
        format="ICO",
        sizes=[(size, size) for size in (16, 24, 32, 48, 64, 128, 256)],
    )

    # Browser favicon: compact multi-size ICO.
    image.resize((48, 48), Image.LANCZOS).save(
        PUBLIC_DIR / "favicon.ico",
        format="ICO",
        sizes=[(size, size) for size in (16, 32, 48)],
    )

    # The previous icon source is superseded; it stays recoverable via Git.
    if OLD_ICON_SOURCE.exists():
        OLD_ICON_SOURCE.unlink()

    print("app icons regenerated from", SRC)


if __name__ == "__main__":
    main()
