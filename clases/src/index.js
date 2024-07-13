class Person {
  constructor() {
    // Initialize users list from localStorage or empty array
    this.usersList = this.getUsers() || [];
    // Initialize next user ID based on existing users or start at 1
    this.nextUserId =
      this.usersList.length > 0
        ? this.usersList[this.usersList.length - 1].id + 1
        : 1;

    // Initialize books list from localStorage or empty array
    this.books = this.getBooks() || [];
    // Initialize next book ID based on existing books or start at 1
    this.nextBookId =
      this.books.length > 0 ? this.books[this.books.length - 1].id + 1 : 1;
  }

  // Static method to create a new user
  static createUser(name, password, role) {
    const instance = new Person();
    // Create new user object
    const newUser = {
      id: instance.nextUserId++, // Increment ID for new user
      name: name,
      password: password,
      role: role,
    };
    // Add new user to instance's usersList
    instance.usersList.push(newUser);
    // Save updated usersList to localStorage
    instance.saveUsers();
    // Return the newly created user object
    return newUser;
  }

  // Static method to create a new book
  static createBook(userId, pax) {
    const instance = new Person();
    // Find user by ID
    const user = instance.usersList.find((user) => user.id === userId);
    if (!user) {
      console.error("User not found");
      return;
    }
    // Create new book object
    const newBook = {
      id: instance.nextBookId++, // Increment ID for new book
      pax: pax,
      userId: userId,
    };
    // Add new book to instance's books
    instance.books.push(newBook);
    // Save updated books to localStorage
    instance.saveBooks();
  }

  // Method to retrieve users from localStorage
  getUsers() {
    const users = localStorage.getItem("users");
    return users ? JSON.parse(users) : [];
  }

  // Method to save users to localStorage
  saveUsers() {
    try {
      localStorage.setItem("users", JSON.stringify(this.usersList));
    } catch (error) {
      console.error("Error saving users", error);
    }
  }

  // Static method to edit a book by ID
  static editBook(id, pax) {
    const instance = new Person();
    const books = instance.getBooks();
    const find = books.find((book) => book.id === id);
    if (find) {
      // Update passengers for the found book
      find.pax = pax;
      instance.saveBooks(books);
      // Update the book view after editing
      Views.bookView();
    } else {
      alert("Something bad happened");
    }
  }

  // Static method to delete a book by ID
  static deleteBook(id) {
    const instance = new Person();
    let books = instance.getBooks();
    books = books.filter((book) => book.id !== id);
    if (books) {
      instance.saveBooks(books);
      // Update the book view after deleting
      Views.bookView();
    } else {
      alert("Something bad happened");
    }
  }

  // Method to retrieve books from localStorage
  getBooks() {
    const books = localStorage.getItem("books");
    return books ? JSON.parse(books) : [];
  }

  // Method to save books to localStorage
  saveBooks(books) {
    // If specific books array provided, use it; otherwise use instance's books
    if (books !== undefined) {
      try {
        localStorage.setItem("books", JSON.stringify(books));
      } catch (error) {
        console.error("Error saving books", error);
      }
    } else {
      try {
        localStorage.setItem("books", JSON.stringify(this.books));
      } catch (error) {
        console.error("Error saving books", error);
      }
    }
  }
}

// Subclasses of Person
class RegularUser extends Person {}
class Admin extends Person {}

// Views class for managing UI interactions
class Views {
  constructor(root) {
    this.root = root;
  }

  // Static method to render the login view
  static loginView() {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.innerHTML = `
      <h1>Login View</h1>
      <input id="login_name" type="text" placeholder="Enter your name" required>
      <input id="login_password" type="password" placeholder="Enter your password" required>
      <button id="login_btn">Login</button>
      <button id="register_btn">Go to Register</button>
    `;

    // Event listener for register button to switch to register view
    const registerButton = document.getElementById("register_btn");
    registerButton.addEventListener("click", (e) => {
      e.stopPropagation();
      Views.registerView();
    });

    // Event listener for login button to perform login logic
    const loginBtn = document.getElementById("login_btn");
    loginBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const loginName = document.getElementById("login_name").value;
      const loginPassword = document.getElementById("login_password").value;
      const userList = JSON.parse(localStorage.getItem("users")) || [];

      // Find user matching entered name and password
      const user = userList.find(
        (user) => user.name === loginName && user.password === loginPassword
      );
      if (user) {
        // Successful login: set token, role, and userID in localStorage
        alert("User login successful");
        const token = Math.random().toString(36).substring(2);
        const userID = user.id;
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("userID", userID);
        // Switch to home view after login
        Views.homeView();
      } else {
        alert("Invalid username or password");
      }
    });
  }

  // Static method to render the register view
  static registerView() {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.innerHTML = `
      <h1>Register</h1>
      <input id="register_input" type="text" placeholder="Enter your name to register" required>
      <input id="password_input" type="password" placeholder="Enter your password to register" required>
      <select id="userType" name="userType">
        <option value="regular">Regular User</option>
        <option value="admin">Admin</option>
      </select>
      <button id="go_to_login_btn">Go to Login</button>
      <button id="register_btn">Register</button>
    `;

    // Event listener for go to login button to switch to login view
    const goToLoginBtn = document.getElementById("go_to_login_btn");
    goToLoginBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      Views.loginView();
    });

    // Event listener for register button to create new user
    const registerButton = document.getElementById("register_btn");
    registerButton.addEventListener("click", () => {
      const registerInput = document.getElementById("register_input").value;
      const passwordInput = document.getElementById("password_input").value;
      const userType = document.getElementById("userType").value;

      if (!registerInput || !passwordInput) {
        alert("Please fill all fields");
        return;
      }

      // Depending on user type selected, call appropriate createUser method
      if (userType === "regular") {
        RegularUser.createUser(registerInput, passwordInput, userType);
      } else {
        Admin.createUser(registerInput, passwordInput, userType);
      }

      alert("User successfully created");
      // Switch to login view after successful registration
      Views.loginView();
    });
  }

  // Static method to render the home view
  static homeView() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <button id="logout">Logout</button>
      <button id="btn_book">See all books</button>
    `;

    // Retrieve role and user ID from localStorage
    const role = localStorage.getItem("role");
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const div = document.createElement("div");
    const userID = JSON.parse(localStorage.getItem("userID"));

    // Render admin view or regular user view based on role
    if (role === "admin") {
      app.innerHTML += `<h2>Admin View</h2>`;
      users.forEach((user) => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `
          <h3>Name: ${user.name}</h3>
          <p>Role: ${user.role}</p>
          <button class="book">Book Travel</button>
        `;
        div.appendChild(userDiv);
      });

      app.appendChild(div);

      // Event listener for book travel buttons in admin view
      document.querySelectorAll(".book").forEach((button) => {
        button.addEventListener("click", () => {
          this.registerBookview();
        });
      });
    } else {
      app.innerHTML += `<h2>Visitor View</h2>`;
      // Filter user by userID for regular user view
      const userFilter = users.filter((user) => user.id === userID);
      userFilter.forEach((user) => {
        const userDiv = document.createElement("div");
        userDiv.innerHTML = `
          <h3>Name: ${user.name}</h3>
          <p>Role: ${user.role}</p>
          <button id="booking">Book Travel</button>
        `;

        div.appendChild(userDiv);
      });
      app.appendChild(div);

      // Event listener for book travel button in regular user view
      const toBook = document.getElementById("booking");
      toBook.addEventListener("click", () => {
        this.registerBookview();
      });
    }

    // Event listener for logout button
    const logoutBtn = document.getElementById("logout");
    logoutBtn.addEventListener("click", () => {
      // Clear token, role, and userID from localStorage on logout
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userID");
      this.loginView(role);
    });

    // Event listener for see all books button
    const btnBook = document.getElementById("btn_book");
    btnBook.addEventListener("click", () => {
      this.bookView(role, userID);
    });
  }

  // Static method to render the book registration view
  static registerBookview() {
    const app = document.getElementById("app");
    app.innerHTML = `
      <button id="logout">Logout</button>
      <button id="back">Back</button>
      <form id="reservationForm">
        <label for="numPeople">Number of People:</label>
        <input type="number" id="numPeople" name="numPeople" min="1" required>
        <button type="submit">Book Travel</button>
      </form>
    `;

    // Event listener for logout button
    const logout = document.getElementById("logout");
    logout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userID");
      this.loginView();
    });

    // Event listener for back button to go back to home view
    const back = document.getElementById("back");
    back.addEventListener("click", () => {
      this.homeView();
    });

    // Event listener for reservation form submission
    const reservationForm = document.getElementById("reservationForm");
    const userID = JSON.parse(localStorage.getItem("userID"));
    reservationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const numPeople = document.getElementById("numPeople").value;
      if (!isNaN(numPeople)) {
        // Create book with userID and number of people
        Person.createBook(userID, numPeople);
        alert("Travel booked successfully");
      } else {
        alert("Please enter a valid number");
      }
    });
  }

  // Static method to render the book view
  static bookView(role, userId) {
    const app = document.getElementById("app");
    app.innerHTML = `
      <button id="logout">Logout</button>
      <button id="back">Back</button>
      <h1>Book View</h1>
    `;
    // Retrieve books from localStorage
    const books = JSON.parse(localStorage.getItem("books")) || [];

    // Render different views based on role
    if (role === "regular") {
      // Filter books by userID for regular user
      const userBooks = books.filter((book) => book.userId === userId);
      if (userBooks.length > 0) {
        const bookList = document.createElement("ul");
        userBooks.forEach((book) => {
          const bookItem = document.createElement("li");
          bookItem.textContent = `Book ID: ${book.id}, Pax: ${book.pax}`;
          bookList.appendChild(bookItem);
        });
        app.appendChild(bookList);
      } else {
        app.innerHTML += `<p>No books found for this user.</p>`;
      }
    } else {
      // Render all books for admin view
      const allBooks = JSON.parse(localStorage.getItem("books")) || [];
      const bookList = document.createElement("ul");
      allBooks.forEach((book) => {
        const bookItem = document.createElement("li");
        const editBtn = document.createElement("BUTTON");
        editBtn.classList = "editBtn";
        editBtn.id = `${book.id}`;
        editBtn.textContent = "Edit";
        const deleteBtn = document.createElement("BUTTON");
        deleteBtn.classList = "deleteBtn";
        deleteBtn.id = `${book.id}`;
        deleteBtn.textContent = "Delete";
        bookItem.textContent = `Book ID: ${book.id}, Pax: ${book.pax}, User ID: ${book.userId}`;
        bookItem.appendChild(editBtn);
        bookItem.appendChild(deleteBtn);
        bookList.appendChild(bookItem);
      });
      app.appendChild(bookList);
    }

    // Event listener for logout button
    const logoutBtn = document.getElementById("logout");
    logoutBtn.addEventListener("click", () => {
      // Clear token, role, and userID from localStorage on logout
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userID");
      Views.loginView();
    });

    // Event listener for back button to go back to home view
    const back = document.getElementById("back");
    back.addEventListener("click", () => {
      this.homeView();
    });

    // Event listener for edit buttons
    document.querySelectorAll(".editBtn").forEach((button) => {
      button.addEventListener("click", () => {
        const idButton = parseInt(button.id);
        const pax = parseInt(prompt("Enter the number of passengers"));
        if (!isNaN(pax)) {
          Admin.editBook(idButton, pax);
        } else {
          alert("Enter a valid number");
        }
      });
    });

    // Event listener for delete buttons
    document.querySelectorAll(".deleteBtn").forEach((button) => {
      button.addEventListener("click", () => {
        const idButton = parseInt(button.id);
        Admin.deleteBook(idButton);
      });
    });
  }
}

// Initialize the application by rendering the home view on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  Views.homeView();
});
