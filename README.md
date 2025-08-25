# 🌟 The Starknet Docs Repository

<div align="center">

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fdocs.starknet.io&style=for-the-badge&logo=firefox&logoColor=white)](https://docs.starknet.io)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)
[![Built with Mintlify](https://img.shields.io/badge/built%20with-mintlify-00D4AA?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K)](https://mintlify.com)

[👀 View Documentation](https://docs.starknet.io) • [🐛 Report Bug](https://github.com/starknet-io/starknet-docs/issues) • [💡 Request Feature](https://github.com/starknet-io/starknet-docs/issues)

</div>

---

## 📖 About

Welcome to the Starknet Docs repository!

The Starknet Docs is the official documentation hub for Starknet, providing comprehensive guides, references, and resources for all developers, validators, and users of Starknet.

---

## 🛠️ Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Local Development

1. **Install the Mintlify CLI**
   ```bash
   npm install -g mint
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/starknet-io/starknet-docs.git
   cd starknet-docs
   ```

3. **Start the development server**
   ```bash
   mint dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to see the documentation locally.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `mint dev` not running | Run `npm install -g mint` to reinstall dependencies |
| Page loads as 404 | Ensure you're in the folder containing `docs.json` |
| Port already in use | Use `mint dev --port 3001` to specify a different port |

---

## 🚀 Deployment

Documentation is automatically deployed to production when changes are pushed to the main branch. The deployment is handled by Mintlify's GitHub integration.

### Deployment Process

1. **Push** to main branch
2. **Mintlify** automatically builds and deploys
3. **Changes** are live at [docs.starknet.io](https://docs.starknet.io)

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Content Contributions

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** locally with `mint dev`
5. **Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Reporting Issues

Found a bug or have a suggestion? Please [open an issue](https://github.com/starknet-io/starknet-docs/issues) with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### Content Guidelines

- Use clear, concise language
- Include code examples where appropriate
- Follow the existing documentation structure
- Test all code examples
- Add images to enhance understanding

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by the Starknet community**

[⭐ Star this repo](https://github.com/starknet-io/starknet-docs) • [🐦 Follow us](https://twitter.com/Starknet) • [💬 Join Discord](https://discord.gg/starknet-community)

</div>
