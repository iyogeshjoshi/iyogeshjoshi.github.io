# Deviloper.dev Portfolio

A modern, responsive portfolio website built with React, TypeScript, and styled-components. The site features smooth animations, a clean design, and dynamic content loading from YAML files.

## Features

- 🎨 Modern, responsive design
- ⚡ Smooth animations and transitions
- 📱 Mobile-friendly layout
- 🔄 Dynamic content loading from YAML
- 🌙 Dark mode optimized
- 🎯 SEO friendly

## Tech Stack

- React 18
- TypeScript
- Styled Components
- Framer Motion
- React Router
- js-yaml

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/deviloper-portfolio.git
cd deviloper-portfolio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

The site will be available at `http://localhost:3000`.

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

The build output will be in the `build` directory.

## Deployment

### Deploying to Deviloper.dev

1. Build the project:
```bash
npm run build
```

2. Deploy the contents of the `build` directory to your web hosting service.

### Using Netlify (Recommended)

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set the build command to `npm run build`
4. Set the publish directory to `build`
5. Deploy!

## Customization

### Updating Content

The site's content is stored in `src/data.yaml`. Edit this file to update your:

- Personal information
- Skills
- Projects
- Contact information

### Styling

The site uses styled-components for styling. The main theme colors are defined in the components and can be modified to match your preferences.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
