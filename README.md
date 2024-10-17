# Ultimate Keyboard Tester

A modern, interactive keyboard tester built with React and Next.js. Test your keyboard's functionality with style!

## Features

- Real-time key detection
- Multiple keyboard layouts (100%, TKL, 75%, 65%, 60%)
- Visual feedback for key presses:
  - Green: Normal press
  - Yellow: Double press detection
  - Blue: Key held down
  - Purple: Simultaneous key press
- Text input mode with WPM and accuracy tracking
- Responsive design (best viewed on desktop/laptop)
- Export test results as JSON

## Tech Stack

- React
- Next.js 13
- TypeScript
- Tailwind CSS
- Framer Motion
- Shadcn UI
- Lucide Icons

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository: `git clone https://github.com/sunnypatell/keyboard-tester.git`
2. Install dependencies: `npm install` or `yarn install`
3. Run the deployment server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Usage

- Select a keyboard layout from the dropdown menu
- Press keys on your physical keyboard to see them highlighted on the virtual keyboard
- Switch to the Text Input tab to test typing speed and accuracy
- Use the Export Stats button to download your test results

## Known Issues

- Mobile support is bad; best viewed on desktop or laptop
- Some browser-specific key events may not be captured correctly

## Future Improvements

- Add more keyboard layouts
- Implement custom theme options
- Make a version for mobile only
- Add more detailed analytics for key press patterns

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Inspired by the need for a more modern and feature-rich keyboard tester
- Thanks to the creators and maintainers of the libraries used in this project