package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/emersion/go-smtp"
	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Email structure for storing emails
type Email struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	FromAddress string    `json:"from" gorm:"column:from_address"`
	ToAddress   string    `json:"to" gorm:"column:to_address"`
	Subject     string    `json:"subject"`
	Body        string    `json:"body"`
	Timestamp   time.Time `json:"timestamp"`
	Attachments []byte    `json:"attachments,omitempty"`
	IsRead      bool      `json:"isRead" gorm:"column:is_read;default:false"`
}

// Global database connection
var db *gorm.DB

// Initialize database connection
func initDB() {
	// Get environment variables with defaults
	dbHost := getEnvOrDefault("DB_HOST", "localhost")
	dbPort := getEnvOrDefault("DB_PORT", "5432")
	dbUser := getEnvOrDefault("DB_USER", "postgres")
	dbPassword := getEnvOrDefault("DB_PASSWORD", "postgres")
	dbName := getEnvOrDefault("DB_NAME", "mailserver")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	log.Printf("Connecting to database: %s:%s/%s", dbHost, dbPort, dbName)

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto migrate the schema
	err = db.AutoMigrate(&Email{})
	if err != nil {
		log.Fatalf("Failed to migrate database schema: %v", err)
	}

	log.Println("Database initialized successfully")
}

// Helper function to get environment variable with default value
func getEnvOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// SMTP Backend implementation
type Backend struct{}

func (bkd *Backend) NewSession(c *smtp.Conn) (smtp.Session, error) {
	return &Session{}, nil
}

// Session implementation for SMTP
type Session struct {
	from string
	to   []string
	data []byte
}

func (s *Session) AuthPlain(username, password string) error {
	// For testing purposes, accept all credentials
	return nil
}

func (s *Session) Mail(from string, opts *smtp.MailOptions) error {
	s.from = from
	return nil
}

func (s *Session) Rcpt(to string, opts *smtp.RcptOptions) error {
	s.to = append(s.to, to)
	return nil
}

func (s *Session) Data(r io.Reader) error {
	// Read the email data
	data, err := io.ReadAll(r)
	if err != nil {
		return err
	}
	s.data = data

	// For simplicity, we'll just extract a basic email
	// In a real implementation, you'd parse MIME content properly
	body := string(data)
	subject := "Test Email" // In a real implementation, you'd extract this

	// Store the email in the database for each recipient
	for _, recipient := range s.to {
		email := Email{
			FromAddress: s.from,
			ToAddress:   recipient,
			Subject:     subject,
			Body:        body,
			Timestamp:   time.Now(),
		}

		result := db.Create(&email)
		if result.Error != nil {
			log.Printf("Failed to store email: %v", result.Error)
		}
	}

	return nil
}

func (s *Session) Reset() {
	s.from = ""
	s.to = []string{}
	s.data = nil
}

func (s *Session) Logout() error {
	return nil
}

// API Handlers
func getAllEmails(w http.ResponseWriter, r *http.Request) {
	var emails []Email

	// Start with a base query
	query := db.Order("timestamp desc")

	// Add filters if provided
	fromFilter := r.URL.Query().Get("from")
	toFilter := r.URL.Query().Get("to")
	subjectFilter := r.URL.Query().Get("subject")

	if fromFilter != "" {
		query = query.Where("from_address ILIKE ?", "%"+fromFilter+"%")
	} else if toFilter != "" {
		query = query.Where("to_address ILIKE ?", "%"+toFilter+"%")
	} else if subjectFilter != "" {
		query = query.Where("subject ILIKE ?", "%"+subjectFilter+"%")
	}

	result := query.Find(&emails)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(emails)
}

func getEmailByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var email Email
	result := db.First(&email, id)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			http.Error(w, "Email not found", http.StatusNotFound)
		} else {
			http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		}
		return
	}

	// Mark as read
	db.Model(&email).Update("is_read", true)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(email)
}

func sendEmail(w http.ResponseWriter, r *http.Request) {
	var email Email
	if err := json.NewDecoder(r.Body).Decode(&email); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	email.Timestamp = time.Now()

	result := db.Create(&email)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Email sent successfully"})
}

func markAsRead(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	result := db.Model(&Email{}).Where("id = ?", id).Update("is_read", true)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Email marked as read"})
}

func main() {
	// Initialize database
	initDB()

	// Start SMTP server in a goroutine
	go func() {
		s := smtp.NewServer(&Backend{})
		s.Addr = ":1025"
		s.Domain = "localhost"
		s.ReadTimeout = 10 * time.Second
		s.WriteTimeout = 10 * time.Second
		s.MaxMessageBytes = 1024 * 1024
		s.MaxRecipients = 50
		s.AllowInsecureAuth = true

		log.Println("Starting SMTP server at", s.Addr)
		if err := s.ListenAndServe(); err != nil {
			log.Fatal(err)
		}
	}()

	// Set up HTTP API server
	r := mux.NewRouter()
	r.HandleFunc("/emails", getAllEmails).Methods("GET")
	r.HandleFunc("/email/{id}", getEmailByID).Methods("GET")
	r.HandleFunc("/send-email", sendEmail).Methods("POST")
	r.HandleFunc("/email/{id}/read", markAsRead).Methods("POST")

	// Add CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	handler := c.Handler(r)

	port := getEnvOrDefault("PORT", "8080")

	log.Println("Starting API server at port", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}
