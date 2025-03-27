from PIL import Image, ImageDraw, ImageFont
import os

# Create a new image with a transparent background
size = 32
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Draw a sleek V shape
points = [(16, 4), (28, 28), (16, 20), (4, 28)]
draw.polygon(points, fill=(192, 192, 192, 255))

# Save the image
img.save('images/favicon.png')
