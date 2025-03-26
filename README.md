# FakeMail - Local Email Testing Server

FakeMail is a development and testing tool that provides a local email server with a modern web interface. It allows developers to test email functionality without sending actual emails to real addresses.

## Features

- **Local SMTP Server**: Accepts emails on port 1025
- **Web Interface**: Modern React Native web application for viewing and managing emails
- **Real-time Updates**: View emails as they arrive
- **Search Functionality**: Search through emails by sender or subject
- **HTML Email Support**: Properly renders HTML email content
- **Docker Support**: Easy deployment with Docker Compose
- **Development Environment**: Perfect for testing email features in development

## Tech Stack

### Backend
- Go 1.20
- GORM (v1.25.4) for database operations
- PostgreSQL database
- SMTP server implementation

### Frontend
- React Native with Expo
- React Navigation for routing
- React Native Render HTML for email content
- Modern UI with Material Design inspiration

## Prerequisites

- Docker and Docker Compose
- Go 1.20 or later (for local development)
- Node.js 18 or later (for local development)

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fake-mail-server.git
   cd fake-mail-server
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the web interface:
   - Open http://localhost:3000 in your browser
   - The SMTP server will be available on port 1025

## Configuration

### Environment Variables

#### Backend
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password (default: postgres)
- `DB_NAME`: Database name (default: mailserver)
- `PORT`: API server port (default: 8080)

#### Frontend
- `REACT_APP_ENV`: Environment (development/docker/production)
- `API_URL`: Backend API URL (automatically configured in Docker)

## Development

### Running Locally

1. Start the database:
   ```bash
   docker-compose up -d db
   ```

2. Start the backend:
   ```bash
   cd backend
   go run main.go
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Testing Email Sending

You can test sending emails using any SMTP client with these settings:
- Host: localhost
- Port: 1025
- No authentication required

Example using Python:
```python
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg.set_content("This is a test email")
msg["Subject"] = "Test Subject"
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"

smtp = smtplib.SMTP("localhost", 1025)
smtp.send_message(msg)
smtp.quit()
```

## API Endpoints

- `GET /emails`: List all emails
- `GET /email/{id}`: Get email details
- `POST /send-email`: Send a new email
- `POST /email/{id}/read`: Mark email as read

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [GORM](https://gorm.io/) for the database ORM
- [React Native](https://reactnative.dev/) for the frontend framework
- [Expo](https://expo.dev/) for the development tools
- [React Navigation](https://reactnavigation.org/) for the routing
- [React Native Render HTML](https://github.com/meliorence/react-native-render-html) for HTML rendering 