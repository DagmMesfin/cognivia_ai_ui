# Cognivia AI UI

**Enhance your learning efficiency with smart note-taking, AI-powered Q&A, contextual learning assistance, and personalized study support.**

Cognivia combines cutting-edge AI technology with proven learning methods to help you study smarter, not harder.

## 🚀 Powerful Features to Enhance Your Learning

### 📝 Smart Note-Taking & Summarization
Upload your study materials and let AI condense large amounts of information into concise key points.

### 🤖 AI-Powered Q&A System
Get instant, context-aware answers to your academic queries based on your study materials.

### 🎯 Contextual Learning Assistant
Identify weak areas and get suggestions for relevant study materials to improve your understanding.

### 🎤 Speech-to-Text & Text-to-Speech
Study on the go with accessibility features that convert your voice to notes and read content aloud.

### 📊 AI-Based Exam Practice
Generate quizzes and practice tests based on your study materials with adaptive feedback.

### 📈 Progress Tracking & Analytics
Monitor your study habits, track improvement, and identify areas that need more attention.

## 📱 Key Components

### 🎓 Study Tools
- **SnapNotes**: AI-powered note summarization and flashcard generation
- **PrepPilot**: Personalized exam preparation with adaptive quizzes
- **StudyGPT**: Intelligent Q&A system with voice interaction

### 📚 Content Management
- **Notebook System**: Organize study materials by subject/topic
- **File Upload**: Support for PDF, DOCX, and TXT files
- **Smart Categorization**: Automatic content organization

### 📊 Learning Analytics
- **Progress Tracking**: Monitor study time and completion rates
- **Performance Insights**: Identify strengths and improvement areas
- **Study Streaks**: Gamified learning with achievement tracking

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Customizable theme preferences
- **Accessibility**: Screen reader support and keyboard navigation

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/DagmMesfin/cognivia_ai_ui.git
   cd cognivia_ai_ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## ⚙️ Environment Setup

This project uses environment variables to store sensitive configuration data. Follow these steps to set up your environment:

### 1. Create Environment File

Copy the example environment file and configure it with your actual values:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file and replace the placeholder values with your actual credentials:

#### AWS Credentials
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID for Polly service
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key for Polly service
- `AWS_REGION`: AWS region (default: eu-central-1)
- `AWS_POLLY_ENDPOINT`: AWS Polly endpoint URL

#### API URLs
- `COGNIVIA_API_BASE_URL`: Base URL for the Cognivia API
- `EC2_CHAT_SERVICE_URL`: URL for the EC2 chat service
- `GOOGLE_DRIVE_UPLOADER_URL`: URL for the Google Drive uploader service
- `WEBHOOK_GENERATE_NOTES_URL`: URL for the note generation webhook

### 3. Security Notes

- **Never commit the `.env` file to version control**
- The `.env` file is already included in `.gitignore`
- Use `.env.example` as a template for required environment variables
- Keep your AWS credentials secure and rotate them regularly

### 4. Development

After setting up your environment variables, you can start the development server:

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🏗️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Services**: AWS Polly, Custom API integrations
- **File Upload**: Google Drive API integration

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key for Polly | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for Polly | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS region | `eu-central-1` |
| `COGNIVIA_API_BASE_URL` | Cognivia API base URL | `https://cognivia-api.onrender.com` |
| `EC2_CHAT_SERVICE_URL` | EC2 chat service URL | `https://ec2-example.amazonaws.com` |
| `GOOGLE_DRIVE_UPLOADER_URL` | Google Drive uploader URL | `https://uploader.example.com/api/upload/` |
| `WEBHOOK_GENERATE_NOTES_URL` | Notes generation webhook | `https://api.example.com/webhook-test/generate-notes` |

## 🔐 Security & Privacy

- **Environment Variables**: All sensitive data stored securely
- **API Security**: Secure communication with backend services
- **Data Protection**: User data handled with privacy in mind
- **File Security**: Safe file upload and processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation
- Review existing issues for solutions

---

**Happy Learning with Cognivia! 🚀📚**
