with open("index.html", "r") as f:
    html = f.read()

html = html.replace(
    '<link rel="apple-touch-icon" href="/icon-192.png" />',
    '<link rel="icon" href="https://lh3.googleusercontent.com/d/1ZIWK0eZvvfie7s1E5xEJ4YeVUX_NUWUp" />\n    <link rel="apple-touch-icon" href="https://lh3.googleusercontent.com/d/1ZIWK0eZvvfie7s1E5xEJ4YeVUX_NUWUp" />'
)

with open("index.html", "w") as f:
    f.write(html)


with open("vite.config.ts", "r") as f:
    vite_config = f.read()

vite_config = vite_config.replace(
    "'https://cdn-icons-png.flaticon.com/512/3076/3076134.png'",
    "'https://lh3.googleusercontent.com/d/1ZIWK0eZvvfie7s1E5xEJ4YeVUX_NUWUp'"
)

with open("vite.config.ts", "w") as f:
    f.write(vite_config)
