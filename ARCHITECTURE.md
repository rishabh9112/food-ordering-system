# Online Food Ordering System — Architecture Document

> A complete technical reference for understanding, presenting, and defending this project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [ER Diagram (Entity Relationship)](#3-er-diagram-entity-relationship)
4. [Backend Code Structure](#4-backend-code-structure)
5. [Frontend Code Structure](#5-frontend-code-structure)
6. [Key Design Decisions](#6-key-design-decisions)
7. [How to Think About This Project](#7-how-to-think-about-this-project)

---

## 1. Project Overview

### What does this application do, end to end?

This is a **full-stack online food ordering system** where customers can browse restaurants, view menus, add items to a cart, place orders, and track order status — while admins manage restaurants, menus, and order fulfillment.

**End-to-end flow:**

```
User signs up → Browses restaurants → Views menu → Adds items to cart
→ Places order → Tracks order status (PLACED → PREPARING → OUT_FOR_DELIVERY → DELIVERED)
```

### Two types of users

| Role | Capabilities |
|------|-------------|
| **CUSTOMER** | Register/login, browse restaurants, view menus, manage cart, place orders, view order history with real-time status tracking, edit profile |
| **ADMIN** | Login, manage restaurants (CRUD), manage menu items (CRUD), view all orders, update order status (PLACED → PREPARING → OUT_FOR_DELIVERY → DELIVERED), view dashboard stats (total orders, revenue, popular items), edit profile |

### How do frontend and backend communicate?

- **Protocol:** REST API over HTTP (JSON payloads)
- **Authentication:** JWT Bearer tokens sent in the `Authorization` header
- **Frontend tool:** Axios with request/response interceptors
- **Base URL:** `http://localhost:8080/api` (configurable via `REACT_APP_API_URL`)
- **CORS:** Backend allows `http://localhost:3000` and `https://*.vercel.app`

```
React (port 3000)  ──HTTP/JSON──▶  Spring Boot (port 8080)  ──JDBC──▶  NeonDB (PostgreSQL)
```

> **In one sentence:** A full-stack food ordering platform with React frontend and Spring Boot backend, using JWT auth and PostgreSQL, supporting two roles — Customer (order food) and Admin (manage everything).

---

## 2. System Architecture

### Overall Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────┐ │
│  │  React App  │  │  AuthContext  │  │  localStorage           │ │
│  │  (port 3000)│  │  (global     │  │  ├── token (JWT)        │ │
│  │             │  │   user state)│  │  ├── role (ADMIN/CUST)  │ │
│  │  Pages:     │  │              │  │  ├── email              │ │
│  │  - Landing  │  └──────┬───────┘  │  └── name               │ │
│  │  - Login    │         │          └─────────────────────────┘ │
│  │  - Signup   │         │                                      │
│  │  - Restaurants        │                                      │
│  │  - Menu     │         │                                      │
│  │  - Cart     │         │                                      │
│  │  - Orders   │         │                                      │
│  │  - Profile  │         │                                      │
│  │  - Admin    │         │                                      │
│  └──────┬──────┘         │                                      │
│         │                │                                      │
│         ▼                │                                      │
│  ┌──────────────┐        │                                      │
│  │  Axios       │◄───────┘  (reads token from localStorage)    │
│  │  Interceptor │                                               │
│  │  ┌──────────────────────────────────────┐                   │
│  │  │ Authorization: Bearer <JWT_TOKEN>    │                   │
│  │  └──────────────────────────────────────┘                   │
│  └──────┬───────┘                                               │
└─────────┼───────────────────────────────────────────────────────┘
          │  HTTP (REST API, JSON)
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                   SPRING BOOT SERVER (port 8080)                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    JwtAuthFilter                          │   │
│  │  1. Extract "Bearer <token>" from Authorization header    │   │
│  │  2. Decode JWT → extract email                            │   │
│  │  3. Load UserDetails from DB (CustomUserDetailsService)   │   │
│  │  4. Validate token (signature + expiry)                   │   │
│  │  5. Set Authentication in SecurityContext                 │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   SecurityConfig                          │   │
│  │  /api/auth/**         → permitAll() (no auth needed)      │   │
│  │  /api/admin/**        → hasRole("ADMIN")                  │   │
│  │  /api/dashboard/**    → hasRole("ADMIN")                  │   │
│  │  everything else      → authenticated()                   │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Controllers (REST)                      │   │
│  │  AuthController      → /api/auth/login, /register         │   │
│  │  RestaurantController→ /api/restaurants                    │   │
│  │  MenuItemController  → /api/restaurants/{id}/menu          │   │
│  │  CartController      → /api/cart                           │   │
│  │  OrderController     → /api/orders/place, /history         │   │
│  │  UserController      → /api/users/profile                  │   │
│  │  AdminController     → /api/admin/restaurants, /menu, etc  │   │
│  │  DashboardController → /api/dashboard/stats                │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Services (Business Logic)               │   │
│  │  AuthService, CartService, OrderService,                  │   │
│  │  RestaurantService, MenuItemService, AdminService         │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Repositories (JPA / Spring Data)             │   │
│  │  UserRepository, CartRepository, OrderRepository,         │   │
│  │  RestaurantRepository, MenuItemRepository, etc.           │   │
│  └──────────────────────┬───────────────────────────────────┘   │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              JPA / Hibernate (ORM Layer)                   │   │
│  │  Java entities ←→ SQL tables (auto-generated DDL)         │   │
│  └──────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │  JDBC + SSL
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                  NeonDB (Cloud PostgreSQL)                        │
│                                                                  │
│  Tables: users, restaurants, menu_items, carts, cart_items,      │
│          orders, order_items                                     │
│                                                                  │
│  Host: ep-hidden-cake-*.us-east-1.aws.neon.tech                  │
│  DB:   neondb                                                    │
└──────────────────────────────────────────────────────────────────┘
```

### Where does JWT fit in the flow?

```
1. User calls POST /api/auth/login with {email, password}
2. AuthService validates credentials → calls JwtUtil.generateToken(email)
3. JwtUtil creates a signed JWT (HS256) with:
   - subject = email
   - issuedAt = now
   - expiration = now + 86400000ms (24 hours)
4. Token is returned in AuthResponse {token, role, email, name}
5. Frontend stores token in localStorage
6. On every subsequent request, Axios interceptor attaches:
   Authorization: Bearer <token>
7. JwtAuthFilter intercepts, validates, and sets SecurityContext
```

### "Place Order" — Full Request Lifecycle (Step by Step)

```
 FRONTEND                          BACKEND                           DATABASE
 ────────                          ───────                           ────────

 1. User clicks "Place Order"
    on CartPage.js
         │
 2. CartPage calls:
    api.post('/orders/place')
         │
 3. Axios interceptor attaches:
    Authorization: Bearer <JWT>
         │
         ├─── HTTP POST ──────────▶ 4. Request hits JwtAuthFilter
                                       │
                                    5. Filter extracts JWT from header
                                       Calls jwtUtil.extractEmail(jwt)
                                       Loads UserDetails from DB ──────▶ SELECT * FROM users
                                       Validates token (sig + expiry)     WHERE email = ?
                                       Sets SecurityContext
                                       │                              ◀── User found ───
                                    6. SecurityConfig checks:
                                       /api/orders/** → authenticated() ✅
                                       │
                                    7. OrderController.placeOrder()
                                       Gets email from Authentication
                                       │
                                    8. OrderService.placeOrder(email)
                                       │
                                    9. Finds User by email ────────────▶ SELECT * FROM users
                                       │                                  WHERE email = ?
                                   10. Finds Cart by userId ───────────▶ SELECT * FROM carts
                                       │                                  WHERE user_id = ?
                                       │                                  + JOIN cart_items
                                   11. Validates cart not empty
                                       │
                                   12. Creates Order entity:
                                       - status = PLACED
                                       - user = currentUser
                                       │
                                   13. Loops through CartItems:
                                       For each CartItem:
                                       - Creates OrderItem
                                       - Sets menuItem, quantity, unitPrice
                                       - Adds unitPrice × quantity to total
                                       │
                                   14. Sets order.totalAmount = total
                                       │
                                   15. orderRepository.save(order) ────▶ INSERT INTO orders (...)
                                       (CascadeType.ALL saves              INSERT INTO order_items (...)
                                        OrderItems automatically)           × N items
                                       │
                                   16. Clears cart items ──────────────▶ DELETE FROM cart_items
                                       cartRepository.save(cart)           WHERE cart_id = ?
                                       │
                                   17. Returns saved Order as JSON
         │
 18. ◀── HTTP 200 + Order JSON ───
         │
 19. CartPage shows toast:
     "🎉 Order placed successfully!"
         │
 20. After 1.5s, navigates to
     /orders (OrderHistory page)
```

> **In one sentence:** Requests flow through Axios → JwtAuthFilter → SecurityConfig → Controller → Service → Repository → PostgreSQL, with JWT providing stateless authentication at every step.

---

## 3. ER Diagram (Entity Relationship)

### All Entities with Columns

#### `users` table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| name | VARCHAR | NOT NULL |
| email | VARCHAR | NOT NULL, UNIQUE |
| password | VARCHAR | NOT NULL (BCrypt hashed) |
| role | VARCHAR | NOT NULL (ADMIN or CUSTOMER) |
| address | VARCHAR | nullable |
| created_at | TIMESTAMP | auto-set on creation |

#### `restaurants` table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| name | VARCHAR | NOT NULL |
| description | TEXT | nullable |
| location | VARCHAR | nullable |
| image_url | VARCHAR | nullable |
| is_active | BOOLEAN | NOT NULL, default true |

#### `menu_items` table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| restaurant_id | BIGINT | FK → restaurants.id, NOT NULL |
| name | VARCHAR | NOT NULL |
| description | TEXT | nullable |
| price | DECIMAL(10,2) | NOT NULL |
| category | VARCHAR | nullable |
| is_veg | BOOLEAN | NOT NULL, default false |
| is_available | BOOLEAN | NOT NULL, default true |

#### `carts` table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| user_id | BIGINT | FK → users.id, NOT NULL |
| created_at | TIMESTAMP | auto-set on creation |

#### `cart_items` table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| cart_id | BIGINT | FK → carts.id, NOT NULL |
| menu_item_id | BIGINT | FK → menu_items.id, NOT NULL |
| quantity | INTEGER | NOT NULL |
| unit_price | DECIMAL(10,2) | NOT NULL |

#### `orders` table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| user_id | BIGINT | FK → users.id, NOT NULL |
| total_amount | DECIMAL(10,2) | NOT NULL |
| status | VARCHAR | NOT NULL (PLACED/PREPARING/OUT_FOR_DELIVERY/DELIVERED) |
| created_at | TIMESTAMP | auto-set on creation |
| updated_at | TIMESTAMP | auto-updated |

#### `order_items` table
| Column | Type | Constraints |
|--------|------|-------------|
| id | BIGINT | PK, auto-increment |
| order_id | BIGINT | FK → orders.id, NOT NULL |
| menu_item_id | BIGINT | FK → menu_items.id, NOT NULL |
| quantity | INTEGER | NOT NULL |
| unit_price | DECIMAL(10,2) | NOT NULL |

### Relationships with Cardinality

```
ONE-TO-MANY relationships:
  User        1 ──── * Order        (one user places many orders)
  Restaurant  1 ──── * MenuItem     (one restaurant has many menu items)
  Cart        1 ──── * CartItem     (one cart has many cart items)
  Order       1 ──── * OrderItem    (one order has many order items)

ONE-TO-ONE relationships:
  User        1 ──── 1 Cart         (each customer has exactly one cart)

MANY-TO-ONE relationships:
  CartItem    * ──── 1 MenuItem     (many cart items can reference one menu item)
  OrderItem   * ──── 1 MenuItem     (many order items can reference one menu item)
```

### ASCII ER Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    users     │       │   restaurants     │       │   menu_items     │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ PK id        │       │ PK id            │       │ PK id            │
│    name      │       │    name          │       │ FK restaurant_id │──┐
│    email     │       │    description   │       │    name          │  │
│    password  │       │    location      │       │    description   │  │
│    role      │       │    image_url     │       │    price         │  │
│    address   │       │    is_active     │       │    category      │  │
│    created_at│       └────────┬─────────┘       │    is_veg        │  │
└──┬───┬───────┘                │                 │    is_available  │  │
   │   │                        │  1              └────────┬─────────┘  │
   │   │  1                     │                          │            │
   │   │                        └──────────────────────────┘            │
   │   │                           has many (1:N)           belongs to  │
   │   │                                                    (N:1)       │
   │   │  1         ┌──────────────────┐                               │
   │   └────────────│     carts        │                               │
   │     has one    ├──────────────────┤                               │
   │     (1:1)      │ PK id            │                               │
   │                │ FK user_id       │                               │
   │                │    created_at    │                               │
   │                └────────┬─────────┘                               │
   │                         │  1                                      │
   │                         │                                         │
   │                         ▼  N                                      │
   │                ┌──────────────────┐                               │
   │                │   cart_items     │                               │
   │                ├──────────────────┤      references                │
   │                │ PK id            │      (N:1)                    │
   │                │ FK cart_id       │──────────────────────────────-─┤
   │                │ FK menu_item_id  │───────────────────────────────┘
   │                │    quantity      │
   │                │    unit_price    │
   │                └──────────────────┘
   │
   │  1
   │
   ▼  N
┌──────────────────┐
│     orders       │
├──────────────────┤
│ PK id            │
│ FK user_id       │
│    total_amount  │
│    status        │
│    created_at    │
│    updated_at    │
└────────┬─────────┘
         │  1
         │
         ▼  N
┌──────────────────┐
│   order_items    │
├──────────────────┤       references
│ PK id            │       (N:1)
│ FK order_id      │
│ FK menu_item_id  │──────────────────▶ menu_items.id
│    quantity      │
│    unit_price    │
└──────────────────┘
```

> **In one sentence:** Seven tables with clear 1:N relationships — a User has one Cart (with CartItems) and many Orders (with OrderItems), while Restaurants have many MenuItems that are referenced by both CartItems and OrderItems.

---

## 4. Backend Code Structure

### Folder Structure

```
backend/src/main/java/com/foodorder/backend/
├── BackendApplication.java          ← Entry point (@SpringBootApplication)
├── config/
│   ├── SecurityConfig.java          ← Spring Security rules + CORS
│   ├── JwtAuthFilter.java           ← JWT token validation filter
│   ├── PasswordConfig.java          ← BCryptPasswordEncoder bean
│   └── GlobalExceptionHandler.java  ← @RestControllerAdvice for error handling
├── controller/
│   ├── AuthController.java          ← POST /api/auth/login, /register
│   ├── RestaurantController.java    ← GET /api/restaurants (customer-facing)
│   ├── MenuItemController.java      ← GET /api/restaurants/{id}/menu
│   ├── CartController.java          ← GET/POST/PUT/DELETE /api/cart
│   ├── OrderController.java         ← POST /api/orders/place, GET /history
│   ├── UserController.java          ← GET/PUT /api/users/profile
│   ├── AdminController.java         ← /api/admin/** (restaurant/menu/order CRUD)
│   └── DashboardController.java     ← GET /api/dashboard/stats
├── dto/
│   ├── LoginRequest.java            ← {email, password}
│   ├── RegisterRequest.java         ← {name, email, password, address, role}
│   ├── AuthResponse.java            ← {token, role, email, name}
│   ├── AddToCartRequest.java        ← {menuItemId, quantity}
│   ├── UpdateCartRequest.java       ← {quantity}
│   ├── ProfileResponse.java         ← {id, name, email, address, role}
│   └── UpdateProfileRequest.java    ← {name, address}
├── model/
│   ├── User.java                    ← @Entity → users table
│   ├── Role.java                    ← enum {ADMIN, CUSTOMER}
│   ├── Restaurant.java              ← @Entity → restaurants table
│   ├── MenuItem.java                ← @Entity → menu_items table
│   ├── Cart.java                    ← @Entity → carts table
│   ├── CartItem.java                ← @Entity → cart_items table
│   ├── Order.java                   ← @Entity → orders table
│   ├── OrderItem.java               ← @Entity → order_items table
│   └── OrderStatus.java             ← enum {PLACED, PREPARING, OUT_FOR_DELIVERY, DELIVERED}
├── repository/
│   ├── UserRepository.java          ← findByEmail(), existsByEmail()
│   ├── RestaurantRepository.java    ← findByIsActiveTrue()
│   ├── MenuItemRepository.java      ← findByRestaurantId(), ...AndIsAvailableTrue()
│   ├── CartRepository.java          ← findByUserId()
│   ├── CartItemRepository.java      ← (basic CRUD)
│   ├── OrderRepository.java         ← custom @Query for revenue, popular items
│   └── OrderItemRepository.java     ← (basic CRUD)
├── service/
│   ├── AuthService.java             ← register(), login()
│   ├── CustomUserDetailsService.java← loadUserByUsername() for Spring Security
│   ├── RestaurantService.java       ← CRUD operations
│   ├── MenuItemService.java         ← CRUD operations
│   ├── CartService.java             ← addItem(), updateItem(), removeItem()
│   ├── OrderService.java            ← placeOrder(), getOrderHistory(), updateStatus()
│   └── AdminService.java            ← getDashboardStats()
└── util/
    └── JwtUtil.java                 ← generateToken(), validateToken(), extractEmail()
```

### Role of Each Layer

```
┌─────────────┐    Receives HTTP request, validates input, delegates to service
│ Controller  │    Returns ResponseEntity<T> with appropriate HTTP status
├─────────────┤    Example: OrderController.placeOrder(Authentication auth)
      │
      ▼
┌─────────────┐    Contains ALL business logic (validation, calculations, workflows)
│  Service    │    Works with multiple repositories if needed
├─────────────┤    Example: OrderService.placeOrder() — creates order from cart, clears cart
      │
      ▼
┌─────────────┐    Data access layer — Spring Data JPA interfaces
│ Repository  │    Auto-generates SQL from method names (findByEmail → SELECT ... WHERE email=?)
├─────────────┤    Custom queries with @Query annotation (JPQL)
      │
      ▼
┌─────────────┐    Java classes annotated with @Entity
│   Model     │    Each field maps to a database column
├─────────────┤    Relationships defined with @OneToMany, @ManyToOne, etc.
      │
      ▼
┌─────────────┐
│  Database   │    Hibernate auto-generates DDL from entity annotations
└─────────────┘    (spring.jpa.hibernate.ddl-auto=update)
```

### Flow Example: Controller → Service → Repository

```java
// 1. CONTROLLER — receives HTTP, delegates to service
@PostMapping("/place")
public ResponseEntity<Order> placeOrder(Authentication auth) {
    return ResponseEntity.ok(orderService.placeOrder(auth.getName()));
}
// auth.getName() returns the email from the JWT (set by JwtAuthFilter)
```

```java
// 2. SERVICE — contains business logic
public Order placeOrder(String email) {
    User user = userRepository.findByEmail(email).orElseThrow(...);
    Cart cart = cartRepository.findByUserId(user.getId()).orElseThrow(...);
    if (cart.getItems().isEmpty()) throw new RuntimeException("Cart is empty");
    // ... create Order, loop CartItems → OrderItems, calculate total
    Order savedOrder = orderRepository.save(order);
    cart.getItems().clear();
    cartRepository.save(cart);
    return savedOrder;
}
// All the logic lives HERE — controller is just a thin wrapper
```

```java
// 3. REPOSITORY — data access (Spring Data auto-implements this!)
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    BigDecimal calculateTotalRevenue();
}
// Just declare the method signature — Spring generates the SQL
```

### How JPA/Hibernate maps Java to SQL

```java
@Entity                              // This class = a database table
@Table(name = "users")               // Table name = "users"
public class User {
    @Id                              // This field = primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;

    @Column(nullable = false, unique = true)  // NOT NULL + UNIQUE constraint
    private String email;

    @Enumerated(EnumType.STRING)     // Store enum as VARCHAR ("ADMIN"/"CUSTOMER")
    private Role role;
}
```

Hibernate reads these annotations and auto-generates the SQL:
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(255) NOT NULL,
    ...
);
```

With `ddl-auto=update`, Hibernate compares entity definitions to the actual DB schema on startup and applies ALTER TABLE statements as needed.

### Spring Security + JWT — Full Auth Flow

```
User sends:  POST /api/orders/place
             Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ...

  Step 1: JwtAuthFilter.doFilterInternal()
  ┌──────────────────────────────────────────────────────────┐
  │ a. Extract header: "Bearer eyJhbG..."                    │
  │ b. Strip prefix:   jwt = "eyJhbG..."                     │
  │ c. jwtUtil.extractEmail(jwt)                             │
  │    └─ Parses JWT, verifies HS256 signature               │
  │    └─ Returns subject = "customer@food.com"              │
  │ d. customUserDetailsService.loadUserByUsername(email)     │
  │    └─ DB lookup: SELECT * FROM users WHERE email = ?     │
  │    └─ Returns UserDetails with authorities: [ROLE_CUSTOMER]│
  │ e. jwtUtil.validateToken(jwt, userDetails)               │
  │    └─ Checks email matches + token not expired           │
  │ f. Sets SecurityContextHolder.getContext().setAuthentication(...)│
  │    └─ Now Spring knows: who the user is + their roles    │
  └──────────────────────────────────────────────────────────┘

  Step 2: SecurityConfig evaluates rules
  ┌──────────────────────────────────────────────────────────┐
  │ /api/orders/place matches:                               │
  │   .anyRequest().authenticated()  → User is authenticated ✅│
  └──────────────────────────────────────────────────────────┘

  Step 3: Request reaches OrderController.placeOrder(auth)
  ┌──────────────────────────────────────────────────────────┐
  │ auth.getName() → "customer@food.com" (from SecurityContext)│
  │ Delegates to OrderService.placeOrder("customer@food.com")  │
  └──────────────────────────────────────────────────────────┘
```

> **In one sentence:** The backend follows a clean 4-layer architecture (Controller → Service → Repository → Model), with JPA/Hibernate mapping Java entities to PostgreSQL tables and Spring Security + JWT protecting every endpoint.

---

## 5. Frontend Code Structure

### Folder Structure

```
frontend/src/
├── index.js                 ← React entry point (renders <App />)
├── index.css                ← Complete design system (1200+ lines)
├── App.js                   ← Router setup, route definitions, HomeRoute logic
├── App.css                  ← (minimal, most styles in index.css)
│
├── context/
│   └── AuthContext.js       ← Global auth state (user, login, logout, isAdmin)
│
├── components/
│   ├── Navbar.js            ← Top navigation bar (role-aware links)
│   └── ProtectedRoute.js   ← Route guard (checks auth + role)
│
├── pages/
│   ├── LandingPage.js       ← Public home page for logged-out users
│   ├── Login.js             ← Login form
│   ├── Signup.js            ← Registration form (always assigns CUSTOMER role)
│   ├── RestaurantList.js    ← Browse restaurants with search + category filter
│   ├── MenuPage.js          ← Restaurant menu with cart-aware steppers
│   ├── CartPage.js          ← Cart with optimistic UI updates
│   ├── OrderHistory.js      ← Order list with status timeline
│   ├── ProfilePage.js       ← Edit name/address (email read-only)
│   └── AdminDashboard.js    ← Admin: stats, restaurant/menu CRUD, order management
│
├── services/
│   └── api.js               ← Axios instance with JWT interceptors
│
└── utils/
    └── stockImages.js       ← Auto-assigns food images by category
```

### What Each Page/Component Does

| File | Purpose |
|------|---------|
| **LandingPage.js** | Hero section with "Get Started" CTA, feature cards, and sample restaurant showcase — only shown to logged-out users |
| **Login.js** | Email + password form → calls `POST /api/auth/login` → stores JWT in localStorage → redirects based on role |
| **Signup.js** | Registration form (name, email, password, address) → hardcodes role as CUSTOMER → auto-login after signup |
| **RestaurantList.js** | Fetches `GET /api/restaurants` → displays card grid with search bar + category filter (All/Veg/Non-Veg/Fast Food) |
| **MenuPage.js** | Fetches restaurant info + menu + cart in parallel → shows items grouped by category → cart-aware quantity steppers (syncs +/- with backend) |
| **CartPage.js** | Displays cart items with optimistic quantity updates → "Place Order" button calls `POST /api/orders/place` → redirects to OrderHistory |
| **OrderHistory.js** | Fetches `GET /api/orders/history` → shows order cards with visual timeline (PLACED → PREPARING → OUT_FOR_DELIVERY → DELIVERED) |
| **ProfilePage.js** | Fetches `GET /api/users/profile` → editable form for name + address (email read-only) → saves via `PUT /api/users/profile` |
| **AdminDashboard.js** | 4 tabs: Dashboard (stats + popular items), Restaurants (CRUD), Menu (CRUD per restaurant), Orders (status management) |
| **Navbar.js** | Shows role-appropriate links: CUSTOMER sees Restaurants/Cart/Orders, ADMIN sees Admin Panel, both see Profile avatar link |
| **ProtectedRoute.js** | Route guard wrapper — redirects to `/login` if no user, redirects to `/` if wrong role |
| **AuthContext.js** | React Context providing `{user, login, logout, isAdmin, isCustomer, loading}` globally |

### How Axios Works — Example with JWT Header

```javascript
// services/api.js — creates an Axios instance with interceptors

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
});

// REQUEST interceptor — automatically attaches JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE interceptor — auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Usage example (CartPage placing an order):**
```javascript
// The developer just writes this — JWT is attached automatically
await api.post('/orders/place');
// Axios interceptor adds: Authorization: Bearer eyJhbG...
// Actual HTTP request: POST http://localhost:8080/api/orders/place
```

### How Role-Based Routing Works (ProtectedRoute)

```javascript
// components/ProtectedRoute.js
const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;            // Still checking localStorage
  if (!user) return <Navigate to="/login" />; // Not logged in → login page
  if (requiredRole && user.role !== requiredRole)
    return <Navigate to="/" />;               // Wrong role → home page

  return <Outlet />;                          // ✅ Authorized → render child routes
};
```

**How it's used in App.js:**
```jsx
{/* Any authenticated user can access these */}
<Route element={<ProtectedRoute />}>
  <Route path="/restaurants" element={<RestaurantList />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/profile" element={<ProfilePage />} />
</Route>

{/* Only ADMIN can access this */}
<Route element={<ProtectedRoute requiredRole="ADMIN" />}>
  <Route path="/admin" element={<AdminDashboard />} />
</Route>
```

> **In one sentence:** The React frontend uses AuthContext for global state, Axios interceptors for automatic JWT attachment, and ProtectedRoute for role-based access control — with 9 pages covering the full customer and admin experience.

---

## 6. Key Design Decisions

### Why NeonDB (PostgreSQL) instead of MySQL?

1. **Cloud-native & serverless** — NeonDB is a managed PostgreSQL service that requires zero server setup, no local DB installation, and scales automatically
2. **Free tier** — generous free tier suitable for development and demos
3. **SSL by default** — encrypted connections out of the box (`sslmode=require`)
4. **PostgreSQL features** — native ENUM support, better JSON handling, and richer query capabilities than MySQL
5. **JPA compatibility** — Hibernate's `PostgreSQLDialect` provides full feature support

### Why JWT instead of session-based auth?

1. **Stateless** — no server-side session storage needed; token contains all auth info
2. **Scalable** — works across multiple server instances without sticky sessions
3. **Frontend-friendly** — token is stored in localStorage, easy to attach to every API call via Axios interceptor
4. **Decoupled** — backend doesn't need to maintain session state; just validate the signature
5. **Mobile-ready** — same token mechanism works for mobile apps later

### Why Spring Boot for the backend?

1. **Convention over configuration** — auto-configures DataSource, JPA, Security from `application.properties`
2. **Spring Data JPA** — generates repository implementations from interface method names (no SQL boilerplate)
3. **Spring Security** — production-grade auth framework with filter chain, role-based access
4. **Ecosystem** — Lombok (boilerplate reduction), Swagger/OpenAPI (API docs), Actuator (health checks)
5. **Industry standard** — widely used in enterprise Java development (relevant for HCL training)

### Why is @JsonIgnore used on certain entity relationships?

```java
// Cart.java
@JsonIgnore
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User user;
```

**Problem it solves:** Without `@JsonIgnore`, serializing a `Cart` to JSON would include the `User`, which includes their hashed password — a **security risk**. It also prevents infinite recursion: Cart → User → (some other entity that references back to Cart).

**Where it's used:**
- `Cart.user` — hides user details (including password) from cart JSON response
- `CartItem.cart` — prevents circular reference (CartItem → Cart → CartItem → ...)
- `OrderItem.order` — prevents circular reference (OrderItem → Order → OrderItem → ...)
- `MenuItem.restaurant` — prevents sending full restaurant data with every menu item

### Why is @Lazy used on JwtAuthFilter in SecurityConfig?

```java
// SecurityConfig.java
public SecurityConfig(@Lazy JwtAuthFilter jwtAuthFilter, ...) {
```

**Problem it solves:** There's a circular dependency:
```
SecurityConfig needs JwtAuthFilter (to add it to the filter chain)
JwtAuthFilter needs CustomUserDetailsService (to load user details)
CustomUserDetailsService needs UserRepository (Spring Data)
UserRepository needs DataSource (managed by Spring)
DataSource configuration might need SecurityConfig (for CSRF/session settings)
```

`@Lazy` tells Spring: "Don't create JwtAuthFilter immediately. Create a proxy first, and only instantiate the real bean when it's actually used." This breaks the circular dependency cycle.

> **In one sentence:** Every design choice — NeonDB for zero-ops hosting, JWT for stateless auth, Spring Boot for rapid development, @JsonIgnore for security, @Lazy for dependency resolution — solves a specific technical problem.

---

## 7. How to Think About This Project

### "How does your cart work?" — Complete Answer

```
FRONTEND CLICK → BACKEND LOGIC → DATABASE → RESPONSE

1. User clicks "+ Add" on a menu item (MenuPage.js)
2. MenuPage calls: api.post('/cart/add', { menuItemId: 5, quantity: 1 })
3. Axios interceptor attaches JWT token automatically

4. Backend: JwtAuthFilter validates JWT, extracts email
5. Backend: CartController.addItem() receives request
6. Backend: CartService.addItem(email, request):
   a. Finds User by email (UserRepository)
   b. Finds Cart by userId (CartRepository)
   c. Finds MenuItem by menuItemId (MenuItemRepository)
   d. Checks if this item already exists in cart:
      - YES → increments existing CartItem quantity
      - NO  → creates new CartItem with menuItem, quantity, unitPrice
   e. cartRepository.save(cart) — JPA cascades save to CartItems

7. Database: INSERT/UPDATE on cart_items table

8. Backend returns full Cart object (with all items) as JSON
9. Frontend: MenuPage rebuilds cartMap from response
   - cartMap[menuItemId] = { cartItemId, quantity }
   - "+ Add" button changes to a quantity stepper [- 1 +]

10. When user navigates to CartPage:
    - Fetches GET /api/cart
    - Displays all items with quantity controls
    - Optimistic updates: UI changes immediately, then syncs with server
```

### "How does role-based access work?" — Complete Answer

```
SECURITY IS ENFORCED AT 3 LEVELS:

Level 1: BACKEND — Spring Security (SecurityConfig.java)
┌────────────────────────────────────────────────────────┐
│ /api/auth/**          → permitAll()     (public)       │
│ /api/admin/**         → hasRole("ADMIN")               │
│ /api/dashboard/**     → hasRole("ADMIN")               │
│ everything else       → authenticated() (any role)     │
└────────────────────────────────────────────────────────┘

How roles are assigned:
- AuthService.register() hardcodes Role.CUSTOMER for all signups
- Admin accounts are created manually in the database
- CustomUserDetailsService adds "ROLE_" prefix:
  user.getRole() = ADMIN → authority = "ROLE_ADMIN"
  hasRole("ADMIN") in SecurityConfig checks for "ROLE_ADMIN"

Level 2: BACKEND — Registration Security (AuthService.java)
┌────────────────────────────────────────────────────────┐
│ user.setRole(Role.CUSTOMER);  // ALWAYS — ignores any  │
│                               // role field from request│
│ // Even if someone sends {"role":"ADMIN"} in the API   │
│ // call, the backend forces CUSTOMER                   │
└────────────────────────────────────────────────────────┘

Level 3: FRONTEND — ProtectedRoute (React)
┌────────────────────────────────────────────────────────┐
│ <ProtectedRoute />               → any logged-in user  │
│ <ProtectedRoute requiredRole="ADMIN" /> → admin only   │
│                                                        │
│ Navbar shows different links based on user.role:       │
│   CUSTOMER → Restaurants, Cart, Orders                 │
│   ADMIN    → Admin Panel                               │
│   Both     → Profile link                              │
└────────────────────────────────────────────────────────┘

Important: Frontend checks are for UX only (hide/show pages).
Real security is enforced by the backend — even if someone
manually navigates to /admin, the API calls will return 403.
```

### What would you improve if you had more time?

| Area | Improvement |
|------|-------------|
| **Payment Integration** | Add Razorpay/Stripe for real payment processing |
| **Real-time Updates** | WebSocket for live order status updates (instead of polling) |
| **Image Upload** | Allow admins to upload restaurant/menu images (currently URL-based) |
| **Pagination** | Add server-side pagination for restaurants, menu items, and orders |
| **Password Reset** | Email-based password reset flow |
| **Input Validation** | Add `@Valid` annotations with `jakarta.validation` constraints on DTOs |
| **Refresh Tokens** | JWT refresh token rotation for better security (current: single 24h token) |
| **Search API** | Server-side search endpoint (current search is client-side only) |
| **Unit Tests** | JUnit + Mockito tests for services, MockMvc tests for controllers |
| **Docker** | Dockerfile + docker-compose for one-command deployment |
| **Rate Limiting** | API rate limiting to prevent abuse |
| **Order Cancellation** | Allow customers to cancel orders within a time window |

> **In one sentence:** When explaining any feature, trace the flow from frontend click → Axios → JWT filter → controller → service → repository → database → response, and remember that real security is always enforced at the backend level, never just the frontend.

---

## API Endpoint Reference

### Public (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new customer |
| POST | `/api/auth/login` | Login, get JWT token |

### Authenticated (Any Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | List active restaurants |
| GET | `/api/restaurants/{id}` | Get restaurant by ID |
| GET | `/api/restaurants/{id}/menu` | Get available menu items |
| GET | `/api/cart` | Get current user's cart |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update/{itemId}` | Update cart item quantity |
| DELETE | `/api/cart/remove/{itemId}` | Remove item from cart |
| POST | `/api/orders/place` | Place order (converts cart → order) |
| GET | `/api/orders/history` | Get current user's orders |
| GET | `/api/users/profile` | Get current user's profile |
| PUT | `/api/users/profile` | Update name and address |

### Admin Only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/restaurants` | List ALL restaurants |
| POST | `/api/admin/restaurants` | Create restaurant |
| PUT | `/api/admin/restaurants/{id}` | Update restaurant |
| DELETE | `/api/admin/restaurants/{id}` | Delete restaurant |
| GET | `/api/admin/restaurants/{id}/menu` | Get ALL menu items |
| POST | `/api/admin/restaurants/{id}/menu` | Create menu item |
| PUT | `/api/admin/menu/{id}` | Update menu item |
| DELETE | `/api/admin/menu/{id}` | Delete menu item |
| GET | `/api/admin/orders` | Get all orders |
| PUT | `/api/admin/orders/{id}/status?status=X` | Update order status |
| GET | `/api/dashboard/stats` | Dashboard statistics |

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.x |
| Styling | Vanilla CSS | (glassmorphism, dark theme) |
| HTTP Client | Axios | with interceptors |
| Routing | React Router v6 | |
| Backend | Spring Boot | 3.x |
| Security | Spring Security + JWT | JJWT library |
| ORM | Spring Data JPA / Hibernate | |
| Database | PostgreSQL (NeonDB) | 15.x |
| Build Tool | Maven | (mvnw wrapper) |
| Language | Java 17+, JavaScript ES6+ | |

---

*Generated from actual source code analysis — every snippet, relationship, and flow described in this document reflects the real implementation.*
