# YouTube Playlist Formatter

A web application that extracts video information from a YouTube playlist and formats it in a clean, readable format. The app shows each video's title, duration, and link, along with the total playlist duration.

## Features

- Extract video information from any YouTube playlist
- Display formatted playlist with video titles, durations, and links
- Calculate and show total playlist duration
- Copy formatted output with a single click
- Modern, responsive UI

## Requirements

- Node.js (for running the server)
- YouTube Data API v3 key

## How to Get a YouTube API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "YouTube Data API v3" and enable it
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API Key"
7. Copy your new API key

## How to Use

1. Clone or download this repository
2. Run the server:
   ```
   node server.js
   ```
3. Open your browser and navigate to `http://localhost:3000`
4. Enter your YouTube playlist URL and API key
5. Click "Format Playlist" to generate the formatted output
6. Use the "Copy" button to copy the result to your clipboard

## Alternative Method (Browser Console)

If you don't have an API key, you can use the browser console method:

1. Open the YouTube playlist page in your browser
2. Open the browser console (F12 or right-click > Inspect > Console)
3. Copy and paste the `browserConsoleScript()` function from the app.js file
4. Run the function in the console
5. A download link will appear on the playlist page

## License
MIT

## Author
Osama Yusuf
