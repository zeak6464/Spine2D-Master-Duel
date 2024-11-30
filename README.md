# Yu-Gi-Oh! Master Duel Animation Viewer

A web-based viewer for Spine2D animations from Yu-Gi-Oh! Master Duel. This project allows you to view and interact with character animations extracted from the game.

## Features

- 🎮 Interactive animation viewer with playback controls
- ⚡ Fast loading with asset preloading
- 🎯 Easy animation selection via dropdown or direct ID input
- ⌨️ Keyboard shortcuts for common actions
- 🎚️ Animation speed control (0.5x to 2x)
- 🖥️ Responsive design for different screen sizes
- ❌ Error handling with user-friendly messages

## Getting Started

### Prerequisites

- Python 3.x (for running the local server)
- A modern web browser (Chrome, Firefox, Edge, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zeak6464/Spine2D-Master-Duel.git
cd Spine2D-Master-Duel
```

2. Start the local server:
```bash
python server.py
```

3. Open your web browser and navigate to:
```
http://localhost:8000/spine2D%20Master%20Duel%20Enhanced.html
```

## Usage

### Basic Controls

- **Select Animation**: Use the dropdown menu to choose an animation
- **Direct Load**: Enter an animation ID in the input field and click "Load"
- **Playback Controls**:
  - Play/Pause: Click the play/pause button or press `Space`
  - Reset: Click the reset button or press `R`
  - Speed: Select playback speed from the dropdown (0.5x to 2x)

### File Structure

The project expects animations to be organized in the following structure:
```
spines/
  C[ID]/
    P[ID]JS.json         # Animation data
    P[ID].atlas.txt      # Atlas file
    P[ID].png           # Texture file
```

Example:
```
spines/
  C12345/
    P12345JS.json
    P12345.atlas.txt
    P12345.png
```

## Technical Details

- Uses Spine Player 4.0+ for animation playback
- Implements asynchronous asset loading
- Supports transparent backgrounds
- Includes error handling and loading indicators

## Troubleshooting

### Common Issues

1. **Animations not loading**:
   - Check that file names match the expected format
   - Verify all required files exist (JSON, Atlas, PNG)
   - Check browser console (F12) for detailed error messages

2. **Server issues**:
   - Make sure Python is installed
   - Check if port 8000 is available
   - Verify you're running the server from the project directory

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

## License

This project is for educational purposes only. All Yu-Gi-Oh! Master Duel assets are property of their respective owners.

## Acknowledgments

- Yu-Gi-Oh! Master Duel by Konami
- Spine2D animation system
- Original game assets by their respective creators
