from PIL import Image
import pillow_heif
import os

# Register HEIF opener
pillow_heif.register_heif_opener()

input_path = "images/updated_designs/Variable Wallet Hero.HEIC"
output_path = "images/updated_designs/variable_wallet_hero.png"

# Open and convert
img = Image.open(input_path)
# Convert to RGB if necessary
if img.mode in ("RGBA", "LA", "P"):
    background = Image.new("RGB", img.size, (255, 255, 255))
    if img.mode == "P":
        img = img.convert("RGBA")
    background.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
    img = background
elif img.mode != "RGB":
    img = img.convert("RGB")

# Save as PNG
img.save(output_path, "PNG", optimize=True)
print(f"Converted {input_path} to {output_path}")
