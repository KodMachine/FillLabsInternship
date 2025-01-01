package main

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/cors"
)

const salt = "yazgi2025happynewyearpleaseacceptmyinternship"

// User model
type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Surname   string `json:"surname"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CreatedAt string `json:"created_at"`
	IsActive  bool   `json:"is_active"`
}

var db *sql.DB

func main() {

	// 1) Create or open the database
	var err error
	db, err = sql.Open("sqlite3", "./mydb.db")
	if err != nil {
		log.Fatalf("Error opening DB: %v", err)
	}
	defer db.Close()

	// 2) Create table (if not exist)
	createTableSQL := `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        email TEXT NOT NULL ,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1
    );`
	_, err = db.Exec(createTableSQL)
	if err != nil {
		log.Fatalf("Error creating table: %v", err)
	}

	// 3) Router vand endpoints
	r := mux.NewRouter()
	r.HandleFunc("/users", getAllUsers).Methods("GET")
	r.HandleFunc("/users/{id}", getUserByID).Methods("GET")
	r.HandleFunc("/users", createUser).Methods("POST")
	r.HandleFunc("/users/{id}", updateUser).Methods("PUT")
	r.HandleFunc("/users/{id}", deleteUser).Methods("DELETE")
	// Update and Delete endpoints added.
	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})
	handler := corsOptions.Handler(r)

	// 4) Start API (8080 port)
	log.Println("REST API is running on port 8080...")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}

// Get all the active users (GET /users)
func getAllUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query(`SELECT id, name, surname, email, password, created_at, is_active FROM users WHERE is_active = 1`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		var isActiveInt int
		if err := rows.Scan(&u.ID, &u.Name, &u.Surname, &u.Email, &u.Password, &u.CreatedAt, &isActiveInt); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		u.IsActive = isActiveInt == 1
		users = append(users, u)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

// Get all the active users via id (GET /users/{id})
func getUserByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	idStr := params["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	row := db.QueryRow(`SELECT id, name, surname, email, password, created_at, is_active FROM users WHERE id = ? AND is_active = 1`, id)
	var u User
	var isActiveInt int
	if err := row.Scan(&u.ID, &u.Name, &u.Surname, &u.Email, &u.Password, &u.CreatedAt, &isActiveInt); err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}
	u.IsActive = isActiveInt == 1

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}

// Create new user (POST /users)
func createUser(w http.ResponseWriter, r *http.Request) {
	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Set fiels created_at dynamically
	u.CreatedAt = time.Now().UTC().Format(time.RFC3339)
	u.IsActive = true

	// Hash password with SHA-256
	if u.Password == "" {
		http.Error(w, "password cannot be empty", http.StatusBadRequest)
		return
	}

	hashed := sha256.Sum256([]byte(u.Password + salt))
	u.Password = hex.EncodeToString(hashed[:])

	// DB Insert
	query := `INSERT INTO users (name, surname, email, password, created_at, is_active) VALUES (?, ?, ?, ?, ?, ?)`
	result, err := db.Exec(query, u.Name, u.Surname, u.Email, u.Password, u.CreatedAt, 1)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	lastID, _ := result.LastInsertId()
	u.ID = int(lastID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}
func updateUser(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	idStr := params["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Check the empty fields
	if u.Name == "" {
		http.Error(w, "name cannot be empty", http.StatusBadRequest)
		return
	}
	if u.Surname == "" {
		http.Error(w, "surname cannot be empty", http.StatusBadRequest)
		return
	}
	if u.Email == "" {
		http.Error(w, "email cannot be empty", http.StatusBadRequest)
		return
	}

	// Check the password
	var updatedPassword string
	if u.Password == "" {
		// if password field is empty, keep the password same as before
		row := db.QueryRow(`SELECT password FROM users WHERE id = ? AND is_active = 1`, id)
		if err := row.Scan(&updatedPassword); err != nil {
			http.Error(w, "user not found", http.StatusNotFound)
			return
		}
	} else {
		// if there is a new password, hash it
		hashed := sha256.Sum256([]byte(u.Password + salt))
		updatedPassword = hex.EncodeToString(hashed[:])
	}

	// Update
	query := `UPDATE users SET name = ?, surname = ?, email = ?, password = ? WHERE id = ? AND is_active = 1`
	result, err := db.Exec(query, u.Name, u.Surname, u.Email, updatedPassword, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if rowsAffected == 0 {
		http.Error(w, "user not found or inactive", http.StatusNotFound)
		return
	}

	// Take updated user
	row := db.QueryRow(`SELECT id, name, surname, email, password, created_at, is_active FROM users WHERE id = ? AND is_active = 1`, id)
	var updatedUser User
	var isActiveInt int
	if err := row.Scan(&updatedUser.ID, &updatedUser.Name, &updatedUser.Surname, &updatedUser.Email, &updatedUser.Password, &updatedUser.CreatedAt, &isActiveInt); err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}
	updatedUser.IsActive = isActiveInt == 1

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedUser)
}

// inactivate the user (DELETE /users/{id})
func deleteUser(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	idStr := params["id"]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	// activate the user by setting is_active 0
	query := `UPDATE users SET is_active = 0 WHERE id = ? AND is_active = 1`
	result, err := db.Exec(query, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if rowsAffected == 0 {
		http.Error(w, "user not found or already inactive", http.StatusNotFound)
		return
	}

	// return 204 No Content
	w.WriteHeader(http.StatusNoContent)
}
